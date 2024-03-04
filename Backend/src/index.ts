import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { JwtPayload } from "jwt-decode";

import logger from "./utilities/logger.js";
import router from "./routes/index.js";
import errorMiddelware from "./middlewares/error.middleware.js";
import validatorMiddelware from "./middlewares/validator.middleware.js";

dotenv.config();
declare global {
    namespace Express {
        export interface Request {
            uid?: string;
        }
    }

    type CustomJwtPayload = JwtPayload & {
        tid?: string;
        uid: string;
        createdAt?: string;
    };
}

const server = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(validatorMiddelware());

    app.use("/", router);

    app.use(errorMiddelware());

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        logger.info(`Server is started and is running on port ${PORT}`);
    });
};

server();
