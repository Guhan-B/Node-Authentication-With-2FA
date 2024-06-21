import { Router } from "express";

import { authenticationHandler } from "../middlewares/index.js";
import { authenticationController } from "../controllers/index.js";

// Create a new Router instance
const router = Router();

// Register the endpoints
router.post("/register", authenticationController.register);

router.post("/login", authenticationController.loginGenerateOTP);
router.post("/login/verify", authenticationController.loginVerifyOTP);

router.get("/password/reset", authenticationHandler(), authenticationController.resetPasswordGenerateOTP);
router.post("/password/reset", authenticationHandler(), authenticationController.resetPasswordVerifyOTP);

router.delete("/logout", authenticationHandler(), authenticationController.logout);

export default router;
