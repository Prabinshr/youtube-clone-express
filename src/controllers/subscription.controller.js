import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel was not found");
  }
  const channelExist = await User.findById(channelId);

  if (!channelExist) {
    throw new ApiError(404, "channel not found");
  }

  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (!subscription) {
    const createSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    if (!createSubscription) {
      throw new ApiError(404, "Error while subscribing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createSubscription,
          "channel subscribed successfully"
        )
      );
  } else {
    const deleteSubscription = await Subscription.deleteOne({
      subscriber: userId,
      channel: channelId,
    });

    if (!deleteSubscription) {
      throw new ApiError(404, "Error while unsubscribing");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "channel unsubscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channelExists = await User.findById(channelId);

  if (!channelExists) {
    throw new ApiError(404, "channel not found");
  }

  const subscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberInfo: {
          $first: "$subscriberInfo",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const userExists = await User.findById(subscriberId);

  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  const subscribedChannels = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelInfo: {
          $first: "$channelInfo",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "channels subscribed by user fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
