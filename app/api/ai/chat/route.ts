import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MAX_IMAGE_BYTES = 12_000_000;

const SYSTEM_PROMPT =
  'You are NEBULA AI, an expert photo editor assistant inside a professional image editor. ' +
  'Give concise, actionable advice. When you recommend adjustment values, output them clearly. ' +
  'When asked for a caption or text, provide it on its own line prefixed with [TEXT].';

export async function POST(request: NextRequest) {
  // The key is read server-side only — it never reaches the client bundle.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI feature unavailable — check configuration' },
      { status: 503 }
    );
  }

  let prompt: string;
  let image: string | undefined;
  try {
    const body = await request.json();
    prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    image = typeof body.image === 'string' ? body.image : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const parts: Record<string, unknown>[] = [];
  if (image) {
    const match = image.match(/^data:([^;,]+);base64,(.+)$/);
    if (match && match[2].length <= MAX_IMAGE_BYTES) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }
  parts.push({ text: prompt });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'AI feature unavailable — check configuration' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!text) {
      return NextResponse.json(
        { error: 'AI feature unavailable — check configuration' },
        { status: 502 }
      );
    }

    return NextResponse.json({ content: text });
  } catch (err) {
    console.error('[ai/chat] request failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'AI feature unavailable — check configuration' },
      { status: 502 }
    );
  }
}