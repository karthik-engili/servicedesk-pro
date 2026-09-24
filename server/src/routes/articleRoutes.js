import { Router } from "express";
import * as articleController from "../controllers/articleController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateCreateArticle,
  validateUpdateArticle,
} from "../validators/articleValidator.js";

const router = Router();

router.use(authenticate);

// Special / Aggregated routes (MUST be registered before /:id)
router.get("/search", articleController.searchArticles);
router.get("/summary", articleController.getArticleSummary);
router.get("/recommendations", articleController.getRecommendations);
router.get("/bookmarks/me", articleController.getBookmarks);

// Core CRUD
router.post("/", validateCreateArticle, articleController.createArticle);
router.get("/", articleController.listArticles);
router.get("/:id", articleController.getArticleById);
router.patch("/:id", validateUpdateArticle, articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);

// Publishing Lifecycle Actions
router.post("/:id/publish", articleController.publishArticle);
router.post("/:id/archive", articleController.archiveArticle);
router.post("/:id/unpublish", articleController.unpublishArticle);

// Feedback Actions
router.post("/:id/helpful", articleController.submitHelpful);
router.post("/:id/not-helpful", articleController.submitNotHelpful);

// Bookmark Actions
router.post("/:id/bookmark", articleController.bookmarkArticle);
router.delete("/:id/bookmark", articleController.removeBookmark);

// Version History Sub-resource
router.get("/:id/versions", articleController.getVersions);

export default router;
