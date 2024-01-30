import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/create-playlist/:videoId", createPlaylist);
router.get("/user-playlist/:userId", getUserPlaylists);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.patch("/add/:videoId/:playlistId", addVideoToPlaylist);
router.patch("/remove/:videoId/:playlistId", removeVideoFromPlaylist);

export default router;
