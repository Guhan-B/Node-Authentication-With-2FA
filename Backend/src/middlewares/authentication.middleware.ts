import jwt from "jsonwebtoken";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import { ServerError } from "../utilities/error.js";
import { Token } from "../utilities/generator.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const handler = (): RequestHandler => async (request, response, next) => {
    try {
        const accessToken: string = request.cookies["Access-Token"];

        if (!accessToken) {
            throw ServerError.AuthenticationError({ 
                message: "Authentication failed. Login to continue",
                details: "Access token is missing from cookie. Access denied"
            });
        }

        const payload = jwt.decode(accessToken, { json: true });

        if (payload == null || payload.uid == null) {
            throw ServerError.AuthenticationError({ 
                message: "Authentication failed. Login to continue" ,
                details: "User ID missing from access token payload, cannot validate the access code without user ID. Access Denied"
            });
        }

        const user = await prisma.user.findUnique({ where: { id: payload.uid } });

        if (!user) {
            throw ServerError.AuthenticationError({ 
                message: "Authentication failed. Login to continue",
                details: "User ID from access token does not identifies a user, cannot verify code without user. Access Denied"
            });
        }

        await Token.verify(accessToken, `${process.env.TOKEN_SECRET}.${user.password}`);

        request.uid = user.id;

        next();
    } catch (e) {
        if (e instanceof JsonWebTokenError) {
            e = ServerError.AuthenticationError({ 
                message: "Authentication failed. Login to continue",
                details: "Validation of access token has failed. Access Denied"
            });
        }

        if (e instanceof TokenExpiredError) {
            e = ServerError.AuthenticationError({ 
                message: "Your session has expired. Login to continue",
                details: "Access token associated with the session has expired. Access Denied"
            });
        }

        next(e);
    }
};

export default handler;
