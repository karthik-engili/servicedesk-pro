import Ticket from "../../models/Ticket.js";
import User from "../../models/User.js";
import AiTicketAnalysis from "../../models/AiTicketAnalysis.js";
import articleService from "../articleService.js";
import slaService from "../slaService.js";
import auditService from "../auditService.js";
import notificationService from "../notificationService.js";
import localRuleFallback from "./localRuleFallback.js";
import mockAiProvider from "./mockAiProvider.js";
import openRouterProvider from "./openRouterProvider.js";
import AppError from "../../utils/appError.js";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  CATEGORY_COMPATIBILITY,
} from "../../utils/constants.js";

class AiService {
  constructor() {
    this.overrideProvider = null;
  }

  /**
   * Allows dynamically setting an AI provider for testing or custom runtime configurations.
   */
  setProvider(provider) {
    this.overrideProvider = provider;
  }

  /**
   * Resolves the active AI provider based on configuration.
   */
  getActiveProvider() {
    if (this.overrideProvider) {
      return this.overrideProvider;
    }

    const providerType = (process.env.AI_PROVIDER || "openrouter").toLowerCase();

    if (providerType === "mock" || process.env.NODE_ENV === "test") {
      return mockAiProvider;
    }

    return openRouterProvider;
  }

  /**
   * Determines if external AI calls are enabled.
   */
  isAiEnabled() {
    return process.env.AI_ENABLED !== "false" && process.env.AI_ENABLED !== false;
  }

  /**
   * Clamps and cleans raw confidence numbers strictly between 0.00 and 1.00.
   */
  _sanitizeConfidence(val, defaultVal = 0.8) {
    const num = parseFloat(val);
    if (isNaN(num)) return defaultVal;
    return Math.min(1.0, Math.max(0.0, Math.round(num * 100) / 100));
  }

