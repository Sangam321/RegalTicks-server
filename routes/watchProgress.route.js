import express from "express";
import { getWatchProgress, markAsCompleted, markAsInCompleted, updateWatch_DetailsProgress } from "../controllers/watchProgress.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router()

router.route("/:watchId").get(isAuthenticated, getWatchProgress);
router.route("/:watchId/watch_details/:watch_detailsId/view").post(isAuthenticated, updateWatch_DetailsProgress);
router.route("/:watchId/complete").post(isAuthenticated, markAsCompleted);
router.route("/:watchId/incomplete").post(isAuthenticated, markAsInCompleted);

export default router;