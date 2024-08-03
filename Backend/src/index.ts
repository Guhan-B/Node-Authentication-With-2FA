import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { JwtPayload } from "jwt-decode";

import logger from "./utilities/logger.js";
import router from "./routes/index.js";
import { errorHandler, validationHandler } from "./middlewares/index.js";

declare global {
    namespace Express {
        export interface Request {
            uid?: string;
        }
    }

    type CustomJwtPayload = JwtPayload & {
        uid: string;
    };
}

const server = () => {
    const app: Express = express();

    app.use(cors({ origin: ["http://localhost:8000"]  }));
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(validationHandler());
    app.use("/", router);
    app.use(errorHandler());

    const serverHost = process.env.HOST || "0.0.0.0";
    const serverPort = Number.parseInt(process.env.PORT || "80");

    app.listen(serverPort, serverHost, () => {
        logger.info(`Server is started and is running on port ${serverHost}:${serverPort}`);
    });
};

server();