  /**
   * Validates and sanitizes raw provider analysis output to guarantee application safety.
   */
  _validateAndSanitizeOutput(rawOutput, ticket, candidateArticles = []) {
    // 1. Category validation
    let category = rawOutput?.category || rawOutput?.predictedCategory;
    const text = `${ticket.title || ""} ${ticket.description || ""}`.toLowerCase();
    const isSecurityIncident = /\b(phishing|ransomware|malware|compromised account|account compromise|credential leak|credential leakage|credential compromise|stolen credentials|macro attachment|powershell payload|trojan|virus|breach|cyber attack)\b/i.test(text);

    if (category === "SECURITY" || ((category === "SOFTWARE" || category === "HARDWARE" || category === "NETWORK") && isSecurityIncident)) {
      // SECURITY is a risk domain, not a ticket category.
      // Re-map security incidents to ACCESS (if credential/account related) or GENERAL.
      category = /\b(password|credential|account|login|mfa|auth|identity)\b/i.test(text) ? "ACCESS" : "GENERAL";
    }

    if (!category || !TICKET_CATEGORIES.includes(category)) {
      category = ticket.category || "GENERAL";
    }
    const categoryConfidence = this._sanitizeConfidence(
      rawOutput?.categoryConfidence ?? rawOutput?.confidence,
      0.85
    );

    // 2. Priority validation
    let priority = rawOutput?.priority || rawOutput?.suggestedPriority;
    if (!priority || !TICKET_PRIORITIES.includes(priority)) {
      priority = ticket.priority || "MEDIUM";
    }
    const priorityConfidence = this._sanitizeConfidence(
      rawOutput?.priorityConfidence ?? rawOutput?.confidence,
      0.80
    );

    // 3. Risk Level validation
    const validRiskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    let riskLevel = validRiskLevels.includes(rawOutput?.riskLevel)
      ? rawOutput.riskLevel
      : "LOW";

    // 4. Risks array
    const risks = Array.isArray(rawOutput?.risks)
      ? rawOutput.risks.filter((r) => typeof r === "string" && r.trim().length > 0)
      : [];

    // 5. Escalation
    let escalationRecommended = Boolean(rawOutput?.escalationRecommended);
    let escalationReason = typeof rawOutput?.escalationReason === "string"
      ? rawOutput.escalationReason.trim()
      : "";

    // If security incident and provider missed critical/high escalation, protect system:
    if (isSecurityIncident) {
      if (riskLevel === "LOW" || riskLevel === "MEDIUM") {
        riskLevel = "CRITICAL";
      }
      escalationRecommended = true;
      if (!escalationReason) {
        escalationReason = "High-severity cybersecurity threat detected; immediate security triage required.";
      }
      if (risks.length === 0) {
        risks.push("Cybersecurity threat signals detected");
      }
    }

    // 6. Strict Article Recommendations Validation against authorized candidate list
    const candidateMap = new Map();
    for (const cand of candidateArticles) {
      const art = cand.article || cand;
      if (art && art._id) {
        candidateMap.set(art._id.toString(), art);
      }
    }

    const compatibleCategories = (
      CATEGORY_COMPATIBILITY[category] || [category]
    ).map((c) => c.toUpperCase());

    let articleRecommendations = [];
    if (Array.isArray(rawOutput?.suggestedArticles)) {
      for (const a of rawOutput.suggestedArticles) {
        const rawId = (a.articleId || a._id || "").toString();
        const candidate = candidateMap.get(rawId);
        // Candidate MUST exist in authorized candidate list
        if (!candidate) continue;

        // Candidate category MUST be compatible with the ticket category
        const candCat = (candidate.category || "").toUpperCase();
        const isCatMatch =
          category === "GENERAL" ||
          compatibleCategories.includes(candCat) ||
          (Array.isArray(candidate.relatedTicketCategories) &&
            candidate.relatedTicketCategories
              .map((c) => c.toUpperCase())
              .includes(category));

        if (!isCatMatch) continue;

        const relevance = this._sanitizeConfidence(a.relevance, 0.85);
        if (relevance < 0.35) continue; // Minimum relevance threshold

        articleRecommendations.push({
          articleId: candidate._id,
          title: candidate.title,
          relevance,
          reason:
            typeof a.reason === "string" && a.reason.trim()
              ? a.reason.trim()
              : `Matches verified ${category} protocol: ${candidate.title}`,
        });
      }
    }

    // 7. Solution draft
    const solutionDraft = typeof rawOutput?.solutionDraft === "string"
      ? rawOutput.solutionDraft.trim()
      : "";

    const reasoning = typeof rawOutput?.reasoning === "string"
      ? rawOutput.reasoning.trim()
      : "";

    return {
      category,
      categoryConfidence,
      priority,
      priorityConfidence,
      riskLevel,
      risks,
      escalationRecommended,
      escalationReason,
      articleRecommendations,
      solutionDraft,
      reasoning,
    };
  }

  /**
   * Validates access permission to view or analyze a ticket.
   */
  async _getTicketAndAuthorize(ticketId, requestingUser) {
    const ticket = await Ticket.findById(ticketId)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name")
      .populate("asset", "assetTag name category status serialNumber");

    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    if (
      requestingUser.role === "employee" &&
      ticket.createdBy._id.toString() !== requestingUser._id.toString()
    ) {
      throw new AppError("Access denied. You can only view your own tickets.", 403);
    }

    return ticket;
  }

