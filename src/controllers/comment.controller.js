import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const isVideoExists = await Video.findById(videoId);

  if (!isVideoExists) {
    throw new ApiError(404, "video not found");
  }

  const options = {
    page,
    limit,
  };

  const aggregationPipeline  = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      $sort:{
        createdAt:-1
      } 
    },
  ]);
  
  const comments = await Comment.aggregatePaginate(aggregationPipeline,options)
  if (comments.totalDocs === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video has no comments"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { content } = req.body;
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid object id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(400, "Error while uploading comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Video comment successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { content } = req.body;
  const { commentId } = req.params;

  if (!commentId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updateComment, "Video comment update successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const deleteComment = await Comment.findByIdAndDelete(commentId);

  if (!deleteComment) {
    throw new ApiError(400, "comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video comment delete successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
