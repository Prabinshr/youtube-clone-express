import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  // fetch data from user
  // validate data
  // check username and email is available or not
  // check for imgaes
  // upload avatar and coverimage in cloudinary
  // create user object
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All field are required");
  }

  const existUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existUser) {
    throw new ApiError(400, "Username or email already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  //   const coverImageLocalPath = req.files?.avatar[0]?.path

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url,
  });

  const newUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, newUser, "User register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // fetch data for user
  // validate
  // check user is available or not
  // validate password
  // generate tokens
  // create user object
  // remove password and token
  // return res

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username and email are required");
  }

  if (!password) {
    throw new ApiError(400, "Password are required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(400, "Username or email was not found");
  }

  const correctPassword = await user.isPasswordCorrect(password);

  if (!correctPassword) {
    throw new ApiError(400, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!loginUser) {
    throw new ApiError(500, "Something went wrong while fetching user data");
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loginUser, accessToken, refreshToken },
        "User login succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "logout user"));
});

const changepassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been change"));
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;

  // if (!fullName || !email) {
  //   throw new ApiError(400, "All field required");
  // }

  //   const existUser = await User.findOne({ $or: [{ username }, { email }] });

  //   if (existUser) {
  //       throw new ApiError(400, "Username or email already exist");
  //     }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        username,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User detail updated"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
      throw new ApiError(400, "Unauthorized request");
    }
    const decodeToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token ");
    }

    if (incomingToken !== user?.refreshToken) {
      throw new ApiError(401, " refresh token is expired or used");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current User"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Avatar uploading error");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Update avatar succesfully"));
});

const updatecoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "coverImage uploading error");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Update coverImage succesfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    { $match: { username: username?.toLowerCase() } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        avatar: 1,
        email: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel fetch successfully"));
});

const watchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
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
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History Fetch"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changepassword,
  updateAccountDetail,
  refreshAccessToken,
  getCurrentUser,
  updateAvatar,
  updatecoverImage,
  getUserChannelProfile,
  watchHistory,
};
