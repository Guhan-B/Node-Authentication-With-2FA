import { Router } from "express";

import { authenticationHandler } from "../middlewares/index.js";
import authenticationRoutes from "./authentication.router.js";
import userRoutes from "./user.router.js";

// Create a new Router instance
const router = Router();

// Mount the routers
router.use("/authentication", authenticationRoutes);
router.use("/user", authenticationHandler(), userRoutes);

export default router;
