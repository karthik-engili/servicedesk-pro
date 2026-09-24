import articleService from "../services/articleService.js";
import { sendSuccess } from "../utils/response.js";

export const createArticle = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Knowledge base article created as draft.",
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const listArticles = async (req, res, next) => {
  try {
    const result = await articleService.listArticles(req.query, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Articles retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const searchArticles = async (req, res, next) => {
  try {
    const { q, category, department } = req.query;
    const articles = await articleService.searchArticles({ q, category, department }, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Search results retrieved.",
      data: { articles },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleSummary = async (req, res, next) => {
  try {
    const summary = await articleService.getArticleSummary(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Knowledge base statistics retrieved.",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await articleService.getRecommendationsForTicket(
      req.query.ticketId,
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Knowledge recommendations generated for ticket.",
      data: { recommendations },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const result = await articleService.getUserBookmarks(req.user, req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Bookmarked articles retrieved.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const article = await articleService.getArticleById(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article retrieved successfully.",
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article updated successfully.",
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const publishArticle = async (req, res, next) => {
  try {
    const article = await articleService.publishArticle(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article published successfully.",
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const archiveArticle = async (req, res, next) => {
  try {
    const article = await articleService.archiveArticle(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article archived successfully.",
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishArticle = async (req, res, next) => {
  try {
    const article = await articleService.unpublishArticle(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article reverted to draft.",
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    await articleService.deleteArticle(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const submitHelpful = async (req, res, next) => {
  try {
    const counts = await articleService.submitFeedback(req.params.id, true, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Feedback recorded: Helpful.",
      data: counts,
    });
  } catch (error) {
    next(error);
  }
};

export const submitNotHelpful = async (req, res, next) => {
  try {
    const counts = await articleService.submitFeedback(req.params.id, false, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Feedback recorded: Not Helpful.",
      data: counts,
    });
  } catch (error) {
    next(error);
  }
};

export const bookmarkArticle = async (req, res, next) => {
  try {
    await articleService.bookmarkArticle(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Article added to bookmarks.",
    });
  } catch (error) {
    next(error);
  }
};

export const removeBookmark = async (req, res, next) => {
  try {
    await articleService.removeBookmark(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article removed from bookmarks.",
    });
  } catch (error) {
    next(error);
  }
};

export const getVersions = async (req, res, next) => {
  try {
    const versions = await articleService.getArticleVersions(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Article revision history retrieved.",
      data: { versions },
    });
  } catch (error) {
    next(error);
  }
};
