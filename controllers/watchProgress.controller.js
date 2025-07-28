import { Watch } from "../models/watch.model.js";
import { WatchProgress } from "../models/watchProgress.js";

export const getWatchProgress = async (req, res) => {
  try {
    const { watchId } = req.params;
    const userId = req.id;

    // step-1 fetch the user watch progress
    let watchProgress = await WatchProgress.findOne({
      watchId,
      userId,
    }).populate("watchId");

    const watchDetails = await Watch.findById(watchId).populate("watch_detailss");

    if (!watchDetails) {
      return res.status(404).json({
        message: "Watch not found",
      });
    }

    // Step-2 If no progress found, return watch details with an empty progress
    if (!watchProgress) {
      return res.status(200).json({
        data: {
          watchDetails,
          progress: [],
          completed: false,
        },
      });
    }

    // Step-3 Return the user's watch progress alog with watch details
    return res.status(200).json({
      data: {
        watchDetails,
        progress: watchProgress.watch_detailsProgress,
        completed: watchProgress.completed,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateWatch_DetailsProgress = async (req, res) => {
  try {
    const { watchId, watch_detailsId } = req.params;
    const userId = req.id;

    // fetch or create watch progress
    let watchProgress = await WatchProgress.findOne({ watchId, userId });

    if (!watchProgress) {
      // If no progress exist, create a new record
      watchProgress = new WatchProgress({
        userId,
        watchId,
        completed: false,
        watch_detailsProgress: [],
      });
    }

    // find the watch_details progress in the watch progress
    const watch_detailsIndex = watchProgress.watch_detailsProgress.findIndex(
      (watch_details) => watch_details.watch_detailsId === watch_detailsId
    );

    if (watch_detailsIndex !== -1) {
      // if watch_details already exist, update its status
      watchProgress.watch_detailsProgress[watch_detailsIndex].viewed = true;
    } else {
      // Add new watch_details progress
      watchProgress.watch_detailsProgress.push({
        watch_detailsId,
        viewed: true,
      });
    }

    // if all watch_details is complete
    const watch_detailsProgressLength = watchProgress.watch_detailsProgress.filter(
      (watch_detailsProg) => watch_detailsProg.viewed
    ).length;

    const watch = await Watch.findById(watchId);

    if (watch.watch_detailss.length === watch_detailsProgressLength)
      watchProgress.completed = true;

    await watchProgress.save();

    return res.status(200).json({
      message: "Watch_Details progress updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { watchId } = req.params;
    const userId = req.id;

    const watchProgress = await WatchProgress.findOne({ watchId, userId });
    if (!watchProgress)
      return res.status(404).json({ message: "Watch progress not found" });

    watchProgress.watch_detailsProgress.map(
      (watch_detailsProgress) => (watch_detailsProgress.viewed = true)
    );
    watchProgress.completed = true;
    await watchProgress.save();
    return res.status(200).json({ message: "Watch marked as completed." });
  } catch (error) {
    console.log(error);
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { watchId } = req.params;
    const userId = req.id;

    const watchProgress = await WatchProgress.findOne({ watchId, userId });
    if (!watchProgress)
      return res.status(404).json({ message: "Watch progress not found" });

    watchProgress.watch_detailsProgress.map(
      (watch_detailsProgress) => (watch_detailsProgress.viewed = false)
    );
    watchProgress.completed = false;
    await watchProgress.save();
    return res.status(200).json({ message: "Watch marked as incompleted." });
  } catch (error) {
    console.log(error);
  }
};
