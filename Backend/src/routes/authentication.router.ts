import { Router } from "express";

import AuthenticationController from "../controllers/authentication.controller.js";

// Create a new Router instance
const router = Router();

// Register the endpoints
router.get("/login/verify", AuthenticationController.generateOTP);

router.post("/register", AuthenticationController.register);
router.post("/login", AuthenticationController.login);
router.post("/login/verify", AuthenticationController.verifyOTP);
router.post("/logout", AuthenticationController.logout);
router.post("/reset-password", AuthenticationController.resetPassword);

export default router;
