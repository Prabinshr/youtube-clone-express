import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid id");
  }

  if (
    [name, description].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All field are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
    videos: [videoId],
  });

  if (!playlist) {
    throw new ApiError(400, "Error while creating playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist create successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User was not found");
  }
  const userPlaylist = await Playlist.find({ owner: userId });

  if (!userPlaylist) {
    throw new ApiError(400, "Error while get user playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "user playlist "));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist was not found");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Error in fetching playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "get playlist by id "));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId || !isValidObjectId(videoId))) {
    throw new ApiError(400, "Invalid Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: [videoId],
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId || !isValidObjectId(videoId))) {
    throw new ApiError(400, "Invalid Id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  const videoIndex = playlist.videos.indexOf(videoId)
  if (videoIndex === -1) {
    throw new ApiError(404, "video not found");
  }

  const updatedPlaylist = playlist.videos.splice(videoIndex, 1);
  if (!updatedPlaylist) {
    throw new ApiError(400, "Error while removing video from playlist");
  }

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));


});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist was not found");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Error in fetching playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "delete playlist by id "));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist was not found");
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(400, "Error in fetching playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, "get playlist by id "));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
