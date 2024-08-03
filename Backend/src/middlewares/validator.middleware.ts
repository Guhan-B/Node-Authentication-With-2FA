import { RequestHandler } from "express";
import Joi from "joi";

import { ServerError, ErrorType } from "../utilities/error.js";
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
            const errors: ErrorType[] = validationResult.error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message
            }));

            next(ServerError.ValidationError(errors));
        }
    }
};

export default handler;
