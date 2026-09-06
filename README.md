# AI Food Ordering Agent

Simple AI food ordering MVP with a static frontend and an Express backend that calls OpenAI.

## Setup

1. Install dependencies:
   - `npm install`
2. Create your env file:
   - `cp .env.example .env`
3. Set `OPENAI_API_KEY` in `.env`.
4. Start the app:
   - `npm start`
5. Open:
   - `http://localhost:3000`

## API

- `POST /api/order`
  - Body: `{ "order": "I want a halal chicken burger meal under €20" }`
  - Returns: `{ "reply": "..." }`

The backend validates empty/too-long input and applies a basic per-IP rate limit.