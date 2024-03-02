import { Router } from "express";

import UserController from "../controllers/user.controller.js";

// Create a new Router instance
const router = Router();

// Register the endpoints
router.get("/profile", UserController.fetchProfile);
router.post("/profile", UserController.editProfile);

export default router;
