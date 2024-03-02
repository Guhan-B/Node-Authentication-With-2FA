import { Router } from "express";

import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import authenticationRoutes from "./authentication.router.js";
import userRoutes from "./user.router.js";

// Create a new Router instance
const router = Router();

// Mount the routers
router.use("/authentication", authenticationRoutes);
router.use("/user", authenticationMiddleware(), userRoutes);

export default router;
