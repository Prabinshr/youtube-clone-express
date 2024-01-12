import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (content.trim() === "") {
    throw new ApiError(400, "content is required for tweet");
  }
  const owner = req.user?._id;

  if (!owner) {
    throw new ApiError(400, "User is not found");
  }

  const tweet = await Tweet.create({
    content,
    owner: owner,
  });
  return res.status(200).json(new ApiResponse(200, tweet, "Tweet has upload"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: req.user._id,
      },
    },
    {
      $project: {
        username: 1,
      },
    },
  ]);

  const userTweet = await Tweet.find({ owner: req.user?._id });
  
  if (!userTweet) {
    throw new ApiError(400, "User was not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { userTweet, user }, "User tweet"));
});

const getAllTweet = asyncHandler(async (req, res) => {
  const tweet = await Tweet.find();

  if (!tweet) {
    throw new ApiError(400, "User was not found");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "User tweet"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet was not found");
  }

  await Tweet.findByIdAndDelete(tweetId);

  res.status(200).json(new ApiResponse(200, {}, "tweet has been deleted"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params;

  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet was not found");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content } },
    { new: true }
  );
  tweet.save()

  res.status(200).json(new ApiResponse(200, tweet, "Updated tweet"));
});

export { createTweet, getUserTweet, getAllTweet, deleteTweet,updateTweet };
