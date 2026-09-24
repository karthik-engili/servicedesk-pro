import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../../utils/constants.js";

/**
 * Sanitizes ticket inputs to remove secrets, tokens, and unnecessary sensitive information.
 */
export function sanitizeInput(text) {
  if (!text || typeof text !== "string") return "";

  return text
    // Redact bearer tokens
    .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, "[REDACTED_TOKEN]")
    // Redact JWT tokens
    .replace(/eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/g, "[REDACTED_JWT]")
    // Redact password occurrences
    .replace(/(password|passwd|pwd)\s*[:=]\s*\S+/gi, "$1: [REDACTED_PASSWORD]")
    // Redact API keys or long hex/base64 secrets
    .replace(/(api[_-]?key|secret|token)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, "$1: [REDACTED_SECRET]")
    // Redact potential credit card numbers (13-16 digits)
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, "[REDACTED_CARD]")
    .trim();
}

/**
 * Common System Prompt defining constraints, output format, and rules.
 */
export const SYSTEM_PROMPT = `You are the AI Ticket Intelligence Engine for ServiceDesk Pro, an enterprise IT service desk platform.
Your job is to analyze incoming IT support tickets, classify their category, recommend priority, evaluate security and outage risks, match relevant internal knowledge base articles, and draft professional troubleshooting solutions.

CRITICAL RULES:
1. Output MUST be strictly valid JSON. Do not include markdown backticks (no \`\`\`json or \`\`\`), explanations, or conversational filler.
2. Categories MUST be strictly one of: ${JSON.stringify(TICKET_CATEGORIES)}.
   - NOTE: "SECURITY" IS A RISK DOMAIN, NOT CURRENTLY A VALID TICKET CATEGORY. Never return "SECURITY" as a category.
   - Security Incident Category Mapping:
     * If the incident involves user accounts, passwords, MFA, credentials, stolen logins, or compromised access: classify category as "ACCESS".
     * If the incident involves ransomware, malware, viruses, suspicious attachments/macros, phishing campaigns, or general cyber threats: classify category as "GENERAL".
     * Do NOT classify security threats as "SOFTWARE" or "HARDWARE" simply because an application (e.g. Excel, PowerShell, Outlook) or device was targeted or exploited.
3. Priorities MUST be one of: ${JSON.stringify(TICKET_PRIORITIES)}.
4. Risk levels MUST be one of: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
5. Confidence values MUST be numbers between 0.00 and 1.00.
6. Ground solution drafts strictly in the provided Knowledge Base articles whenever possible. Do NOT hallucinate organization-specific procedures or URLs.
7. If no relevant internal article exists, explicitly state that no internal documentation was found, provide safe standard troubleshooting guidance, and advise human review.
8. If the ticket mentions security threats (phishing, malware, ransomware, compromised accounts, credential leaks, suspicious macros) or major business outages (all users down, production server unreachable):
   - ALWAYS recommend escalation: escalationRecommended = true.
   - Set riskLevel = "HIGH" or "CRITICAL".
   - Describe specific threats in the "risks" array and provide clear escalation steps in the solution draft.
9. Maintain a professional, concise, empathetic IT support tone.`;

/**
 * Builds prompt for full ticket analysis.
 */
