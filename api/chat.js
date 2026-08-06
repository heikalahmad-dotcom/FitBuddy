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

/* Prompt for the post-onboarding Nutrition Plan Generator — content and intent
   preserved verbatim from product's spec (typos/caps fixed, flattened numbered
   list re-structured into its actual nested form: 13 strategy components, then
   goal-specific prioritization guidance, then general principles), used only
   for mode:"nutritionPlan" (see buildNutritionPlanPrompt below). */
const NUTRITION_STRATEGY_PROMPT = `Using the collected profile, create a personalized nutrition strategy. The strategy should include:

1. Daily calorie target
2. Protein target
3. Carbohydrate target
4. Fat target
5. Fiber target
6. Water goal
7. Meal timing recommendation
8. Weekly goals
9. Grocery recommendations
10. Foods to prioritize
11. Foods to reduce
12. Restaurant guide
13. Healthy substitutions

The recommendation should match the user's primary goal. For example:
- Weight loss prioritizes: calorie deficit, protein and fiber, satiety.
- Muscle gain prioritizes: protein, calorie surplus, recovery, meal timing.
- Athletic performance prioritizes: carbohydrates, hydration, and recovery nutrition.
- Heart health prioritizes: fiber, unsaturated fats, lower sodium, whole grains.

Always explain why each recommendation exists. Avoid generic advice — tailor every recommendation to the user's lifestyle. If the user hates cooking, recommend simple meals. If they travel often, recommend portable options. If they have children, generate family-friendly meals. Never generate unrealistic meal plans. Assume adherence is more important than optimization.`;

/* This is a one-shot generation (not a conversation), so on top of the prompt
   above the model just needs to know the client's profile and the six
   already-computed numeric targets — it must report those exactly, not
   recalculate them, and spend its own judgment on the seven qualitative
   fields instead (which is where personalization actually happens). */
