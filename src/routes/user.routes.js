import { Router } from "express";
import {
  changepassword,
  getCurrentUser,
  getUserChannelProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetail,
  updateAvatar,
  updatecoverImage,
  watchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/changepassword").post(verifyJwt, changepassword);
router.route("/update-account-detail").patch(verifyJwt, updateAccountDetail);
router.route("/refresh-access-token").post(verifyJwt, refreshAccessToken);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router
  .route("/update-avatar")
  .post(verifyJwt, upload.single("avatar"), updateAvatar);
router
  .route("/update-coverimage")
  .post(verifyJwt, upload.single("coverImage"), updatecoverImage);
router.route("/channel/:username").get(verifyJwt, getUserChannelProfile);
router.route("/watch-history").get(verifyJwt, watchHistory);

export default router;
