import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getLikedComment,
  getLikedTweet,
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/like-video/:videoId", toggleVideoLike);
router.post("/like-comment/:commentId", toggleCommentLike);
router.post("/like-tweet/:tweetId", toggleTweetLike);
router.post("/get-like-video/:videoId", getLikedVideos);
router.post("/get-like-comment/:videoId", getLikedComment);
router.post("/get-like-tweet/:videoId", getLikedTweet);

export default router;
