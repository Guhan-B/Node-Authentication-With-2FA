import { Router } from "express";

import { userController } from "../controllers/index.js";

// Create a new Router instance
const router = Router();

// Register the endpoints
router.get("/profile", userController.fetchProfile);
router.post("/profile", userController.editProfile);

export default router;
