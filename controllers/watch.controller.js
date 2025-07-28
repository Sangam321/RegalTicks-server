
import { Watch } from "../models/watch.model.js";
import { Watch_Details } from "../models/watch_details.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createWatch = async (req, res) => {
    try {
        const { watchTitle, category } = req.body;
        if (!watchTitle || !category) {
            return res.status(400).json({
                message: "Watch title and category is required."
            })
        }

        const watch = await Watch.create({
            watchTitle,
            category,
            creator: req.id
        });

        return res.status(201).json({
            watch,
            message: "Watch created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create watch"
        })
    }
}

export const searchWatch = async (req, res) => {
    try {
        const { query = "", categories = [], sortByPrice = "" } = req.query;
        console.log(categories);

        // create search query
        const searchCriteria = {
            isPublished: true,
            $or: [
                { watchTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        }

        // if categories selected
        if (categories.length > 0) {
            searchCriteria.category = { $in: categories };
        }

        // define sorting order
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.watchPrice = 1;//sort by price in ascending
        } else if (sortByPrice === "high") {
            sortOptions.watchPrice = -1; // descending
        }

        let watchs = await Watch.find(searchCriteria).populate({ path: "creator", select: "name photoUrl" }).sort(sortOptions);

        return res.status(200).json({
            success: true,
            watchs: watchs || []
        });

    } catch (error) {
        console.log(error);

    }
}

export const getPublishedWatch = async (_, res) => {
    try {
        const watchs = await Watch.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" });
        if (!watchs) {
            return res.status(404).json({
                message: "Watch not found"
            })
        }
        return res.status(200).json({
            watchs,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get published watchs"
        })
    }
}
export const getCreatorWatchs = async (req, res) => {
    try {
        const userId = req.id;
        const watchs = await Watch.find({ creator: userId });
        if (!watchs) {
            return res.status(404).json({
                watchs: [],
                message: "Watch not found"
            })
        };
        return res.status(200).json({
            watchs,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create watch"
        })
    }
}
export const editWatch = async (req, res) => {
    try {
        const watchId = req.params.watchId;
        const { watchTitle, subTitle, description, category, watchLevel, watchPrice } = req.body;
        const thumbnail = req.file;

        let watch = await Watch.findById(watchId);
        if (!watch) {
            return res.status(404).json({
                message: "Watch not found!"
            })
        }
        let watchThumbnail;
        if (thumbnail) {
            if (watch.watchThumbnail) {
                const publicId = watch.watchThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }
            // upload a thumbnail on clourdinary
            watchThumbnail = await uploadMedia(thumbnail.path);
        }


        const updateData = { watchTitle, subTitle, description, category, watchLevel, watchPrice, watchThumbnail: watchThumbnail?.secure_url };

        watch = await Watch.findByIdAndUpdate(watchId, updateData, { new: true });

        return res.status(200).json({
            watch,
            message: "Watch updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create watch"
        })
    }
}
export const getWatchById = async (req, res) => {
    try {
        const { watchId } = req.params;

        const watch = await Watch.findById(watchId);

        if (!watch) {
            return res.status(404).json({
                message: "Watch not found!"
            })
        }
        return res.status(200).json({
            watch
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get watch by id"
        })
    }
}

export const createWatch_Details = async (req, res) => {
    try {
        const { watch_detailsTitle } = req.body;
        const { watchId } = req.params;

        if (!watch_detailsTitle || !watchId) {
            return res.status(400).json({
                message: "Watch_Details title is required"
            })
        };

        // create watch_details
        const watch_details = await Watch_Details.create({ watch_detailsTitle });

        const watch = await Watch.findById(watchId);
        if (watch) {
            watch.watch_detailss.push(watch_details._id);
            await watch.save();
        }

        return res.status(201).json({
            watch_details,
            message: "Watch_Details created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create watch_details"
        })
    }
}
export const getWatchWatch_Details = async (req, res) => {
    try {
        const { watchId } = req.params;
        const watch = await Watch.findById(watchId).populate("watch_detailss");
        if (!watch) {
            return res.status(404).json({
                message: "Watch not found"
            })
        }
        return res.status(200).json({
            watch_detailss: watch.watch_detailss
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get watch_detailss"
        })
    }
}
export const editWatch_Details = async (req, res) => {
    try {
        const { watch_detailsTitle, videoInfo, isPreviewFree } = req.body;

        const { watchId, watch_detailsId } = req.params;
        const watch_details = await Watch_Details.findById(watch_detailsId);
        if (!watch_details) {
            return res.status(404).json({
                message: "Watch_Details not found!"
            })
        }

        // update watch_details
        if (watch_detailsTitle) watch_details.watch_detailsTitle = watch_detailsTitle;
        if (videoInfo.videoUrl) watch_details.videoUrl = videoInfo.videoUrl;
        if (videoInfo.publicId) watch_details.publicId = videoInfo.publicId;
        watch_details.isPreviewFree = isPreviewFree;

        await watch_details.save();

        // Ensure the watch still has the watch_details id if it was not aleardy added;
        const watch = await Watch.findById(watchId);
        if (watch && !watch.watch_detailss.includes(watch_details._id)) {
            watch.watch_detailss.push(watch_details._id);
            await watch.save();
        };
        return res.status(200).json({
            watch_details,
            message: "Watch_Details updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to edit watch_detailss"
        })
    }
}
export const removeWatch_Details = async (req, res) => {
    try {
        const { watch_detailsId } = req.params;
        const watch_details = await Watch_Details.findByIdAndDelete(watch_detailsId);
        if (!watch_details) {
            return res.status(404).json({
                message: "Watch_Details not found!"
            });
        }
        // delete the watch_details from couldinary as well
        if (watch_details.publicId) {
            await deleteVideoFromCloudinary(watch_details.publicId);
        }

        // Remove the watch_details reference from the associated watch
        await Watch.updateOne(
            { watch_detailss: watch_detailsId }, // find the watch that contains the watch_details
            { $pull: { watch_detailss: watch_detailsId } } // Remove the watch_detailss id from the watch_detailss array
        );

        return res.status(200).json({
            message: "Watch_Details removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove watch_details"
        })
    }
}
export const getWatch_DetailsById = async (req, res) => {
    try {
        const { watch_detailsId } = req.params;
        const watch_details = await Watch_Details.findById(watch_detailsId);
        if (!watch_details) {
            return res.status(404).json({
                message: "Watch_Details not found!"
            });
        }
        return res.status(200).json({
            watch_details
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get watch_details by id"
        })
    }
}


// publich unpublish watch logic

export const togglePublishWatch = async (req, res) => {
    try {
        const { watchId } = req.params;
        const { publish } = req.query; // true, false
        const watch = await Watch.findById(watchId);
        if (!watch) {
            return res.status(404).json({
                message: "Watch not found!"
            });
        }
        // publish status based on the query paramter
        watch.isPublished = publish === "true";
        await watch.save();

        const statusMessage = watch.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `Watch is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update status"
        })
    }
}
