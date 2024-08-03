import { ErrorRequestHandler } from "express";

import { ServerError } from "../utilities/error.js";
import logger from "../utilities/logger.js";

const handler = (): ErrorRequestHandler => (error, request, response, next) => {  
    if (!(error instanceof ServerError)) {
        error = ServerError.InternalServerError({
            message: "Unknown error occured",
            details: error.stack
        });
    }
    
    if (error.status == 500) {
        logger.fatal(error)
        error.error.details = "";
    }

    return response.status(error.status).json({ ...error });
};

export default handler;
