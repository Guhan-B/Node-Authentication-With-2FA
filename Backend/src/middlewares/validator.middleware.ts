import { RequestHandler } from "express";
import Joi from "joi";

import { ServerError } from "../utilities/error.js";
import RequestSchemas from "../utilities/requestSchema.js";

const handler = (): RequestHandler => (request, response, next) => {
    const schema: Joi.ObjectSchema<any> | undefined = RequestSchemas.get(request.method + ":" + request.url);

    if (schema === undefined) {
        next();
    } else {
        const validationResult: Joi.ValidationResult<any> = schema.validate(request.body, { abortEarly: false });

        if (validationResult.error === undefined) {
            next();
        } else {
            const errors = validationResult.error.details.map((detail) => ({
                cause: detail.path.join("."),
                message: detail.message
            }));

            next(ServerError.ValidationError(errors));
        }
    }
};

export default handler;
