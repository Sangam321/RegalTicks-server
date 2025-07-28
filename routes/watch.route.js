import express from "express";
import { createWatch, createWatch_Details, editWatch, editWatch_Details, getCreatorWatchs, getPublishedWatch, getWatch_DetailsById, getWatchById, getWatchWatch_Details, removeWatch_Details, searchWatch, togglePublishWatch } from "../controllers/watch.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.route("/").post(isAuthenticated, createWatch);
router.route("/search").get(isAuthenticated, searchWatch);
router.route("/published-watchs").get(getPublishedWatch);
router.route("/").get(isAuthenticated, getCreatorWatchs);
router.route("/:watchId").put(isAuthenticated, upload.single("watchThumbnail"), editWatch);
router.route("/:watchId").get(isAuthenticated, getWatchById);
router.route("/:watchId/watch_details").post(isAuthenticated, createWatch_Details);
router.route("/:watchId/watch_details").get(isAuthenticated, getWatchWatch_Details);
router.route("/:watchId/watch_details/:watch_detailsId").post(isAuthenticated, editWatch_Details);
router.route("/watch_details/:watch_detailsId").delete(isAuthenticated, removeWatch_Details);
router.route("/watch_details/:watch_detailsId").get(isAuthenticated, getWatch_DetailsById);
router.route("/:watchId").patch(isAuthenticated, togglePublishWatch);


export default router;