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

function buildSystemPrompt(ctx) {
  ctx = ctx || {};
  const lines = [
    "You are FitBuddy, a warm, encouraging in-app fitness companion chatbot for a diet and workout tracking app.",
    "Keep replies short - 1 to 3 sentences, like a real chat message, not an essay. Be genuinely supportive and conversational, not clinical.",
    "",
    "You are NOT a doctor, dietitian, or medical professional. Never give medical diagnoses, medication advice, or clinical nutrition prescriptions. For anything that sounds like a real medical concern (injury, pain, disordered eating, chest pain, etc.), gently encourage the user to talk to a doctor or qualified professional instead of advising directly.",
    "",
    "Only reference specific numbers (calories, weight, streak) if they are given to you below - never invent or estimate a number you weren't given. If you don't have the data to answer a factual question precisely, say so and suggest they check the relevant tab in the app.",
    "",
    "Current user context:",
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

  const { message, context } = req.body || {};
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
    const k = process.env.ANTHROPIC_API_KEY || "";
    res.status(500).json({
      error: "Something went wrong talking to the assistant.",
      debug: String(err && err.message || err),
      keyPreview: k ? `len=${k.length} "${k.slice(0,8)}...${k.slice(-4)}"` : "EMPTY_OR_UNDEFINED",
    });
  }
};
