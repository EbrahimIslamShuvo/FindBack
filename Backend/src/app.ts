import express from "express";

import cors from "cors";

import path from "path";

import {AuthRoutes,} from "./modules/Auth/auth.route.js";
import postRoutes from "./modules/Post/post.route.js";
import { UserRoutes } from "./modules/User/user.route.js";
import ClaimRoutes from "./modules/claim/claim.router.js";
import aiRoutes from "./modules/ai/ai.routes.js";

const app =
  express();

app.use(
  cors({
    origin:
      "http://localhost:5173",

    credentials: true,
  })
);


app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended: true,
  })
);


// =====================================
// STATIC UPLOADS
// =====================================

app.use(
  "/uploads",

  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);


// =====================================
// ROUTES
// =====================================
app.use(
  "/api/auth",
  AuthRoutes
);
app.use(
  "/api/posts",
  postRoutes
);
app.use(
  "/api/users",   
  UserRoutes
);

app.use(
  "/api/claims",
  ClaimRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);

app.get(
  "/",
  (req, res) => {

    res.json({

      success: true,

      message:
        "FindBack server is running",

    });

  }
);


export default app;