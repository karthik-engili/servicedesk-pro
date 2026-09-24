import mongoose from "mongoose";
import Article from "../models/Article.js";
import ArticleVersion from "../models/ArticleVersion.js";
import ArticleBookmark from "../models/ArticleBookmark.js";
import ArticleFeedback from "../models/ArticleFeedback.js";
import Ticket from "../models/Ticket.js";
import Department from "../models/Department.js";
import Asset from "../models/Asset.js";
import AppError from "../utils/appError.js";
import { isValidArticleTransition, CATEGORY_COMPATIBILITY } from "../utils/constants.js";
import auditService from "./auditService.js";
import notificationService from "./notificationService.js";

class ArticleService {
  // Helper to build visibility filter for a given user
  buildVisibilityFilter(user) {
    if (["system_admin", "it_manager", "technician", "asset_manager"].includes(user.role)) {
      return {}; // Staff can view all visibilities
    }

    const conditions = [{ visibility: "PUBLIC" }, { visibility: "INTERNAL" }];
    if (user.department) {
      const deptId = user.department._id || user.department;
      conditions.push({ visibility: "DEPARTMENT", department: deptId });
    }
    return { $or: conditions };
  }

  async createArticle(payload, requestingUser) {
    if (requestingUser.role === "employee") {
      throw new AppError("Employees do not have permission to author knowledge base articles.", 403);
    }

    if (payload.department) {
      const dept = await Department.findById(payload.department);
      if (!dept) throw new AppError("Referenced department not found.", 404);
    }

    if (payload.relatedAssets && Array.isArray(payload.relatedAssets)) {
      for (const assetId of payload.relatedAssets) {
        if (!mongoose.Types.ObjectId.isValid(assetId)) {
          throw new AppError(`Invalid asset ID format: ${assetId}`, 400);
        }
      }
    }

    const article = new Article({
      title: payload.title.trim(),
      summary: payload.summary ? payload.summary.trim() : "",
      content: payload.content.trim(),
      category: payload.category || "GENERAL",
      tags: Array.isArray(payload.tags)
        ? payload.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [],
      visibility: payload.visibility || "PUBLIC",
      status: "DRAFT",
      author: requestingUser._id,
      department: payload.department || null,
      relatedAssets: payload.relatedAssets || [],
      relatedTicketCategories: payload.relatedTicketCategories || [],
      createdBy: requestingUser._id,
      updatedBy: requestingUser._id,
    });

    await article.save();

    // Create initial Version 1
    await ArticleVersion.create({
      article: article._id,
      versionNumber: 1,
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tags: article.tags,
      visibility: article.visibility,
      changedBy: requestingUser._id,
      changeNote: "Initial draft creation",
    });

    await auditService.logAction({
      entityType: "Article",
      entityId: article._id,
      action: "ARTICLE_CREATED",
      performedBy: requestingUser._id,
      newState: { title: article.title, status: article.status },
      details: `Article "${article.title}" created by ${requestingUser.name}`,
    });

    return this.getArticleById(article._id, requestingUser);
  }