  /**
   * Main AI Orchestration: Classify, evaluate priority, detect risks, match KB, and draft solution.
   */
  async analyzeTicket(ticketId, requestingUser, { forceRefresh = false } = {}) {
    const ticket = await this._getTicketAndAuthorize(ticketId, requestingUser);

    // Initial prediction using local rule to guide candidate retrieval if category is GENERAL
    const preliminaryCategory = ticket.category !== "GENERAL"
      ? ticket.category
      : localRuleFallback.classifyCategory(ticket).category;

    // 1. Fetch grounded candidate articles from Knowledge Base with preliminary category guidance
    let candidateArticles = [];
    try {
      candidateArticles = await articleService.getRecommendationsForTicket(
        ticket._id,
        requestingUser,
        { targetCategory: preliminaryCategory }
      );
    } catch (err) {
      console.warn("Could not retrieve candidate KB articles for AI analysis:", err.message);
    }

    let analysisResult = null;
    let aiAvailable = false;
    let source = "local_rule_fallback";
    let modelUsed = "local_rule_engine";

    // 2. Attempt AI provider if enabled
    if (this.isAiEnabled()) {
      try {
        const provider = this.getActiveProvider();
        const rawOutput = await provider.analyzeTicket({
          ticket,
          articles: candidateArticles,
        });

        const validated = this._validateAndSanitizeOutput(rawOutput, ticket, candidateArticles);

        // If provider returned no articles or empty list, fall back to formatted candidate articles ONLY if compatible
        if (validated.articleRecommendations.length === 0 && candidateArticles.length > 0) {
          const compatibleCandidates = candidateArticles.filter((cand) => {
            const art = cand.article || cand;
            const candCat = (art.category || "").toUpperCase();
            const compatibleCats = (CATEGORY_COMPATIBILITY[validated.category] || [validated.category]).map(c => c.toUpperCase());
            return cand.score >= 30 && (validated.category === "GENERAL" || compatibleCats.includes(candCat));
          });
          if (compatibleCandidates.length > 0) {
            validated.articleRecommendations = localRuleFallback.formatArticleRecommendations(compatibleCandidates);
          }
        }

        analysisResult = validated;
        aiAvailable = true;
        source = rawOutput.source || "openrouter";
        modelUsed = rawOutput.model || (provider.name || "openrouter");
      } catch (err) {
        console.warn(`AI Provider failed (${err.code || err.message}). Gracefully routing to local rule fallback.`);
      }
    }

    // 3. Fallback to Local Rule Engine if AI unavailable or failed
    if (!analysisResult) {
      const fallbackData = localRuleFallback.analyzeTicket(ticket, candidateArticles);
      analysisResult = {
        category: fallbackData.classification.category,
        categoryConfidence: fallbackData.classification.confidence,
        priority: fallbackData.priorityRecommendation.priority,
        priorityConfidence: fallbackData.priorityRecommendation.confidence,
        riskLevel: fallbackData.riskLevel,
        risks: fallbackData.risks,
        escalationRecommended: fallbackData.escalationRecommended,
        escalationReason: fallbackData.escalationReason,
        articleRecommendations: fallbackData.articleRecommendations,
        solutionDraft: fallbackData.solutionDraft,
        reasoning: fallbackData.classification.reasoning,
      };
      aiAvailable = false;
      source = "local_rule_fallback";
      modelUsed = "local_rule_fallback_v1";
    }

    // 4. Persist analysis history record
    const record = await AiTicketAnalysis.create({
      ticket: ticket._id,
      analyzedBy: requestingUser._id,
      model: modelUsed,
      provider: source,
      categorySuggestion: analysisResult.category,
      categoryConfidence: analysisResult.categoryConfidence,
      prioritySuggestion: analysisResult.priority,
      priorityConfidence: analysisResult.priorityConfidence,
      riskLevel: analysisResult.riskLevel,
      risks: analysisResult.risks,
      escalationRecommended: analysisResult.escalationRecommended,
      escalationReason: analysisResult.escalationReason,
      articleRecommendations: analysisResult.articleRecommendations.map((a) => ({
        articleId: a.articleId,
        title: a.title,
        relevance: a.relevance,
        reason: a.reason,
      })),
      solutionDraft: analysisResult.solutionDraft,
      reasoning: analysisResult.reasoning,
      aiAvailable,
      source,
    });

    // 5. Audit log
    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "AI_ANALYSIS_PERFORMED",
      performedBy: requestingUser._id,
      details: `AI analysis performed (Source: ${source}, Category: ${analysisResult.category}, Priority: ${analysisResult.priority}, Risks: ${analysisResult.risks.length})`,
    });

    // 6. Alert IT Manager if high security or outage risk detected
    if (analysisResult.escalationRecommended && ["HIGH", "CRITICAL"].includes(analysisResult.riskLevel)) {
      await auditService.logAction({
        entityType: "Ticket",
        entityId: ticket._id,
        action: "AI_ESCALATION_RECOMMENDED",
        performedBy: requestingUser._id,
        details: `AI flagged escalation: ${analysisResult.escalationReason}`,
      });
    }

    return {
      ticketId: ticket._id,
      classification: {
        category: analysisResult.category,
        confidence: analysisResult.categoryConfidence,
        reasoning: analysisResult.reasoning,
      },
      priorityRecommendation: {
        priority: analysisResult.priority,
        confidence: analysisResult.priorityConfidence,
        reasoning: analysisResult.reasoning,
      },
      articleRecommendations: analysisResult.articleRecommendations,
      solutionDraft: analysisResult.solutionDraft,
      riskLevel: analysisResult.riskLevel,
      risks: analysisResult.risks,
      escalationRecommended: analysisResult.escalationRecommended,
      escalationReason: analysisResult.escalationReason,
      aiAvailable,
      source,
      analysisId: record._id,
    };
  }

  /**
   * Recommendations Endpoint: AI-assisted Knowledge Base article matching.
   */
  async getRecommendations(ticketId, requestingUser) {
    const ticket = await this._getTicketAndAuthorize(ticketId, requestingUser);

    const preliminaryCategory = ticket.category !== "GENERAL"
      ? ticket.category
      : localRuleFallback.classifyCategory(ticket).category;

    const candidateArticles = await articleService.getRecommendationsForTicket(
      ticket._id,
      requestingUser,
      { targetCategory: preliminaryCategory }
    );

    let recommendations = [];
    let aiAvailable = false;

    if (this.isAiEnabled()) {
      try {
        const provider = this.getActiveProvider();
        const analysis = await provider.analyzeTicket({
          ticket,
          articles: candidateArticles,
        });

        if (Array.isArray(analysis?.suggestedArticles) && analysis.suggestedArticles.length > 0) {
          const candidateMap = new Map();
          for (const cand of candidateArticles) {
            const art = cand.article || cand;
            if (art && art._id) candidateMap.set(art._id.toString(), art);
          }

          const targetCat = analysis.category || preliminaryCategory;
          const compatibleCats = (CATEGORY_COMPATIBILITY[targetCat] || [targetCat]).map((c) =>
            c.toUpperCase()
          );

          for (const a of analysis.suggestedArticles) {
            const rawId = (a.articleId || a._id || "").toString();
            const cand = candidateMap.get(rawId);
            if (!cand) continue;
            const candCat = (cand.category || "").toUpperCase();
            if (targetCat !== "GENERAL" && !compatibleCats.includes(candCat)) continue;
            const rel = this._sanitizeConfidence(a.relevance, 0.85);
            if (rel < 0.35) continue;

            recommendations.push({
              articleId: cand._id,
              title: cand.title,
              relevance: rel,
              reason: a.reason || `Relevant to ${targetCat} incident`,
            });
          }
          if (recommendations.length > 0) {
            aiAvailable = true;
          }
        }
      } catch (err) {
        console.warn("AI recommendation refinement failed, falling back to rule scoring:", err.message);
      }
    }

    if (recommendations.length === 0) {
      recommendations = localRuleFallback.formatArticleRecommendations(candidateArticles);
    }

    return {
      ticketId: ticket._id,
      aiAvailable,
      recommendations,
    };
  }

  /**
   * Solution Draft Endpoint: Generates a troubleshooting draft grounded in KB articles.
   */
  async generateSolutionDraft(ticketId, requestingUser) {
    const ticket = await this._getTicketAndAuthorize(ticketId, requestingUser);

    const preliminaryCategory = ticket.category !== "GENERAL"
      ? ticket.category
      : localRuleFallback.classifyCategory(ticket).category;

    const candidateArticles = await articleService.getRecommendationsForTicket(
      ticket._id,
      requestingUser,
      { targetCategory: preliminaryCategory }
    );

    let draft = null;
    let aiAvailable = false;
    let source = "local_rule_fallback";

    if (this.isAiEnabled()) {
      try {
        const provider = this.getActiveProvider();
        const raw = await provider.generateSolution({
          ticket,
          articles: candidateArticles,
        });

        if (raw?.solutionDraft) {
          const candidateIds = new Set(
            candidateArticles.map((c) => (c.article?._id || c._id).toString())
          );
          const validBasedOn = Array.isArray(raw.basedOnArticles)
            ? raw.basedOnArticles
                .map((id) => id.toString())
                .filter((id) => candidateIds.has(id))
            : [];

          draft = {
            solutionDraft: raw.solutionDraft.trim(),
            basedOnArticles: validBasedOn,
            confidence: this._sanitizeConfidence(raw.confidence, 0.85),
          };
          aiAvailable = true;
          source = raw.source || "openrouter";
        }
      } catch (err) {
        console.warn("AI solution draft generation failed, using local rule fallback:", err.message);
      }
    }

    if (!draft) {
      draft = localRuleFallback.generateSolutionDraft(ticket, candidateArticles);
    }

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "AI_SOLUTION_DRAFT_GENERATED",
      performedBy: requestingUser._id,
      details: `Solution draft generated (Source: ${source})`,
    });

    return {
      ticketId: ticket._id,
      solutionDraft: draft.solutionDraft,
      basedOnArticles: draft.basedOnArticles,
      confidence: draft.confidence,
      aiAvailable,
      source,
    };
  }

  /**
   * AI Analysis History: Returns previous analysis runs for a ticket.
   */
  async getAnalysisHistory(ticketId, requestingUser, { page = 1, limit = 20 } = {}) {
    // Only appropriately authorized support staff
    if (requestingUser.role === "employee") {
      throw new AppError("Employees cannot view AI analysis history.", 403);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [history, total] = await Promise.all([
      AiTicketAnalysis.find({ ticket: ticketId })
        .populate("analyzedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AiTicketAnalysis.countDocuments({ ticket: ticketId }),
    ]);

    return {
      history,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Human-Controlled Action: Apply AI-recommended category to ticket.
   */
  async applyCategory(ticketId, category, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    // Ticket authorization: owner or support staff (technician, it_manager, system_admin)
    const isOwner = ticket.createdBy.toString() === requestingUser._id.toString();
    const isSupportStaff = ["system_admin", "it_manager", "technician"].includes(requestingUser.role);

    if (!isSupportStaff && !isOwner) {
      throw new AppError("You do not have permission to modify this ticket.", 403);
    }

    if (!TICKET_CATEGORIES.includes(category)) {
      throw new AppError(`Invalid category '${category}'. Allowed: ${TICKET_CATEGORIES.join(", ")}`, 400);
    }

    const previousCategory = ticket.category;
    ticket.category = category;
    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "AI_CATEGORY_APPLIED",
      performedBy: requestingUser._id,
      previousState: { category: previousCategory },
      newState: { category: ticket.category },
      details: `Category updated from ${previousCategory} to ${ticket.category} via AI suggestion by ${requestingUser.name}`,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name")
      .populate("asset", "assetTag name category status serialNumber");
  }

  /**
   * Human-Controlled Action: Apply AI-recommended priority to ticket.
   */
  async applyPriority(ticketId, priority, requestingUser) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    // Only IT Managers or System Admins can update ticket priority
    if (!["system_admin", "it_manager"].includes(requestingUser.role)) {
      throw new AppError("Only IT Managers or System Admins can update ticket priority.", 403);
    }

    if (!TICKET_PRIORITIES.includes(priority)) {
      throw new AppError(`Invalid priority '${priority}'. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 400);
    }

    const previousPriority = ticket.priority;
    ticket.priority = priority;

    // Recalculate SLA policy and deadlines
    const newPolicy = await slaService.getPolicyForPriority(priority);
    const { responseDeadline, resolutionDeadline } = slaService.calculateDeadlines(
      newPolicy,
      ticket.createdAt
    );
    ticket.slaPolicy = newPolicy._id;
    ticket.responseDeadline = responseDeadline;
    ticket.resolutionDeadline = resolutionDeadline;
    ticket.slaStatus = slaService.evaluateTicketSla(ticket);

    await ticket.save();

    await auditService.logAction({
      entityType: "Ticket",
      entityId: ticket._id,
      action: "AI_PRIORITY_APPLIED",
      performedBy: requestingUser._id,
      previousState: { priority: previousPriority },
      newState: { priority: ticket.priority },
      details: `Priority updated from ${previousPriority} to ${ticket.priority} via AI suggestion by ${requestingUser.name}`,
    });

    return Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("department", "name")
      .populate("asset", "assetTag name category status serialNumber")
      .populate("slaPolicy");
  }
}

export default new AiService();
