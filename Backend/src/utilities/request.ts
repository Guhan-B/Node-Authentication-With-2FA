import Joi from "joi";

const REGISTER_USER_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Field is required",
    }),

    email: Joi.string().email().required().messages({
        "any.required": "Field is required",
        "string.email": "Email provided is not valid",
    }),

    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Field is required",
        "string.min": "Password should be 8 to 16 characters long",
        "string.max": "Password should be 8 to 16 characters long",
    }),

    avatar: Joi.number().min(0).max(5),
});

const LOGIN_USER_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    email: Joi.string().email().required().messages({
        "any.required": "Field is required",
        "string.email": "Email provided is not valid",
    }),

    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Field is required",
        "string.min": "Password should be 8 to 16 characters long",
        "string.max": "Password should be 8 to 16 characters long",
    }),
});

const requestSchemas: Map<string, Joi.ObjectSchema<any>> = new Map<string, Joi.ObjectSchema<any>>();

requestSchemas.set("/authentication/register", REGISTER_USER_REQUEST_SCHEMA);
requestSchemas.set("/authentication/login", LOGIN_USER_REQUEST_SCHEMA);

export default requestSchemas;
