import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/chat
 *
 * This serverless function runs on Vercel's servers, never in the visitor's
 * browser. It reads ANTHROPIC_API_KEY from an environment variable (set in
 * the Vercel dashboard, not committed to git) and forwards the chat request
 * to Anthropic's API. The frontend (src/lib/api.ts) only ever talks to this
 * endpoint — it never sees the real API key.
 *
 * Body expected from the frontend: { system: string, messages: ChatMessage[] }
 */

interface ChatRequestBody {
  system?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        message:
          "Server is missing ANTHROPIC_API_KEY. Set it in the Vercel project's Environment Variables.",
      },
    });
  }

  const body = req.body as ChatRequestBody;
  const { system, messages } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: "messages array is required" } });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await upstream.json();

    // Forward Anthropic's status code and body as-is. The frontend already
    // knows how to interpret error/rate-limit shapes (see src/lib/errors.ts).
    return res.status(upstream.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach Anthropic's API.";
    return res.status(502).json({ error: { message } });
  }
}
