import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getAllTweet,
  getUserTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/add-tweet").post(verifyJwt, createTweet);
router.route("/get-tweet").get(verifyJwt, getUserTweet);
router.route("/get-all-tweet").get(getAllTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
