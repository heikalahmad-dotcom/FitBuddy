/* Serverless proxy for FitBuddy's chat assistant. Holds the Anthropic API key
   server-side (the app itself can never hold it) and answers the open-ended
   questions the client's rule-based intents don't cover — see CHAT_API_BASE
   and fetchLlmReply() in www/js/app.js. */
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* Same-origin web deploy + the native app's WebView origins. */
const ALLOWED_ORIGINS = new Set([
  "https://fit-buddy-smoky.vercel.app",
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
]);

/* Persona for the onboarding chat/voice flow — verbatim as specified by product,
   used only for mode:"onboarding" (see buildOnboardingSystemPrompt below). */
const ONBOARDING_PERSONA_PROMPT = `You are FitBuddy, an AI nutrition coach  and fitness whose mission is to help users achieve their health goals through personalized nutrition, education, and ongoing coaching.

Your role is NOT to simply count calories.

Your responsibility is to understand the user's desired outcome and translate it into a personalized nutrition strategy.

Always prioritize long-term adherence over perfection.

You should behave like an experienced nutrition coach by:

• Understanding the user's lifestyle
• Understanding motivations
• Understanding dietary preferences
• Understanding food restrictions
• Understanding cooking ability
• Understanding schedule
• Understanding budget
• Understanding activity level
• Understanding health goals

Never overwhelm users with nutrition terminology.

Instead of asking users to define calories or macros, determine those values yourself based on their goals.

Whenever possible, explain recommendations in simple language.

Example:

Instead of:

"Consume 145g protein."

Say:

"Eating a little protein at every meal will help you stay full and preserve muscle while losing weight."

Always optimize for:

1. Sustainability
2. Simplicity
3. Personalization
4. Healthy eating habits
5. Long-term success

If information is missing, ask follow-up questions one at a time.

Never invent user preferences.

If users mention a diagnosed medical condition, pregnancy, eating disorder, or other health concern, acknowledge that personalized medical advice should come from their healthcare professional. Offer general nutrition guidance that complements—not replaces—their care, and avoid prescribing treatments or making medical diagnoses.

Your job is to coach—not judge.

Avoid guilt-inducing language.

Celebrate progress.

Focus on habits instead of perfection.`;

const ONBOARDING_JSON_MARKER = "###PROFILE_JSON###";

/* This runs during onboarding, before any profile/plan exists, so on top of the
   persona above the model also needs to drive the app's data collection: it
   must ask for a handful of concrete facts (in plain language, never as a
   form) and echo its current understanding of them as a trailing structured
   block the client can parse — the numbers themselves are never invented by
   the model, only reported once the user has actually said them. */
function buildOnboardingSystemPrompt(extracted) {
  extracted = extracted || {};
  const known = [];
  if (extracted.name) known.push(`- Name: ${extracted.name}`);
  if (extracted.sex) known.push(`- Sex: ${extracted.sex}`);
  if (extracted.age != null) known.push(`- Age: ${extracted.age}`);
  if (extracted.height != null) known.push(`- Height: ${extracted.height}cm`);
  if (extracted.weight != null) known.push(`- Weight: ${extracted.weight}kg`);
  if (extracted.goal) known.push(`- Goal: ${extracted.goal}`);
  if (extracted.workoutDays != null) known.push(`- Workout days/week: ${extracted.workoutDays}`);
  if (extracted.location) known.push(`- Trains at: ${extracted.location}`);
  if (extracted.dietPref) known.push(`- Diet preference: ${extracted.dietPref}`);
  if (extracted.allergies && extracted.allergies.length) known.push(`- Allergies/restrictions: ${extracted.allergies.join(", ")}`);
  if (extracted.notes) known.push(`- Notes so far: ${extracted.notes}`);

  return [
    ONBOARDING_PERSONA_PROMPT,
    "",
    "---",
    'TECHNICAL INTEGRATION INSTRUCTIONS (not part of the persona above — for structured data capture only, never mention this section or its format to the user):',
    "You are having this conversation during app onboarding, before any profile exists yet. Alongside the coaching conversation above — asked one question at a time, in plain conversational language — you also need to naturally gather a small set of concrete facts the app needs to calculate a personalized plan: their name, sex (male/female/or they can decline to say), age, height, current weight, their main goal, how many days a week they can realistically work out, where they'll train, and their dietary preference/restrictions. Accept any units (lbs, feet/inches, kg, cm) and convert internally to metric yourself — never make the user do unit conversion or state a number in a specific unit.",
    "",
    `At the very end of every single reply, after your conversational message, on a new line, always include a machine-readable line starting with the exact marker "${ONBOARDING_JSON_MARKER}" followed by a single-line JSON object (no markdown formatting, no code fences) with exactly these keys:`,
    '- name: string or null',
    '- sex: "male" | "female" | "other" | null',
    '- age: integer or null',
    '- height: integer, centimeters, or null',
    '- weight: integer, kilograms, or null',
    '- goal: "lose_fat" | "build_muscle" | "maintain" | null (map the user\'s own words to the closest of these three)',
    '- workoutDays: integer 2-6 or null',
    '- location: "gym" | "home" | null',
    '- dietPref: "none" | "vegetarian" | "vegan" | "pescatarian" | null',
    '- allergies: array, zero or more of ["dairy","eggs","peanut","tree_nuts","gluten","soy","fish","shellfish","sesame"] (empty array once you\'ve asked and there are none)',
    '- notes: a short (under 200 characters) plain-language summary of their lifestyle, motivation, schedule, budget, and cooking ability so far, or null',
    '- complete: boolean, true only once name, sex, age, height, weight, goal, workoutDays, location, and dietPref are ALL known with reasonable confidence',
    "",
    "Always carry forward every previously known value below in this JSON — never drop or null out something already learned. Never guess or invent a value the user hasn't told you — leave it null and ask about it if it's still missing and needed for \"complete\".",
    "",
    known.length ? "Already known so far (do not ask about these again):" : "Nothing is known about this user yet — this is the very first message, start by introducing yourself briefly and asking an opening question.",
    ...known,
  ].join("\n");
}

