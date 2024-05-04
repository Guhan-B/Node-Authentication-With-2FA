import { Router } from "express";

import { authenticationHandler } from "../middlewares/index.js";
import { authenticationController } from "../controllers/index.js";

// Create a new Router instance
const router = Router();

// Register the endpoints
router.get("/login/verify", authenticationController.generateOTP);

router.post("/register", authenticationController.register);
router.post("/login", authenticationController.login);
router.post("/login/verify", authenticationController.verifyOTP);
router.delete("/logout", authenticationHandler(), authenticationController.logout);
router.post("/reset-password", authenticationController.resetPassword);

export default router;