function buildNutritionPlanPrompt(profile, targets) {
  profile = profile || {};
  targets = targets || {};
  const goalLabel =
    { lose_fat: "Lose fat & get lean", build_muscle: "Build muscle", maintain: "Maintain & recomp" }[profile.goal] ||
    profile.goal ||
    "unknown";

  const lines = [
    NUTRITION_STRATEGY_PROMPT,
    "",
    "---",
    "TECHNICAL INTEGRATION INSTRUCTIONS (not part of the prompt above — for structured output only, never mention this section to the user):",
    "Respond with ONLY a single JSON object — no markdown code fences, no commentary before or after it. Use exactly these keys:",
    "- calories: number (kcal) — use the exact value given below, do not recalculate it",
    "- protein: number (grams) — use the exact value given below",
    "- carbs: number (grams) — use the exact value given below",
    "- fat: number (grams) — use the exact value given below",
    "- fiber: number (grams) — use the exact value given below",
    "- water: number (liters/day) — use the exact value given below",
    "- mealTiming: string, 1-3 sentences, plain language, no jargon, include a brief reason why",
    "- weeklyGoals: array of 3-5 short strings, each a specific and achievable weekly goal with a brief reason why",
    "- groceryRecommendations: array of 6-10 short grocery items or categories",
    "- foodsToPrioritize: array of 5-8 short strings naming foods or food groups, each with a brief reason why",
    "- foodsToReduce: array of 4-6 short strings naming foods or food groups to cut back on, each with a brief reason why",
    "- restaurantGuide: array of 3-5 short, practical tips for eating out while staying on track with this specific goal",
    "- healthySubstitutions: array of 4-6 short strings, each in the form \"swap X for Y — because Z\"",
    "",
    `Every field must directly support the client's PRIMARY GOAL below (${goalLabel}) — tailor the specifics to that goal using the weight-loss/muscle-gain/athletic-performance/heart-health prioritization guidance above where it applies, not generic advice.`,
    "Only reference lifestyle specifics (cooking ability, travel frequency, family/children) if they're mentioned in the notes below — otherwise give solid goal- and diet-tailored advice without assuming those details. Keep every suggested meal or substitution realistic and easy to actually stick with — adherence matters more than theoretical optimization.",
    "",
    "Client profile:",
    `- Name: ${profile.name || "unknown"}`,
    `- Primary goal: ${goalLabel}`,
    profile.sex ? `- Sex: ${profile.sex}` : null,
    profile.age != null ? `- Age: ${profile.age}` : null,
    profile.height != null ? `- Height: ${profile.height}cm` : null,
    profile.weight != null ? `- Weight: ${profile.weight}kg` : null,
    profile.targetWeight != null ? `- Target weight: ${profile.targetWeight}kg` : null,
    profile.workoutDays != null ? `- Workout days/week: ${profile.workoutDays}` : null,
    profile.location ? `- Trains at: ${profile.location}` : null,
    profile.dietPref ? `- Diet preference: ${profile.dietPref}` : null,
    profile.allergies && profile.allergies.length ? `- Allergies/restrictions: ${profile.allergies.join(", ")}` : null,
    profile.coachNotes ? `- Lifestyle notes: ${profile.coachNotes}` : null,
    "",
    "Already-computed targets (use these exact numbers, do not recalculate):",
    `- Calories: ${targets.calories} kcal`,
    `- Protein: ${targets.protein} g`,
    `- Carbs: ${targets.carbs} g`,
    `- Fat: ${targets.fat} g`,
    `- Fiber: ${targets.fiber} g`,
    `- Water: ${targets.water} L`,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

/* Best-effort JSON extraction: the model is instructed to return pure JSON,
   but if it wraps it in a code fence or adds stray text around it anyway,
   fall back to the first {...} block before giving up. */
function tryParseJsonLoose(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // fall through
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (e) {
      // fall through
    }
  }
  return null;
}

/* Used for mode:"mealLog" — turns a spoken (or typed) free-form meal
   description into a structured calorie/macro estimate, letting a user
   just say what they ate instead of typing a food name + weighing it. */
const MEAL_LOG_PROMPT = `You are a nutrition estimation assistant. The user will describe, in their own words, a meal or food they just ate — often spoken aloud, so it may be casual or run-on. Identify what they ate and estimate realistic total calories and macros for the full portion described, using typical serving sizes when they don't give exact amounts.

Respond with ONLY a single JSON object — no markdown code fences, no commentary before or after it. Use exactly these keys:
- name: a short, clean label for what they ate (e.g. "Turkey sandwich & side salad"), max 60 characters
- calories: integer, kcal, for the whole thing they described
- protein: integer, grams
- carbs: integer, grams
- fat: integer, grams

Always return your best realistic estimate, even for vague descriptions — never ask a follow-up question, never refuse, never return placeholder or zero values.`;

/* Used for mode:"rebalance" — the weekly rebalance agent (evaluateRebalance
   in www/js/app.js) decides ALL the numbers itself (calorie adjustment,
   whether to add cardio) with zero LLM involvement; this call only turns
   that already-made decision into a short, encouraging explanation. The
   model never sees enough to invent a different number even if it wanted to. */
const REBALANCE_PROMPT = `You are a professional fitness and nutrition coach explaining a small automatic adjustment to a client's plan, made after a weekly progress check-in. Explain WHY this specific change makes sense in 1-3 short sentences, like a real chat message — warm and encouraging, never shaming or judgmental, framed as normal course-correction rather than a failure. Only reference the numbers given to you below — never invent or estimate one you weren't given.`;

function buildRebalancePrompt(profile, decision) {
  profile = profile || {};
  decision = decision || {};
  const goalLabel =
    { lose_fat: "Lose fat & get lean", build_muscle: "Build muscle", maintain: "Maintain & recomp" }[profile.goal] ||
    profile.goal ||
    "unknown";
  const lines = [
    REBALANCE_PROMPT,
    "",
    "Respond with ONLY a single JSON object — no markdown code fences, no commentary. Use exactly this key:",
    "- explanation: string, 1-3 short sentences",
    "",
    `Client goal: ${goalLabel}`,
    `Reason for this check-in: ${decision.reason}`,
  ];
  if (decision.actualRate != null) lines.push(`- Actual rate of change: ${Number(decision.actualRate).toFixed(2)} kg/week`);
  if (decision.targetRate != null) lines.push(`- Target rate: ${decision.targetRate} kg/week`);
  if (decision.calorieAdjustment) {
    lines.push(`- Calorie adjustment: ${decision.calorieAdjustment > 0 ? "+" : ""}${decision.calorieAdjustment} kcal/day (new target: ${decision.newCalories} kcal)`);
  }
  if (decision.addCardio && decision.cardio) {
    lines.push(`- Adding cardio: ${decision.cardio.name} (${decision.cardio.scheme})`);
  }
  if (decision.reason === "low_adherence" && decision.adherence) {
    lines.push(
      `- No numeric changes this week — the focus is on consistency (meal logging rate: ${Math.round((decision.adherence.mealRate || 0) * 100)}%, workout completion: ${Math.round((decision.adherence.workoutRate || 0) * 100)}%)`
    );
  }
  return lines.join("\n");
}

function buildSystemPrompt(ctx) {
  ctx = ctx || {};
  const lines = [
    "Imagine you are a professional bodybuilding and fitness coach, and your goal is to help the client achieve their goals.",
    "Every conversation should help the user make one better decision. Do not simply answer questions - coach.",
    "",
    "Examples:",
    'User: "I want pizza." Poor response: "Pizza has 700 calories." Good response: "You can absolutely have pizza today. Two slices fit comfortably into today\'s calorie target. To help you stay on track, I\'d recommend adding a side salad or choosing a higher-protein topping."',
    'User: "I skipped breakfast." Good response: "No problem. Let\'s rebalance the rest of your day instead of trying to \'make up\' for it."',
    'User: "I hate broccoli." Good response: "No problem. I\'ll stop recommending broccoli. Would you rather have asparagus, green beans, Brussels sprouts, or spinach?"',
    'User: "I\'m traveling." Good response: "I\'ll temporarily switch your meal plan to restaurant-friendly options until you\'re home."',
    "",
    "Always: Encourage. Never shame. Never guilt. Never criticize. Celebrate consistency. Use positive reinforcement. Adapt the nutrition plan as new preferences are learned. Remember previously stated likes and dislikes during the conversation. If a user repeatedly ignores recommendations, change the plan instead of blaming the user. The goal is long-term adherence.",
    "",
    "Check all the information about the client's workouts, calories, and weight-goal progress below, then understand their question and provide the best response in light of this data. The response needs to be motivational but accurate.",
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

  if (body.mode === "mealLog") {
    const transcript = body.transcript;
    if (!transcript || typeof transcript !== "string" || transcript.length > 300) {
      res.status(400).json({ error: "Invalid transcript" });
      return;
    }
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 200,
        system: MEAL_LOG_PROMPT,
        messages: [{ role: "user", content: transcript }],
      });
      const textBlock = response.content.find((b) => b.type === "text");
      const raw = textBlock ? textBlock.text.trim() : "";
      const cleaned = raw.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      const estimate = tryParseJsonLoose(cleaned);
      if (!estimate) {
        res.status(500).json({ error: "Could not parse meal estimate." });
        return;
      }
      res.status(200).json({ estimate });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong estimating that meal." });
    }
    return;
  }

  if (body.mode === "nutritionPlan") {
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 900,
        system: buildNutritionPlanPrompt(body.profile, body.targets),
        messages: [{ role: "user", content: "Generate my nutrition strategy now." }],
      });
      const textBlock = response.content.find((b) => b.type === "text");
      const raw = textBlock ? textBlock.text.trim() : "";
      const cleaned = raw.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      const strategy = tryParseJsonLoose(cleaned);
      if (!strategy) {
        // TEMP DEBUG — remove once root cause is confirmed
        res.status(500).json({
          error: "Could not parse nutrition strategy.",
          debugStopReason: response.stop_reason,
          debugRawLength: raw.length,
          debugRawTail: raw.slice(-200),
        });
        return;
      }
      res.status(200).json({ strategy });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong generating the nutrition strategy.", debugMessage: String(err && err.message) });
    }
    return;
  }

  if (body.mode === "rebalance") {
    try {
      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        system: buildRebalancePrompt(body.profile, body.decision),
        messages: [{ role: "user", content: "Explain this week's adjustment." }],
      });
      const textBlock = response.content.find((b) => b.type === "text");
      const raw = textBlock ? textBlock.text.trim() : "";
      const cleaned = raw.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      const parsed = tryParseJsonLoose(cleaned);
      if (!parsed || !parsed.explanation) {
        res.status(500).json({ error: "Could not generate explanation." });
        return;
      }
      res.status(200).json({ explanation: parsed.explanation });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong generating the explanation." });
    }
    return;
  }

  const { message, context, history } = body;

  // The client now sends the full conversation (history) so follow-up
  // questions actually have memory of what was just discussed - a bare
  // single `message` (no history) is still accepted for backward
  // compatibility, treated as a fresh one-turn conversation.
  let messages;
  if (Array.isArray(history) && history.length > 0) {
    const validHistory =
      history.length <= 40 &&
      history.every(
        (m) => m && (m.role === "user" || m.role === "bot") && typeof m.text === "string" && m.text.length <= 500
      );
    if (!validHistory) {
      res.status(400).json({ error: "Invalid history" });
      return;
    }
    messages = history.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
  } else {
    if (!message || typeof message !== "string" || message.length > 500) {
      res.status(400).json({ error: "Invalid message" });
      return;
    }
    messages = [{ role: "user", content: message }];
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: buildSystemPrompt(context),
      messages,
    });
    const textBlock = response.content.find((b) => b.type === "text");
    res.status(200).json({ reply: textBlock ? textBlock.text : "" });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong talking to the assistant." });
  }
};