  async listArticles(queryFilters = {}, requestingUser) {
    const {
      search,
      category,
      status,
      visibility,
      department,
      tag,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryFilters;

    const query = {};

    // Apply visibility filter based on user role
    const visFilter = this.buildVisibilityFilter(requestingUser);
    if (visFilter.$or) {
      query.$or = visFilter.$or;
    }

    // Role-based status visibility: Employees only see PUBLISHED articles
    if (requestingUser.role === "employee") {
      query.status = "PUBLISHED";
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (visibility) query.visibility = visibility;
    if (department) query.department = department;
    if (tag) query.tags = tag.toLowerCase().trim();

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      const searchConditions = [
        { title: regex },
        { summary: regex },
        { tags: regex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate("author", "name email role")
        .populate("department", "name status")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Article.countDocuments(query),
    ]);

    return {
      articles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async searchArticles({ q, category, department }, requestingUser) {
    if (!q || !q.trim()) {
      return this.listArticles({ category, department }, requestingUser);
    }

    const visFilter = this.buildVisibilityFilter(requestingUser);
    const query = {
      $text: { $search: q.trim() },
      ...visFilter,
    };

    if (requestingUser.role === "employee") {
      query.status = "PUBLISHED";
    }

    if (category) query.category = category;
    if (department) query.department = department;

    const articles = await Article.find(query, { score: { $meta: "textScore" } })
      .populate("author", "name email role")
      .populate("department", "name")
      .sort({ score: { $meta: "textScore" }, helpfulCount: -1 })
      .limit(20);

    return articles;
  }

  async getArticleById(idOrSlug, requestingUser) {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const article = await Article.findOne(filter)
      .populate("author", "name email role")
      .populate("department", "name status")
      .populate("relatedAssets", "assetTag name category status");

    if (!article) {
      throw new AppError("Article not found.", 404);
    }

    // Access control checks for employees
    if (requestingUser.role === "employee") {
      if (article.status !== "PUBLISHED") {
        throw new AppError("Article not found or not currently published.", 404);
      }
      if (article.visibility === "DEPARTMENT") {
        const userDept = requestingUser.department?._id || requestingUser.department;
        if (!userDept || userDept.toString() !== article.department?._id.toString()) {
          throw new AppError("Access denied: This article is restricted to another department.", 403);
        }
      }
    }

    // Increment view count safely
    await Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });
    article.viewCount += 1;

    return article;
  }

  async updateArticle(id, updates, requestingUser) {
    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    // Authorization: system_admin, it_manager, or author
    const isAuthor = article.author.toString() === requestingUser._id.toString();
    const isPrivileged = ["system_admin", "it_manager"].includes(requestingUser.role);

    if (!isAuthor && !isPrivileged) {
      throw new AppError("You do not have permission to modify this knowledge article.", 403);
    }

    // Protect workflow: status cannot be updated via generic patch
    if (updates.status && updates.status !== article.status) {
      throw new AppError(
        "Article status cannot be updated via PATCH. Use explicit workflow actions (/publish, /archive, /unpublish).",
        400
      );
    }

    // Capture version before updating content
    const versionCount = await ArticleVersion.countDocuments({ article: article._id });
    await ArticleVersion.create({
      article: article._id,
      versionNumber: versionCount + 1,
      title: updates.title !== undefined ? updates.title.trim() : article.title,
      summary: updates.summary !== undefined ? updates.summary.trim() : article.summary,
      content: updates.content !== undefined ? updates.content.trim() : article.content,
      category: updates.category || article.category,
      tags: updates.tags || article.tags,
      visibility: updates.visibility || article.visibility,
      changedBy: requestingUser._id,
      changeNote: updates.changeNote || `Revision by ${requestingUser.name}`,
    });

    if (updates.title !== undefined) article.title = updates.title.trim();
    if (updates.summary !== undefined) article.summary = updates.summary.trim();
    if (updates.content !== undefined) article.content = updates.content.trim();
    if (updates.category !== undefined) article.category = updates.category;
    if (updates.visibility !== undefined) article.visibility = updates.visibility;
    if (updates.department !== undefined) article.department = updates.department || null;
    if (updates.relatedAssets !== undefined) article.relatedAssets = updates.relatedAssets;
    if (updates.relatedTicketCategories !== undefined)
      article.relatedTicketCategories = updates.relatedTicketCategories;
    if (updates.tags !== undefined) {
      article.tags = Array.isArray(updates.tags)
        ? updates.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];
    }

    article.updatedBy = requestingUser._id;
    await article.save();

    await auditService.logAction({
      entityType: "Article",
      entityId: article._id,
      action: "ARTICLE_UPDATED",
      performedBy: requestingUser._id,
      details: `Article "${article.title}" content updated (v${versionCount + 1})`,
    });

    return this.getArticleById(article._id, requestingUser);
  }

  // --- Explicit Workflow Endpoints ---

  async publishArticle(id, requestingUser) {
    if (requestingUser.role === "employee") {
      throw new AppError("Employees cannot publish knowledge articles.", 403);
    }

    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    if (!isValidArticleTransition(article.status, "PUBLISHED")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot publish article from '${article.status}' status.`,
        400
      );
    }

    article.status = "PUBLISHED";
    article.publishedAt = new Date();
    article.updatedBy = requestingUser._id;
    await article.save();

    await auditService.logAction({
      entityType: "Article",
      entityId: article._id,
      action: "ARTICLE_PUBLISHED",
      performedBy: requestingUser._id,
      details: `Article "${article.title}" published`,
    });

    return this.getArticleById(article._id, requestingUser);
  }

  async archiveArticle(id, requestingUser) {
    if (requestingUser.role === "employee") {
      throw new AppError("Employees cannot archive knowledge articles.", 403);
    }

    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    if (!isValidArticleTransition(article.status, "ARCHIVED")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot archive article from '${article.status}' status.`,
        400
      );
    }

    article.status = "ARCHIVED";
    article.updatedBy = requestingUser._id;
    await article.save();

    await auditService.logAction({
      entityType: "Article",
      entityId: article._id,
      action: "ARTICLE_ARCHIVED",
      performedBy: requestingUser._id,
      details: `Article "${article.title}" archived`,
    });

    return this.getArticleById(article._id, requestingUser);
  }

