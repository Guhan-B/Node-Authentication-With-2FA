import { ErrorRequestHandler } from "express";

import { ServerError } from "../utilities/error.js";
import logger from "../utilities/logger.js";

const handler = (): ErrorRequestHandler => (error, request, response, next) => {
    if (error instanceof ServerError) {
        logger.error(error);
    } else {
        logger.fatal(error);
        error = new ServerError("INTERNAL_SERVER_ERROR", []);
    }
    return response.status(error.status).json({ error });
};

export default handler;
