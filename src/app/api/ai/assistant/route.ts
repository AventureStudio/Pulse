import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { buildPrompt } from "@/lib/ai/prompts";
import { requireAuth } from "@/lib/supabase-api";
import type { AIAction, AIContext, AIResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const { action, context } = (await request.json()) as {
      action: AIAction;
      context: AIContext;
    };

    if (!action || !context) {
      return NextResponse.json({ error: "Missing action or context" }, { status: 400 });
    }

    const anthropic = getAnthropicClient();
    const { system, user } = buildPrompt(action, context);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });

    // Extract text content
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse JSON response
    const parsed = JSON.parse(textBlock.text);

    const response: AIResponse = {
      action,
      suggestions: parsed.suggestions,
      keyResults: parsed.keyResults,
      challenges: parsed.challenges,
      reformulation: parsed.reformulation,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("AI assistant error:", err);
    return NextResponse.json(
      { error: "Erreur assistant IA" },
      { status: 500 }
    );
  }
}
