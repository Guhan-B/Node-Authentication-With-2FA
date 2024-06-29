import Joi from "joi";

const REGISTER_USER_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Field is required"
    }),

    email: Joi.string().email().required().messages({
        "any.required": "Field is required",
        "string.email": "Email provided is not valid"
    }),

    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Field is required",
        "string.min": "Password should be 8 to 16 characters long",
        "string.max": "Password should be 8 to 16 characters long"
    }),

    avatar: Joi.number().min(0).max(5)
});

const LOGIN_USER_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    email: Joi.string().email().required().messages({
        "any.required": "Field is required",
        "string.email": "Email provided is not valid"
    }),

    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Field is required",
        "string.min": "Password should be 8 to 16 characters long",
        "string.max": "Password should be 8 to 16 characters long"
    })
});

const VERIFY_LOGIN_USER_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    code: Joi.number().min(1000).max(9999).required().messages({
        "any.required": "Field is required",
        "number.min": "Invalid OTP",
        "number.max": "Invalid OTP"
    })
});

const CHANGE_PASSWORD_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    email: Joi.string().email().required().messages({
        "any.required": "Field is required",
        "string.email": "Email provided is not valid"
    })
});

const VERIFY_CHANGE_PASSWORD_REQUEST_SCHEMA: Joi.ObjectSchema<any> = Joi.object({
    code: Joi.number().min(1000).max(9999).required().messages({
        "any.required": "Field is required",
        "number.min": "Invalid OTP",
        "number.max": "Invalid OTP"
    }),
    password: Joi.string().min(8).max(16).required().messages({
        "any.required": "Field is required",
        "string.min": "Password should be 8 to 16 characters long",
        "string.max": "Password should be 8 to 16 characters long"
    })
});

const RequestSchemas: Map<string, Joi.ObjectSchema<any>> = new Map<string, Joi.ObjectSchema<any>>();

RequestSchemas.set("POST:/authentication/register", REGISTER_USER_REQUEST_SCHEMA);
RequestSchemas.set("POST:/authentication/login", LOGIN_USER_REQUEST_SCHEMA);
RequestSchemas.set("POST:/authentication/login/verify", VERIFY_LOGIN_USER_REQUEST_SCHEMA);
RequestSchemas.set("POST:/authentication/change-password", CHANGE_PASSWORD_REQUEST_SCHEMA);
RequestSchemas.set("POST:/authentication/change-password/verify", VERIFY_CHANGE_PASSWORD_REQUEST_SCHEMA);

export default RequestSchemas;
