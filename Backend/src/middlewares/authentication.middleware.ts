import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtDecode, InvalidTokenError, JwtPayload } from "jwt-decode";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import { Errors } from "../utilities/error.js";

/**
 * Creating a custom type CustomJwtPayload on top of exisitng
 * type JwtPayload (from jwt-decode module) to support tid
 * (Token ID) & uid (User ID) in the token payload
 */
type CustomJwtPayload = JwtPayload & {
    tid: string;
    uid: string;
};

const handler = (): RequestHandler => async (request, response, next) => {
    try {
        const accessToken: string = request.cookies["access-token"];

        if (!accessToken) {
            throw Errors.AUTHETICATION_ERROR([
                {
                    cause: "Access token missing",
                    message: "Authentication failed. Login to continue",
                },
            ]);
        }

        const payload: CustomJwtPayload = jwtDecode(accessToken);

        const userFromDB = await prisma.user.findUnique({
            where: { id: payload.uid },
        });
        const sessionFromDB = await prisma.session.findUnique({
            where: { id: payload.tid },
        });

        if (!userFromDB || !sessionFromDB) {
            throw Errors.AUTHETICATION_ERROR([
                {
                    cause: "Invalid access token",
                    message: "Authentication failed. Login to continue",
                },
            ]);
        }

        jwt.verify(accessToken, process.env.TOKEN_SECRET_KEY + userFromDB.password, async (error) => {
            if (error) {
                next(
                    Errors.AUTHETICATION_ERROR([
                        {
                            cause: "Invalid access token",
                            message: "Authentication failed. Login to continue",
                        },
                    ])
                ); // Not throwing here because the error is not reaching catch
            } else {
                const isTokenSame = await bcrypt.compare(accessToken, sessionFromDB.token);

                if (!isTokenSame) {
                    next(
                        Errors.AUTHETICATION_ERROR([
                            {
                                cause: "Invalid access token",
                                message: "Authentication failed. Login to continue",
                            },
                        ])
                    );
                }

                request.uid = userFromDB.id;

                next();
            }
        });
    } catch (e) {
        if (e instanceof InvalidTokenError) {
            e = Errors.AUTHETICATION_ERROR([
                {
                    cause: "Invalid access token",
                    message: "Authentication failed. Login to continue",
                },
            ]);
        }

        next(e);
    }
};

export default handler;
