import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.static("public"));
app.use(cookieParser());

// import router

import userRoute from "./routes/user.routes.js";
import tweetRoute from "./routes/tweet.routes.js";
import videoRoute from "./routes/video.routes.js";
import subscriptionRoute from "./routes/subscription.routes.js";
import likeRoute from "./routes/like.routes.js";
import commentRoute from "./routes/comment.routes.js";
import playlistRoute from "./routes/playlist.routes.js";

//route decleration
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/video", videoRoute);
app.use("/api/v1/subscription", subscriptionRoute);
app.use("/api/v1/like", likeRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/playlist", playlistRoute);

export { app };
