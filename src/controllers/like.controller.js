import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video not found");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const likedOrNot = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (!likedOrNot) {
    const liked = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    if (!liked) {
      throw new ApiError(400, "Error while liking a video");
    }
    console.log(liked);

    return res
      .status(200)
      .json(new ApiResponse(200, liked, "video liked successfully"));
  } else {
    const liked = await Like.deleteOne({
      video: videoId,
      likedBy: userId,
    });
    if (!liked) {
      throw new ApiError(400, "Error while unliking a video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "commentId not found");
  }
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  const likedOrNot = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (!likedOrNot) {
    const liked = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    if (!liked) {
      throw new ApiError(400, "Error while liking a comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, liked, "comment liked successfully"));
  } else {
    const liked = await Like.deleteOne({
      comment: commentId,
      likedBy: userId,
    });
    if (!liked) {
      throw new ApiError(400, "Error while unliking a comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet

  const { tweetId } = req.params;

  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "tweet not found");
  }
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  const likedOrNot = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (!likedOrNot) {
    const liked = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!liked) {
      throw new ApiError(400, "Error while liking a tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, liked, "tweet liked successfully"));
  } else {
    const liked = await Like.deleteOne({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!liked) {
      throw new ApiError(400, "Error while unliking a tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "Video not found");
  }

  const countLike = await Like.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedInfo: {
          $first: "$likedInfo",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, countLike, "Video like count fetched successfully")
    );
});
const getLikedComment = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "Video not found");
  }

  const countLike = await Like.aggregate([
    { $match: { comment: new mongoose.Types.ObjectId(commentId) } },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedInfo: {
          $first: "$likedInfo",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, countLike, "Video like count fetched successfully")
    );
});
const getLikedTweet = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(404, "Video not found");
  }

  const countLike = await Like.aggregate([
    { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likedInfo: {
          $first: "$likedInfo",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, countLike, "Video like count fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos,getLikedComment,getLikedTweet };
