import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post("/toggle-subscription/:channelId", verifyJwt, toggleSubscription);
router.post("/subscribers/:channelId", getUserChannelSubscribers);
router.post("/subscribed/:subscriberId", getSubscribedChannels);

export default router;
