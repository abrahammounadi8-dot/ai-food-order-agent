require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const { rateLimit } = require("express-rate-limit");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_ORDER_LENGTH = Number(process.env.MAX_ORDER_LENGTH) || 500;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;

app.use(express.json({ limit: "16kb" }));
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a moment before trying again."
  }
});

const uiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS * 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please wait a moment before refreshing."
});

app.post("/api/order", apiLimiter, async (req, res) => {

  const order = typeof req.body?.order === "string" ? req.body.order.trim() : "";
  if (!order) {
    return res.status(400).json({ error: "Order text is required." });
  }

  if (order.length > MAX_ORDER_LENGTH) {
    return res.status(400).json({
      error: `Order is too long. Maximum length is ${MAX_ORDER_LENGTH} characters.`
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Server is missing OPENAI_API_KEY configuration." });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an AI food-order assistant. Respond in plain text with exactly these sections and headings in this order: 1) Order summary, 2) Estimated total (EUR range), 3) Dietary/religious constraints, 4) Questions to confirm, 5) Suggested next step. Keep it short and practical."
        },
        {
          role: "user",
          content: order
        }
      ],
      max_tokens: 450
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: "AI provider returned an empty response." });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("OpenAI request failed:", error?.message || error);
    return res.status(502).json({ error: "Failed to process order with AI provider." });
  }
});

app.get("/", uiLimiter, (_req, res) => {
  return res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(PORT, () => {
  console.log(`AI Food Ordering Agent listening on http://localhost:${PORT}`);
});
