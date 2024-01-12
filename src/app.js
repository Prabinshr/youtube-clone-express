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
import tweetRoute from "./routes/tweet.routes.js"

//route decleration
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tweet", tweetRoute);

export { app };
