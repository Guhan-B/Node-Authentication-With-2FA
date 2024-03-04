import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtDecode, InvalidTokenError, JwtPayload } from "jwt-decode";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import { ServerError } from "../utilities/error.js";

const handler = (): RequestHandler => async (request, response, next) => {
    try {
        const tokenFromCookie: string = request.cookies["access-token"];

        if (!tokenFromCookie) {
            throw new ServerError("AUTHETICATION_ERROR", [
                { cause: "Access token missing", message: "Authentication failed. Login to continue" }
            ]);
        }

        const payload: CustomJwtPayload = jwtDecode(tokenFromCookie);

        if (!payload.tid) {
            throw new ServerError("AUTHETICATION_ERROR", [
                { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
            ]);
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.uid }
        });
        const session = await prisma.session.findUnique({
            where: { id: payload.tid }
        });

        if (!user || !session) {
            throw new ServerError("AUTHETICATION_ERROR", [
                { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
            ]);
        }

        jwt.verify(tokenFromCookie, process.env.TOKEN_SECRET_KEY + user.password, async (error) => {
            if (error) {
                next(
                    new ServerError("AUTHETICATION_ERROR", [
                        { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
                    ])
                ); // Not throwing here because the error is not reaching catch
            } else {
                const isTokenSame = await bcrypt.compare(tokenFromCookie, session.token);

                if (!isTokenSame) {
                    next(
                        new ServerError("AUTHETICATION_ERROR", [
                            { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
                        ])
                    ); // Not throwing here because the error is not reaching catch
                }

                request.uid = user.id;

                next();
            }
        });
    } catch (e) {
        if (e instanceof InvalidTokenError) {
            e = new ServerError("AUTHETICATION_ERROR", [
                { cause: "Invalid access token", message: "Authentication failed. Login to continue" }
            ]);
        }

        next(e);
    }
};

export default handler;
