import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../../utils/constants.js";

/**
 * Production deterministic local fallback intelligence engine.
 * Used when OpenRouter is unavailable, disabled, rate-limited, or unconfigured.
 */
class LocalRuleFallback {
  classifyCategory(ticket) {
    const text = `${ticket.title || ""} ${ticket.description || ""} ${ticket.asset?.name || ""} ${ticket.asset?.category || ""}`.toLowerCase();

    const hasCredentialOrAccount = /\b(password|reset|mfa|otp|2fa|login|locked out|account locked|locked account|user locked|account|permission|credentials|unlock|active directory|compromised account|account compromise|credential leak|credential leakage|credential compromise|stolen credentials|identity|sso)\b/i.test(text);
    const hasBroadSecurityThreat = /\b(ransomware|malware|virus|trojan|phishing|breach|cyber|security incident|payload|macro virus|exploit|threat)\b/i.test(text);

    // 1. Broad Security Threats (ransomware, malware, virus, phishing) without credential compromise -> GENERAL
    if (hasBroadSecurityThreat && !/\b(password|credential|compromised account|account compromise|stolen credentials|credential leak|credential leakage)\b/i.test(text)) {
      return {
        category: "GENERAL",
        confidence: 0.88,
        reasoning: "Rule fallback: Security threat domain mapped to GENERAL ticket category with elevated risk detection.",
      };
    }

    // 2. Account / Credential / Access Security & Auth keywords -> ACCESS
    if (hasCredentialOrAccount) {
      return {
        category: "ACCESS",
        confidence: 0.90,
        reasoning: "Rule fallback: Ticket describes authentication, credentials, account security, or access permissions.",
      };
    }

    // 3. Security threats that did involve credentials -> ACCESS (already caught above) or broad threats -> GENERAL
    if (hasBroadSecurityThreat) {
      return {
        category: "GENERAL",
        confidence: 0.88,
        reasoning: "Rule fallback: Security threat domain mapped to GENERAL ticket category with elevated risk detection.",
      };
    }

    // 4. Hardware keywords (including printer, display, accessories)
    if (
      /\b(laptop|desktop|keyboard|monitor|screen|display|mouse|printer|hardware|battery|charger|dock|docking|hdmi|cable|fan|overheating)\b/i.test(
        text
      )
    ) {
      return {
        category: "HARDWARE",
        confidence: 0.88,
        reasoning: "Rule fallback: Ticket indicates physical hardware, peripheral, or workstation issue.",
      };
    }

    // 5. Network keywords
    if (
      /\b(vpn|wi-fi|wifi|network|dns|ethernet|internet|connection|router|switch|gateway|ip address|firewall|latency)\b/i.test(
        text
      )
    ) {
      return {
        category: "NETWORK",
        confidence: 0.88,
        reasoning: "Rule fallback: Ticket indicates connectivity, Wi-Fi, VPN, or network routing issue.",
      };
    }

    // 5. Software keywords
    if (
      /\b(software|crash|crashed|bug|install|installation|update|license|application|app|excel|outlook|teams|slack|browser|zoom)\b/i.test(
        text
      )
    ) {
      return {
        category: "SOFTWARE",
        confidence: 0.85,
        reasoning: "Rule fallback: Ticket indicates operating system, application crash, or software install.",
      };
    }

    return {
      category: "GENERAL",
      confidence: 0.65,
      reasoning: "Rule fallback: No specific category keywords detected; assigned standard GENERAL category.",
    };
  }

  recommendPriority(ticket) {
    const text = `${ticket.title || ""} ${ticket.description || ""}`.toLowerCase();

    // Critical impact triggers
    if (
      /\b(ransomware|breach|outage|all users|entire company|production down|critical server|data loss|database down|phishing|compromised account|account compromise|credential leak|credential leakage|credential compromise|stolen credentials)\b/i.test(
        text
      )
    ) {
      return {
        priority: "CRITICAL",
        confidence: 0.92,
        reasoning: "Rule fallback: Critical signals detected indicating widespread outage, data loss, or severe security threat.",
      };
    }

    // High impact triggers
    if (
      /\b(urgent|asap|cannot work|department down|vpn down|executive|multiple users|payroll|blocked)\b/i.test(
        text
      )
    ) {
      return {
        priority: "HIGH",
        confidence: 0.85,
        reasoning: "Rule fallback: Urgency indicators or department-level impairment detected.",
      };
    }

    // Low impact triggers
    if (
      /\b(minor|typo|question|how to|inquiry|whenever you can|low priority|non-urgent)\b/i.test(
        text
      )
    ) {
      return {
        priority: "LOW",
        confidence: 0.80,
        reasoning: "Rule fallback: Inquiry or low business impact indicated in ticket description.",
      };
    }

    return {
      priority: "MEDIUM",
      confidence: 0.75,
      reasoning: "Rule fallback: Standard operational incident; recommended MEDIUM priority.",
    };
  }

