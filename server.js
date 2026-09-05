const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

function buildFallback(orderText) {
  return `✅ Pedido recibido: "${orderText}".\n\nSugerencia rápida:\n- Revisar restaurante disponible\n- Confirmar precio y tiempo estimado\n- Finalizar pago`;
}

app.post("/api/order", async (req, res) => {
  const orderText = (req.body?.order || "").trim();

  if (!orderText) {
    return res.status(400).json({ error: "El pedido no puede estar vacío." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.json({ result: buildFallback(orderText), source: "fallback" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres un agente de pedidos de comida. Responde en español de forma clara y breve.",
        },
        {
          role: "user",
          content: `Cliente: ${orderText}`,
        },
      ],
    });

    const text = response.output_text?.trim();
    return res.json({
      result: text || buildFallback(orderText),
      source: "openai",
    });
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo procesar el pedido con IA.",
      details: error.message,
    });
  }
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`AI Food Order Agent running on http://localhost:${port}`);
});
