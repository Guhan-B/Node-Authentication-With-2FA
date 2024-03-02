import { RequestHandler } from "express";
import Joi from "joi";

import { ServerError, E } from "../utilities/error.js";
import requestSchemas from "../utilities/request.js";

const handler = (): RequestHandler => (request, response, next) => {
    const schema: Joi.ObjectSchema<any> | undefined = requestSchemas.get(request.url);

    if (schema === undefined) {
        next();
    } else {
        const validationResult: Joi.ValidationResult<any> = schema.validate(request.body, { abortEarly: false });

        if (validationResult.error === undefined) {
            next();
        } else {
            const errors: Array<E> = validationResult.error.details.map((detail) => ({
                cause: detail.path.join("."),
                message: detail.message
            }));

            next(new ServerError("VALIDATION_ERROR", errors));
        }
    }
};

export default handler;