export function buildAnalysisPrompt({ ticket, articles = [] }) {
  const sanitizedTitle = sanitizeInput(ticket.title);
  const sanitizedDescription = sanitizeInput(ticket.description);
  const currentCategory = ticket.category || "GENERAL";
  const currentPriority = ticket.priority || "MEDIUM";
  const departmentName = ticket.department?.name || ticket.department || "General";
  const assetInfo = ticket.asset
    ? `Asset: ${ticket.asset.name || "Hardware"} (${ticket.asset.category || "IT Asset"}, Tag: ${ticket.asset.assetTag || "N/A"}, Status: ${ticket.asset.status || "N/A"})`
    : "No linked asset";

  const articlesSummary = articles.length > 0
    ? articles.map((a, idx) => {
        const item = a.article || a;
        return `[KB-${idx + 1}] ID: ${item._id} | Title: "${item.title}" | Category: ${item.category} | Summary: "${item.summary || item.content?.slice(0, 150) || ""}"`;
      }).join("\n")
    : "No candidate knowledge articles matched.";

  const userContent = `Analyze the following support ticket and return strict JSON:

TICKET DATA:
- Ticket Number: ${ticket.ticketNumber || "N/A"}
- Title: ${sanitizedTitle}
- Description: ${sanitizedDescription}
- Current Category: ${currentCategory}
- Current Priority: ${currentPriority}
- Requester Department: ${departmentName}
- ${assetInfo}

AVAILABLE KNOWLEDGE BASE CANDIDATES:
${articlesSummary}

CATEGORY CLASSIFICATION INSTRUCTIONS:
- You must choose strictly from: "HARDWARE", "SOFTWARE", "NETWORK", "ACCESS", "GENERAL".
- Do NOT return "SECURITY" as category (SECURITY is a risk domain, not a ticket category).
- For security incidents (phishing, ransomware, malware, credential leakage, compromised accounts):
  * Map to "ACCESS" if the incident involves user authentication, stolen passwords, credential leaks, MFA, or account takeovers.
  * Map to "GENERAL" if the incident involves malware, ransomware, suspicious emails, macro payloads, or broad security breaches.
  * Do NOT categorize security attacks as "SOFTWARE" simply because software or macros were involved in the attack vector.
- In all security incidents, set riskLevel = "CRITICAL" or "HIGH", escalationRecommended = true, and list specific risks in "risks".

INSTRUCTIONS FOR KNOWLEDGE ARTICLE MATCHING:
- Only recommend articles from the candidate list above that directly address the specific issue.
- Do NOT recommend articles from completely incompatible categories (e.g., do not recommend network/Wi-Fi articles for a hardware screen failure, or printer guides for an account password issue).
- If no candidate article genuinely matches the symptoms, return "suggestedArticles": []. Do NOT manufacture a recommendation.
- When an article matches, verify the articleId matches its ID in the candidates list.

RESPONSE FORMAT:
{
  "category": "HARDWARE" | "SOFTWARE" | "NETWORK" | "ACCESS" | "GENERAL",
  "categoryConfidence": <float 0.0 - 1.0>,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "priorityConfidence": <float 0.0 - 1.0>,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "risks": [<string>, ...],
  "escalationRecommended": <boolean>,
  "escalationReason": "<string>",
  "suggestedArticles": [
    {
      "articleId": "<exact id string matching candidates above or empty>",
      "title": "<matching title from candidates>",
      "relevance": <float 0.0 - 1.0>,
      "reason": "<short truthful explanation of why this article matches>"
    }
  ],
  "solutionDraft": "<professional troubleshooting text grounded in matched articles or standard diagnostics>",
  "reasoning": "<concise explanation of category and priority choice>"
}`;

  return { systemPrompt: SYSTEM_PROMPT, userContent };
}

/**
 * Builds prompt for solution draft generation.
 */
export function buildSolutionDraftPrompt({ ticket, articles = [] }) {
  const sanitizedTitle = sanitizeInput(ticket.title);
  const sanitizedDescription = sanitizeInput(ticket.description);
  const departmentName = ticket.department?.name || ticket.department || "General";
  const assetInfo = ticket.asset
    ? `Asset: ${ticket.asset.name || "Hardware"} (${ticket.asset.category || "IT Asset"})`
    : "No linked asset";

  const articlesSummary = articles.length > 0
    ? articles.map((a, idx) => {
        const item = a.article || a;
        return `[KB-${idx + 1}] ID: ${item._id} | Title: "${item.title}" | Content: "${item.content?.slice(0, 300) || item.summary || ""}"`;
      }).join("\n")
    : "No candidate knowledge articles available.";

  const userContent = `Draft an IT support solution for this ticket based on available knowledge articles. Return strict JSON:

TICKET:
- Title: ${sanitizedTitle}
- Description: ${sanitizedDescription}
- Category: ${ticket.category}
- Priority: ${ticket.priority}
- Department: ${departmentName}
- ${assetInfo}

KNOWLEDGE ARTICLES:
${articlesSummary}

RESPONSE FORMAT:
{
  "solutionDraft": "<step-by-step troubleshooting response for the technician/employee>",
  "basedOnArticles": ["<articleId>", ...],
  "confidence": <float 0.0 - 1.0>,
  "requiresEscalation": <boolean>,
  "reasoning": "<short explanation>"
}`;

  return { systemPrompt: SYSTEM_PROMPT, userContent };
}
