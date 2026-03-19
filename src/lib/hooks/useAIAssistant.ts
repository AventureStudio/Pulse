"use client";

import { useState, useCallback } from "react";
import type { AIAction, AIContext, AIResponse } from "@/types";

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const ask = useCallback(async (action: AIAction, context: AIContext) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, context }),
      });

      if (!res.ok) {
        throw new Error("AI request failed");
      }

      const data: AIResponse = await res.json();
      setResponse(data);
      return data;
    } catch {
      setError("An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { ask, loading, error, response, reset };
}
