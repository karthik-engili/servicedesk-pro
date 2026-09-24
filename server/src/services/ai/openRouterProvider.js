import AiProvider from "./aiProvider.js";
import { buildAnalysisPrompt, buildSolutionDraftPrompt } from "./promptBuilder.js";

/**
 * Production OpenRouter HTTP AI Provider.
 * Communicates with OpenRouter chat completions endpoint using native fetch.
 */
export class OpenRouterProvider extends AiProvider {
  constructor({
    apiKey = process.env.OPENROUTER_API_KEY,
    model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
    baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    timeoutMs = parseInt(process.env.AI_TIMEOUT_MS, 10) || 10000,
  } = {}) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeoutMs = timeoutMs;
  }

  /**
   * Helper to execute chat completions request to OpenRouter.
   */
  async _callChatCompletion({ systemPrompt, userContent }) {
    const effectiveApiKey = this.apiKey !== undefined ? this.apiKey : (process.env.OPENROUTER_API_KEY || "");
    if (!effectiveApiKey || !effectiveApiKey.trim()) {
      const err = new Error("OpenRouter API key is not configured.");
      err.code = "AI_KEY_MISSING";
      throw err;
    }

    const effectiveModel = this.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
    const effectiveBaseUrl = (this.baseUrl || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
    const effectiveTimeout = this.timeoutMs || parseInt(process.env.AI_TIMEOUT_MS, 10) || 10000;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), effectiveTimeout);

    try {
      const response = await fetch(`${effectiveBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveApiKey.trim()}`,
          "HTTP-Referer": "https://servicedesk-pro.local",
          "X-Title": "ServiceDesk Pro AI Engine",
        },
        body: JSON.stringify({
          model: effectiveModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = `OpenRouter HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error?.message) {
            errorMsg = `OpenRouter error (${response.status}): ${errorBody.error.message}`;
          }
        } catch {
          // Ignore json parse error on error response
        }

        const err = new Error(errorMsg);
        err.status = response.status;
        err.code = response.status === 429 ? "AI_RATE_LIMITED" : "AI_HTTP_ERROR";
        throw err;
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content || "";

      return this._cleanAndParseJson(rawText);
    } catch (err) {
      if (err.name === "AbortError") {
        const timeoutErr = new Error(`AI request timed out after ${this.timeoutMs}ms.`);
        timeoutErr.code = "AI_TIMEOUT";
        throw timeoutErr;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Strips markdown fences and parses JSON safely.
   */
  _cleanAndParseJson(rawText) {
    if (!rawText || typeof rawText !== "string") {
      throw new Error("Empty or non-string response received from AI model.");
    }

    let cleaned = rawText.trim();

    // Remove markdown code fences if returned by the LLM
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
      cleaned = cleaned.replace(/\s*```$/, "");
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      // Attempt to extract the first balanced JSON object {...}
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (innerErr) {
          // Fall through
        }
      }
      const parseErr = new Error(`Failed to parse AI output as JSON: ${cleaned.slice(0, 100)}...`);
      parseErr.code = "AI_PARSE_ERROR";
      throw parseErr;
    }
  }

  async analyzeTicket({ ticket, articles = [], options = {} }) {
    const { systemPrompt, userContent } = buildAnalysisPrompt({ ticket, articles });
    const parsed = await this._callChatCompletion({ systemPrompt, userContent });

    return {
      category: parsed.category,
      categoryConfidence: parsed.categoryConfidence,
      priority: parsed.priority,
      priorityConfidence: parsed.priorityConfidence,
      riskLevel: parsed.riskLevel,
      risks: parsed.risks,
      escalationRecommended: parsed.escalationRecommended,
      escalationReason: parsed.escalationReason,
      suggestedArticles: parsed.suggestedArticles,
      solutionDraft: parsed.solutionDraft,
      reasoning: parsed.reasoning,
      aiAvailable: true,
      source: "openrouter",
      model: this.model,
    };
  }

  async classifyTicket({ ticket, options = {} }) {
    const analysis = await this.analyzeTicket({ ticket, articles: [], options });
    return {
      predictedCategory: analysis.category,
      confidence: analysis.categoryConfidence,
      reasoning: analysis.reasoning,
      aiAvailable: true,
      source: "openrouter",
    };
  }

  async recommendPriority({ ticket, options = {} }) {
    const analysis = await this.analyzeTicket({ ticket, articles: [], options });
    return {
      suggestedPriority: analysis.priority,
      confidence: analysis.priorityConfidence,
      reasoning: analysis.reasoning,
      aiAvailable: true,
      source: "openrouter",
    };
  }

  async generateSolution({ ticket, articles = [], options = {} }) {
    const { systemPrompt, userContent } = buildSolutionDraftPrompt({ ticket, articles });
    const parsed = await this._callChatCompletion({ systemPrompt, userContent });

    return {
      solutionDraft: parsed.solutionDraft,
      basedOnArticles: parsed.basedOnArticles || [],
      confidence: parsed.confidence || 0.8,
      aiAvailable: true,
      source: "openrouter",
      model: this.model,
    };
  }
}

export default new OpenRouterProvider();
