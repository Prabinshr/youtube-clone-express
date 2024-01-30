import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJwt);

router.post("/get-video-comment/:videoId", getVideoComments);
router.post("/add-comment/:videoId", addComment);
router.patch("/update-comment/:commentId", updateComment);
router.delete("/delete-comment/:commentId", deleteComment);

export default router;
