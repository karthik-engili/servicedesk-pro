import AiProvider from "./aiProvider.js";
import { CATEGORY_COMPATIBILITY } from "../../utils/constants.js";

/**
 * Deterministic Mock AI Provider used specifically for automated testing and CI.
 * Produces structured AI responses without making network requests.
 */
export class MockAiProvider extends AiProvider {
  constructor(name = "mock-ai-v1") {
    super();
    this.name = name;
  }

  async analyzeTicket({ ticket, articles = [], options = {} }) {
    const text = `${ticket.title || ""} ${ticket.description || ""}`.toLowerCase();

    let category = "GENERAL";
    let categoryConfidence = 0.85;
    let reasoning = "Mock AI: Classified as GENERAL based on standard inquiry signals.";

    const hasCredentialOrAccount = /\b(password|reset|mfa|otp|2fa|login|locked out|account locked|locked account|user locked|account|credentials|unlock|active directory|compromised account|account compromise|credential leak|credential leakage|credential compromise|stolen credentials|identity|sso)\b/i.test(text);
    const hasBroadSecurityThreat = /\b(ransomware|phishing|malware|trojan|cyber|breach|virus|exploit)\b/i.test(text);

    if (hasBroadSecurityThreat && !/\b(password|credential|compromised account|account compromise|stolen credentials|credential leak|credential leakage)\b/i.test(text)) {
      category = "GENERAL";
      categoryConfidence = 0.90;
      reasoning = "Mock AI: Security threat domain mapped to GENERAL ticket category with elevated risk detection.";
    } else if (hasCredentialOrAccount) {
      category = "ACCESS";
      categoryConfidence = 0.94;
      reasoning = "Mock AI: Ticket specifies user authentication, credentials, or account access.";
    } else if (hasBroadSecurityThreat) {
      category = "GENERAL";
      categoryConfidence = 0.90;
      reasoning = "Mock AI: Security threat domain mapped to GENERAL ticket category with elevated risk detection.";
    } else if (/\b(keyboard|display|screen|laptop|monitor|printer|hardware|dock|mouse)\b/i.test(text)) {
      category = "HARDWARE";
      categoryConfidence = 0.91;
      reasoning = "Mock AI: Ticket mentions hardware equipment and peripheral diagnostics.";
    } else if (/\b(wifi|wi-fi|vpn|network|dns|internet|connection)\b/i.test(text)) {
      category = "NETWORK";
      categoryConfidence = 0.89;
      reasoning = "Mock AI: Ticket reports network connectivity, VPN, or router issues.";
    } else if (/\b(software|bug|crash|install|license|app)\b/i.test(text)) {
      category = "SOFTWARE";
      categoryConfidence = 0.87;
      reasoning = "Mock AI: Ticket references software application installation or malfunction.";
    }

    let priority = "MEDIUM";
    let priorityConfidence = 0.80;
    if (/\b(ransomware|breach|outage|all users|entire company|production down|credential leak|credential leakage|credential compromise|compromised account|account compromise|phishing)\b/i.test(text)) {
      priority = "CRITICAL";
      priorityConfidence = 0.95;
    } else if (/\b(urgent|asap|cannot work|high priority|blocked)\b/i.test(text)) {
      priority = "HIGH";
      priorityConfidence = 0.88;
    } else if (/\b(minor|typo|question|how to|low priority)\b/i.test(text)) {
      priority = "LOW";
      priorityConfidence = 0.82;
    }

    let riskLevel = "LOW";
    const risks = [];
    let escalationRecommended = false;
    let escalationReason = "";

    if (/\b(phishing|malware|ransomware|compromised|hacked|credential leak|credential leakage|credential compromise|compromised account|account compromise|leakage|stolen credentials)\b/i.test(text)) {
      riskLevel = "CRITICAL";
      risks.push("Potential security incident detected by mock analyzer");
      escalationRecommended = true;
      escalationReason = "Security threat signals detected; recommend human security review.";
    } else if (/\b(outage|all users)\b/i.test(text)) {
      riskLevel = "HIGH";
      risks.push("Widespread service impairment");
      escalationRecommended = true;
      escalationReason = "Multiple users affected; operational escalation recommended.";
    }

    const compatibleArticles = articles.filter((cand) => {
      const art = cand.article || cand;
      const compatibleCats = (CATEGORY_COMPATIBILITY[category] || [category]).map((c) => c.toUpperCase());
      return compatibleCats.includes((art.category || "").toUpperCase()) || category === "GENERAL";
    });

    const suggestedArticles = compatibleArticles.slice(0, 5).map((cand) => {
      const art = cand.article || cand;
      return {
        articleId: art._id,
        title: art.title,
        relevance: 0.88,
        reason: `Mock AI: High conceptual similarity with ${category} incident.`,
      };
    });

    const topArticle = compatibleArticles[0]?.article || compatibleArticles[0];
    const solutionDraft = topArticle
      ? `Mock AI Solution Draft: Based on verified knowledge article "${topArticle.title}": 1. Verify user device status. 2. Follow documented internal checklist. 3. Escalate if unresolved.`
      : `Mock AI Solution Draft: Standard initial troubleshooting recommended. No matching internal article detected for ${category} symptoms.`;

    return {
      category,
      categoryConfidence,
      priority,
      priorityConfidence,
      riskLevel,
      risks,
      escalationRecommended,
      escalationReason,
      suggestedArticles,
      solutionDraft,
      reasoning,
      aiAvailable: true,
      source: "mock_provider",
    };
  }

  async classifyTicket({ ticket, options = {} }) {
    const analysis = await this.analyzeTicket({ ticket, articles: [], options });
    return {
      predictedCategory: analysis.category,
      confidence: analysis.categoryConfidence,
      reasoning: analysis.reasoning,
      aiAvailable: true,
      source: "mock_provider",
    };
  }

  async recommendPriority({ ticket, options = {} }) {
    const analysis = await this.analyzeTicket({ ticket, articles: [], options });
    return {
      suggestedPriority: analysis.priority,
      confidence: analysis.priorityConfidence,
      reasoning: analysis.reasoning,
      aiAvailable: true,
      source: "mock_provider",
    };
  }

  async generateSolution({ ticket, articles = [], options = {} }) {
    const analysis = await this.analyzeTicket({ ticket, articles, options });
    return {
      solutionDraft: analysis.solutionDraft,
      basedOnArticles: analysis.suggestedArticles.map((a) => a.articleId),
      confidence: 0.85,
      aiAvailable: true,
      source: "mock_provider",
    };
  }
}

export default new MockAiProvider();