  async unpublishArticle(id, requestingUser) {
    if (requestingUser.role === "employee") {
      throw new AppError("Employees cannot unpublish knowledge articles.", 403);
    }

    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    if (!isValidArticleTransition(article.status, "DRAFT")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot revert article to draft from '${article.status}' status.`,
        400
      );
    }

    article.status = "DRAFT";
    article.updatedBy = requestingUser._id;
    await article.save();

    await auditService.logAction({
      entityType: "Article",
      entityId: article._id,
      action: "ARTICLE_UNPUBLISHED",
      performedBy: requestingUser._id,
      details: `Article "${article.title}" reverted to draft`,
    });

    return this.getArticleById(article._id, requestingUser);
  }

  async deleteArticle(id, requestingUser) {
    if (!["system_admin", "it_manager"].includes(requestingUser.role)) {
      throw new AppError("Only system administrators or IT managers can delete knowledge articles.", 403);
    }

    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    await Promise.all([
      Article.findByIdAndDelete(id),
      ArticleVersion.deleteMany({ article: id }),
      ArticleBookmark.deleteMany({ article: id }),
      ArticleFeedback.deleteMany({ article: id }),
    ]);

    await auditService.logAction({
      entityType: "Article",
      entityId: id,
      action: "ARTICLE_DELETED",
      performedBy: requestingUser._id,
      details: `Article "${article.title}" deleted`,
    });

    return true;
  }

  // --- Feedback ---

  async submitFeedback(id, isHelpful, requestingUser) {
    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    const voteType = isHelpful ? "HELPFUL" : "NOT_HELPFUL";

    const existingFeedback = await ArticleFeedback.findOne({
      article: id,
      user: requestingUser._id,
    });

    if (existingFeedback) {
      if (existingFeedback.feedback === voteType) {
        throw new AppError("You have already recorded this feedback for this article.", 400);
      }
      // User is changing their vote
      if (voteType === "HELPFUL") {
        article.helpfulCount += 1;
        article.notHelpfulCount = Math.max(0, article.notHelpfulCount - 1);
      } else {
        article.notHelpfulCount += 1;
        article.helpfulCount = Math.max(0, article.helpfulCount - 1);
      }
      existingFeedback.feedback = voteType;
      await existingFeedback.save();
    } else {
      // First time vote
      await ArticleFeedback.create({
        article: id,
        user: requestingUser._id,
        feedback: voteType,
      });
      if (voteType === "HELPFUL") {
        article.helpfulCount += 1;
      } else {
        article.notHelpfulCount += 1;
      }
    }

    await article.save();

    return {
      helpfulCount: article.helpfulCount,
      notHelpfulCount: article.notHelpfulCount,
    };
  }

  // --- Bookmarks ---

  async bookmarkArticle(id, requestingUser) {
    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    try {
      await ArticleBookmark.create({
        article: id,
        user: requestingUser._id,
      });
      return true;
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError("You have already bookmarked this article.", 409);
      }
      throw err;
    }
  }

  async removeBookmark(id, requestingUser) {
    const deleted = await ArticleBookmark.findOneAndDelete({
      article: id,
      user: requestingUser._id,
    });
    if (!deleted) {
      throw new AppError("Bookmark not found.", 404);
    }
    return true;
  }

  async getUserBookmarks(requestingUser, { page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookmarks, total] = await Promise.all([
      ArticleBookmark.find({ user: requestingUser._id })
        .populate({
          path: "article",
          populate: { path: "author", select: "name email role" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ArticleBookmark.countDocuments({ user: requestingUser._id }),
    ]);

    const articles = bookmarks.map((b) => b.article).filter(Boolean);

    return {
      articles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // --- Version History ---

  async getArticleVersions(id, requestingUser) {
    if (requestingUser.role === "employee") {
      throw new AppError("Employees cannot view historical article version diffs.", 403);
    }

    const article = await Article.findById(id);
    if (!article) throw new AppError("Article not found.", 404);

    return ArticleVersion.find({ article: id })
      .populate("changedBy", "name email role")
      .sort({ versionNumber: -1 });
  }

  // --- Ticket-Based Knowledge Recommendations ---

  async getRecommendationsForTicket(ticketId, requestingUser, { targetCategory } = {}) {
    const ticket = await Ticket.findById(ticketId).populate("asset");
    if (!ticket) throw new AppError("Ticket not found.", 404);

    // Only published articles visible to this user
    const visFilter = this.buildVisibilityFilter(requestingUser);
    const candidateQuery = {
      status: "PUBLISHED",
      ...visFilter,
    };

    const candidates = await Article.find(candidateQuery)
      .populate("author", "name email role")
      .populate("department", "name");

    const effectiveCategory = (targetCategory || ticket.category || "GENERAL").toUpperCase();
    const compatibleCategories = (
      CATEGORY_COMPATIBILITY[effectiveCategory] || [effectiveCategory]
    ).map((c) => c.toUpperCase());

    const stopWords = new Set([
      "with",
      "from",
      "that",
      "this",
      "your",
      "have",
      "been",
      "after",
      "before",
      "will",
      "when",
      "where",
      "what",
      "which",
      "there",
      "their",
      "about",
      "issue",
      "problem",
      "ticket",
      "error",
      "help",
      "need",
      "please",
      "user",
      "update",
      "company",
      "also",
      "some",
    ]);

    const ticketWords = [
      ...ticket.title.toLowerCase().split(/\W+/),
      ...ticket.description.toLowerCase().split(/\W+/),
    ].filter((w) => w.length > 3 && !stopWords.has(w));

    const scoredArticles = candidates.map((article) => {
      let score = 0;
      const reasons = [];

      const articleCat = (article.category || "").toUpperCase();
      const isDirectCategoryMatch = articleCat === effectiveCategory;
      const isCompatibleCategory = compatibleCategories.includes(articleCat);
      const isExplicitlyLinked =
        Array.isArray(article.relatedTicketCategories) &&
        article.relatedTicketCategories
          .map((c) => c.toUpperCase())
          .includes(effectiveCategory);

      // 1. Category Matching & Consistency Guard
      if (isDirectCategoryMatch || isExplicitlyLinked) {
        score += 40;
        reasons.push(`Matches ticket category: ${effectiveCategory}`);
      } else if (isCompatibleCategory) {
        score += 25;
        reasons.push(`Compatible category: ${article.category}`);
      } else if (effectiveCategory !== "GENERAL") {
        // Strongly penalize mismatched category to prevent cross-domain contamination
        score -= 40;
      }

      // 2. Asset match
      if (
        ticket.asset &&
        article.relatedAssets.some(
          (a) => a.toString() === (ticket.asset._id || ticket.asset).toString()
        )
      ) {
        score += 25;
        reasons.push(`Linked to ticket asset (${ticket.asset.assetTag || "asset"})`);
      }

      // 3. Department match
      if (
        ticket.department &&
        article.department &&
        article.department._id.toString() === ticket.department.toString()
      ) {
        score += 15;
        reasons.push("Department-specific procedure match");
      }

      // 4. Domain Keyword & Tag matching
      const articleWords = [
        ...article.title.toLowerCase().split(/\W+/),
        ...article.tags.map((t) => t.toLowerCase()),
      ].filter((w) => w.length > 3 && !stopWords.has(w));

      const matchingKeywords = ticketWords.filter((w) => articleWords.includes(w));
      const uniqueKeywords = [...new Set(matchingKeywords)];

      if (uniqueKeywords.length > 0) {
        const keywordScore = Math.min(uniqueKeywords.length * 6, 24);
        score += keywordScore;
        reasons.push(`Keywords matched: ${uniqueKeywords.slice(0, 3).join(", ")}`);
      }

      // 5. Helpfulness boost
      if (article.helpfulCount > 0) {
        score += Math.min(article.helpfulCount, 5);
      }

      return {
        article,
        score,
        rankingReasons: reasons,
        isCompatible: isDirectCategoryMatch || isCompatibleCategory || isExplicitlyLinked,
      };
    });

    // Quality threshold: must have positive score AND meet minimum relevance threshold
    return scoredArticles
      .filter((s) => s.score >= 25 && (effectiveCategory === "GENERAL" || s.isCompatible))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // --- Summary Statistics ---

  async getArticleSummary(requestingUser) {
    const visFilter = this.buildVisibilityFilter(requestingUser);

    const [
      totalArticles,
      drafts,
      published,
      archived,
      mostViewed,
      mostHelpful,
      byCategory,
      byDepartment,
    ] = await Promise.all([
      Article.countDocuments(visFilter),
      Article.countDocuments({ ...visFilter, status: "DRAFT" }),
      Article.countDocuments({ ...visFilter, status: "PUBLISHED" }),
      Article.countDocuments({ ...visFilter, status: "ARCHIVED" }),
      Article.find({ ...visFilter, status: "PUBLISHED" })
        .sort({ viewCount: -1 })
        .limit(5)
        .select("title slug viewCount category"),
      Article.find({ ...visFilter, status: "PUBLISHED" })
        .sort({ helpfulCount: -1 })
        .limit(5)
        .select("title slug helpfulCount category"),
      Article.aggregate([
        { $match: visFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
      ]),
      Article.aggregate([
        { $match: visFilter },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "dept",
          },
        },
        {
          $project: {
            department: { $ifNull: [{ $arrayElemAt: ["$dept.name", 0] }, "General / All"] },
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    return {
      totalArticles,
      drafts,
      published,
      archived,
      mostViewed,
      mostHelpful,
      articlesByCategory: byCategory,
      articlesByDepartment: byDepartment,
    };
  }
}

export default new ArticleService();
