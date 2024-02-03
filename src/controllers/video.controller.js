import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  // get data from user
  // validate
  // add video and thumbnail
  // add video and thumbnail on cloudinary
  // create video object
  // check for video creation
  // return res
  const { title, description } = req.body;
  const owner = req.user?._id;
  if (!owner) {
    throw new ApiError(400, "User is not found");
  }

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title or description is required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath && !thumbnailLocalPath) {
    throw new ApiError(400, "video and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  console.log();

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile && !thumbnail) {
    throw new ApiError(400, "video and thumbnail are required");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: owner,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been uploaded"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video is not found");
  }

  const owner = req.user?._id;

  if (!owner) {
    throw new ApiError(400, "User is not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video is not found");
  }

  if (video.owner.toString() !== owner.toString()) {
    throw new ApiError(400, "It's not user video");
  }

  const thumbnailLocalPath = req.file?.path;

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video detail updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video is not found");
  }

  const findVideo = await Video.findById(videoId);

  if (!findVideo) {
    throw new ApiError(400, "Video is not found");
  }

  const video = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video has been deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video is not found");
  }

  const isPublished = video.isPublished;

  const togglePublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !isPublished,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, togglePublish, "Toggle publish status"));
});

const getAllVideo = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    title,
    sortBy,
    sortType,
    owner,
  } = req.query;

  const userId = req.user?._id;

  const filter = {isPublished:true};

  if (query) {
    filter.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { description: { $regex: new RegExp(query, "i") } },
    ];
  }

  if (title) {
    filter.title = { $regex: new RegExp(title, "i") };
  }

  if (owner) {
    // Add the user ID filter if userId is provided
    filter.owner = owner || userId;
  }

  const sort = {};

  if (sortBy) {
    sort[sortBy] = sortType === "createdAt" ? -1 : 1;
  } else {
    // Default sorting (e.g., by creation date)
    sort.createdAt = -1;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  // Pagination
  const skip = (page - 1) * limit;

  // const video = await Video.find({isPublished:true})

  //   .limit(parseInt(limit, 10))
  //   .sort(sort)
  //   .skip(skip)
  //   .exec();

  // const videoAggregationPipeline = Video.aggregate([
  //   {
  //     $match: {
  //       $or: [
  //         {
  //           owner: new mongoose.Types.ObjectId(userId),
  //         },
  //         {
  //           title: {
  //             $regex: query.pattern,
  //             $options: "i",
  //           },
  //         },
  //         {
  //           owner: {
  //             $regex: query.pattern,
  //             $options: "i",
  //           },
  //         },
  //         {
  //           isPublished: true,
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $sort: sort,
  //   },
  // ]);

  // const videoAggregationPipeline = Video.aggregate([
  //   {
  //     $search: {
  //       index: "search-video",
  //       text: {
  //         query: query,
  //         path: ["title", "description"],
  //       },
  //     },
  //   },
  //   { $match: { owner: new mongoose.Types.ObjectId(owner || userId) } },
  // ]);

  // const videos = await Video.aggregatePaginate(
  //   videoAggregationPipeline,
  //   options
  // );

  //final query 
  
  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(new ApiResponse(200, videos, "Get User video"));
});

export {
  publishVideo,
  updateVideo,
  getAllVideo,
  deleteVideo,
  togglePublishStatus,
};
