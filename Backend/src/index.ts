import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { JwtPayload } from "jwt-decode";

import logger from "./utilities/logger.js";
import router from "./routes/index.js";
import { errorHandler, validationHandler } from "./middlewares/index.js";

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

    app.use(pinoHttp({ logger: logger, useLevel: "trace" }))
    app.use(helmet())
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(validationHandler());
    app.use("/", router);
    app.use(errorHandler());

    const serverHost = process.env.SERVER_HOST || "localhost";
    const serverPort = process.env.SERVER_PORT || "8000";

    app.listen(Number.parseInt(serverPort), serverHost, () => {
        logger.info(`Server is started and is running on port ${serverHost}:${serverPort}`);
    });
};

server();
