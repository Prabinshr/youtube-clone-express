import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideo,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/add-video").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  publishVideo
);

router.patch("/update-video/:videoId",upload.single("thumbnail"), verifyJwt, updateVideo);
router.patch("/toggle-publish-video/:videoId", verifyJwt, togglePublishStatus);
router.get("/get-all-video", verifyJwt, getAllVideo);
router.delete("/delete-video/:videoId", deleteVideo);

export default router;
