import { Router } from "express";

import AuthenticationController from "../controllers/authentication.controller.js";

// Create a new Router instance
const router = Router();

// Register the endpoints
router.post("/register", AuthenticationController.register);
router.post("/login", AuthenticationController.login);
router.post("/logout", AuthenticationController.logout);
router.post("/reset-password", AuthenticationController.resetPassword);
router.post("/verify", AuthenticationController.verify);

export default router;