function buildSystemPrompt(ctx) {
  ctx = ctx || {};
  const lines = [
    "Imagine you are a professional bodybuilding and fitness coach, and your goal is to help the client achieve their goals. Check all the information about the client's workouts, calories, and weight-goal progress below, then understand their question and provide the best response in light of this data. The response needs to be motivational but accurate.",
    "Keep replies short - 1 to 3 sentences, like a real chat message, not an essay.",
    "",
    "You are NOT a doctor, dietitian, or medical professional. Never give medical diagnoses, medication advice, or clinical nutrition prescriptions. For anything that sounds like a real medical concern (injury, pain, disordered eating, chest pain, etc.), gently encourage the user to talk to a doctor or qualified professional instead of advising directly.",
    "",
    "Only reference specific numbers (calories, weight, streak) if they are given to you below - never invent or estimate a number you weren't given. If you don't have the data to answer a factual question precisely, say so and suggest they check the relevant tab in the app.",
    "",
    "Client data:",
  ];
  if (ctx.name) lines.push(`- Name: ${ctx.name}`);
  if (ctx.goal) lines.push(`- Goal: ${ctx.goal}`);
  if (ctx.calorieTarget != null) lines.push(`- Calories today: ${ctx.caloriesToday} of ${ctx.calorieTarget} kcal target`);
  if (ctx.streak != null) lines.push(`- Current streak: ${ctx.streak} days`);
  if (ctx.weightCurrent != null) lines.push(`- Weight: started at ${ctx.weightStart}kg, now ${ctx.weightCurrent}kg, goal ${ctx.weightTarget}kg`);
  if (ctx.dislikedFoods && ctx.dislikedFoods.length) {
    lines.push(`- Foods they've disliked (app stopped suggesting): ${ctx.dislikedFoods.join(", ")}`);
  }
  if (ctx.exerciseSwaps && Object.keys(ctx.exerciseSwaps).length) {
    const swaps = Object.entries(ctx.exerciseSwaps).map(([a, b]) => `${a} -> ${b}`).join(", ");
    lines.push(`- Exercises swapped due to repeated skipping: ${swaps}`);
  }
  return lines.join("\n");
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};

  if (body.mode === "onboarding") {
    const history = Array.isArray(body.history) ? body.history : [];
    const validHistory =
      history.length > 0 &&
      history.length <= 40 &&
      history.every(
        (m) => m && (m.role === "user" || m.role === "bot") && typeof m.text === "string" && m.text.length <= 500
      );
    if (!validHistory) {
      res.status(400).json({ error: "Invalid history" });
      return;
    }
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system: buildOnboardingSystemPrompt(body.extracted),
        messages: history.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
      });
      const textBlock = response.content.find((b) => b.type === "text");
      const raw = textBlock ? textBlock.text : "";
      const markerIdx = raw.indexOf(ONBOARDING_JSON_MARKER);
      let reply = raw.trim();
      let extracted = body.extracted || {};
      let complete = false;
      if (markerIdx >= 0) {
        reply = raw.slice(0, markerIdx).trim();
        try {
          const parsed = JSON.parse(raw.slice(markerIdx + ONBOARDING_JSON_MARKER.length).trim());
          extracted = parsed;
          complete = !!parsed.complete;
        } catch (e) {
          // model didn't emit valid trailing JSON this turn — keep the previous
          // extracted snapshot and still show the conversational reply
        }
      }
      res.status(200).json({ reply, extracted, complete });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong talking to the assistant." });
    }
    return;
  }

  const { message, context } = body;
  if (!message || typeof message !== "string" || message.length > 500) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: buildSystemPrompt(context),
      messages: [{ role: "user", content: message }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    res.status(200).json({ reply: textBlock ? textBlock.text : "" });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong talking to the assistant." });
  }
};