  detectRisks(ticket) {
    const text = `${ticket.title || ""} ${ticket.description || ""}`.toLowerCase();
    const risks = [];
    let riskLevel = "LOW";
    let escalationRecommended = false;
    let escalationReason = "";

    // Security risk
    if (
      /\b(phishing|malware|ransomware|virus|trojan|hacked|suspicious email|compromised|stolen credentials|breach|credential leak|credential leakage|credential compromise|compromised account|account compromise|leakage|macro attachment|malicious|exploit)\b/i.test(
        text
      )
    ) {
      riskLevel = "CRITICAL";
      risks.push("Potential cybersecurity threat (phishing, malware, or account compromise)");
      escalationRecommended = true;
      escalationReason = "Cybersecurity incident signals detected; immediate security triage required.";
    }

    // Outage risk
    if (
      /\b(outage|all users down|production down|server crash|datacenter)\b/i.test(
        text
      )
    ) {
      if (riskLevel !== "CRITICAL") riskLevel = "HIGH";
      risks.push("Widespread service availability impairment");
      escalationRecommended = true;
      if (!escalationReason) {
        escalationReason = "Broad service outage detected; IT management escalation recommended.";
      }
    }

    return { riskLevel, risks, escalationRecommended, escalationReason };
  }

  generateSolutionDraft(ticket, candidateArticles = []) {
    const matchedKB = candidateArticles.length > 0 ? candidateArticles[0] : null;
    const article = matchedKB?.article || matchedKB;

    if (article) {
      return {
        solutionDraft: `Suggested Resolution (Based on Internal KB: "${article.title}"):
1. Review documentation in Knowledge Article "${article.title}".
2. Follow standard verified procedure: ${article.summary || article.content?.slice(0, 200) || "Verify hardware/software configurations and connectivity."}
3. If error persists after completing the documented steps, contact the assigned support technician for advanced diagnostic escalation.`,
        basedOnArticles: [article._id],
        confidence: 0.82,
        aiAvailable: false,
        source: "local_rule_fallback",
      };
    }

    return {
      solutionDraft: `Standard Diagnostic Procedure:
1. Verify requester details, workstation environment, and recent changes.
2. Confirm symptoms directly with the user and attempt standard restart/re-authentication.
3. Note: No matching internal knowledge article was found for this specific query. Please verify procedural documentation with Tier-2 support if specialized access is required.`,
      basedOnArticles: [],
      confidence: 0.65,
      aiAvailable: false,
      source: "local_rule_fallback",
    };
  }

  formatArticleRecommendations(candidateArticles = []) {
    return candidateArticles
      .filter((cand) => (cand.score ?? 50) >= 25)
      .slice(0, 5)
      .map((cand) => {
        const art = cand.article || cand;
        return {
          articleId: art._id,
          title: art.title,
          relevance: Math.min(1.0, Math.round(((cand.score || 50) / 100) * 100) / 100),
          reason: Array.isArray(cand.rankingReasons) && cand.rankingReasons.length > 0
            ? cand.rankingReasons.join("; ")
            : "Matched relevant category and keywords",
        };
      });
  }

  analyzeTicket(ticket, candidateArticles = []) {
    const classification = this.classifyCategory(ticket);
    const priorityRec = this.recommendPriority(ticket);
    const risksData = this.detectRisks(ticket);
    const articleRecs = this.formatArticleRecommendations(candidateArticles);
    const solution = this.generateSolutionDraft(ticket, candidateArticles);

    return {
      ticketId: ticket._id,
      classification: {
        category: classification.category,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      },
      priorityRecommendation: {
        priority: priorityRec.priority,
        confidence: priorityRec.confidence,
        reasoning: priorityRec.reasoning,
      },
      articleRecommendations: articleRecs,
      solutionDraft: solution.solutionDraft,
      riskLevel: risksData.riskLevel,
      risks: risksData.risks,
      escalationRecommended: risksData.escalationRecommended,
      escalationReason: risksData.escalationReason,
      aiAvailable: false,
      source: "local_rule_fallback",
    };
  }
}

export default new LocalRuleFallback();
