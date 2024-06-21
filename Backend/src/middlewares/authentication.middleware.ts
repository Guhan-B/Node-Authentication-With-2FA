import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { jwtDecode, InvalidTokenError, JwtPayload } from "jwt-decode";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import { ServerError } from "../utilities/error.js";
import { Token } from "../utilities/generator.js";

const handler = (): RequestHandler => async (request, response, next) => {
    try {
        const tokenFromCookie: string = request.cookies["Access-Token"];

        if (!tokenFromCookie) {
            throw ServerError.AuthenticationError([
                { cause: "Access token missing", message: "Authentication failed. Login to continue" }
            ]);
        }

        const payload: CustomJwtPayload = await Token.verify(tokenFromCookie);

        const user = await prisma.user.findUnique({
            where: { id: payload.uid }
        });

        const session = await prisma.session.findUnique({
            where: { id: payload.tid }
        });

        if (!user || !session) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
            ]);
        }

        if (crypto.createHash("sha256").update(tokenFromCookie).digest("hex") !== session.token) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
            ]);
        }

        request.uid = user.id;

        next();
    } catch (e) {
        if (e instanceof InvalidTokenError) {
            e = ServerError.AuthenticationError([
                { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
            ]);
        }

        next(e);
    }
};

export default handler;
