// App Router Route Handler — server-only. API keys live here, never in the browser.
// POST /api/score  with body { type: "generate" | "score", payload: {...} }

import Anthropic from '@anthropic-ai/sdk';

// Switch provider via env var: LLM_PROVIDER=groq | anthropic  (default: groq)
const PROVIDER = process.env.LLM_PROVIDER || 'groq';

const ANTHROPIC_MODEL = 'claude-haiku-4-5';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// --- simple in-memory rate limit (per IP). Resets on cold start.
// For production, back this with a durable store (e.g. Upstash Redis).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const record = hits.get(ip) || { count: 0, start: now };
  if (now - record.start > WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }
  record.count++;
  hits.set(ip, record);
  return record.count > MAX_PER_WINDOW;
}

const GENERATE_SCHEMA = {
  type: 'object',
  properties: {
    vi: { type: 'string', description: 'The Vietnamese sentence' },
    hint: { type: 'string', description: 'Short English grammar/structure hint' },
  },
  required: ['vi', 'hint'],
  additionalProperties: false,
};

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', description: 'Score 0-100' },
    verdict: { type: 'string', description: 'Short phrase verdict' },
    feedback: { type: 'string', description: '2-3 sentences of specific, kind feedback in English' },
    correction: { type: 'string', description: 'One natural correct English translation' },
    errors: {
      type: 'array',
      items: { type: 'string' },
      description: 'Short error notes',
    },
  },
  required: ['score', 'verdict', 'feedback', 'correction', 'errors'],
  additionalProperties: false,
};

function buildRequest(body) {
  const { type, payload } = body;
  if (type === 'generate') {
    const { difficulty, difficultyDesc, topic, avoid } = payload;
    return {
      prompt: `Generate ONE Vietnamese sentence for an English-learning exercise.

Difficulty: ${difficulty} (${difficultyDesc})
Topic: ${topic}
Avoid sentences similar to these already used: ${JSON.stringify(avoid || [])}

The sentence must be natural, grammatically correct Vietnamese that a learner will translate INTO English.
Also include a short English grammar/structure hint.`,
      schema: GENERATE_SCHEMA,
    };
  }
  if (type === 'score') {
    const { vi, answer } = payload;
    return {
      prompt: `You are an English teacher grading a Vietnamese learner's translation.

Vietnamese sentence: "${vi}"
Student's English translation: "${answer}"

Score 0-100 on meaning accuracy, grammar, and natural phrasing. Be encouraging but honest.
Provide 2-3 sentences of specific, kind feedback in English, one natural correct English translation, and a short list of error notes.`,
      schema: SCORE_SCHEMA,
    };
  }
  return null;
}

async function callAnthropic(request) {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: request.prompt }],
    output_config: {
      format: { type: 'json_schema', schema: request.schema },
    },
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text block in response');
  return JSON.parse(textBlock.text);
}

async function callGroq(request) {
  // Groq supports JSON mode reliably; we embed the schema in the prompt so Llama
  // returns the exact shape we need.
  const systemPrompt = `You must respond with valid JSON matching exactly this schema:
${JSON.stringify(request.schema, null, 2)}

Respond ONLY with the JSON object, no other text.`;

  const r = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`Groq error ${r.status}: ${errText}`);
  }

  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in Groq response');
  return JSON.parse(content);
}

export async function POST(req) {
  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';
  if (rateLimited(ip)) {
    return Response.json(
      { error: 'Too many requests. Slow down a moment 🥺' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const request = buildRequest(body);
  if (!request)
    return Response.json({ error: 'Invalid request type' }, { status: 400 });

  if (PROVIDER === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'Server missing ANTHROPIC_API_KEY' },
      { status: 500 },
    );
  }
  if (PROVIDER === 'groq' && !process.env.GROQ_API_KEY) {
    return Response.json(
      { error: 'Server missing GROQ_API_KEY' },
      { status: 500 },
    );
  }

  try {
    const parsed =
      PROVIDER === 'groq' ? await callGroq(request) : await callAnthropic(request);
    return Response.json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Anthropic error ${err.status}:`, err.message);
      return Response.json({ error: 'AI service error' }, { status: 502 });
    }
    console.error(err);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
