import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { jwtDecode, InvalidTokenError } from "jwt-decode";

import { ServerError } from "../utilities/error.js";
import prisma from "../utilities/prisma.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export class Code {
    public static async generate(
        uid: string,
        expiresIn: string
    ): Promise<{ tid: string; token: string; code: number }> {
        const code = Math.floor(Math.random() * (9999 - 1000) + 1000);

        const { payload, token, tokenHash } = await Token.generate(uid, expiresIn, "Verification-Token");

        await prisma.verification.create({
            data: {
                id: payload.tid,
                user_id: uid,
                token: tokenHash,
                code: code,
                created_at: payload.createdAt
            }
        });

        return {
            tid: payload.tid,
            code: code,
            token: token
        };
    }

    public static async verify(code: number, token: string): Promise<string> {
        try {
            const payload: CustomJwtPayload = await Token.verify(token);

            const verification = await prisma.verification.findUnique({
                where: { id: payload.tid, user_id: payload.uid }
            });

            if (!verification || crypto.createHash("sha256").update(token).digest("hex") !== verification.token) {
                throw ServerError.AuthenticationError([
                    { cause: "Invalid Verification Token", message: "Unable to verify code. Please try again" }
                ]);
            }

            if (code !== verification.code) {
                throw ServerError.AuthenticationError([
                    {
                        cause: "Incorrect Verification Code",
                        message: "The verification code entered is incorrect. Please try again"
                    }
                ]);
            }

            await prisma.verification.delete({
                where: {
                    id: payload.tid,
                    user_id: payload.uid
                }
            });

            return payload.uid;
        } catch (e) {
            if (e instanceof InvalidTokenError || e instanceof JsonWebTokenError) {
                e = ServerError.AuthenticationError([
                    { cause: "Invalid Verification Token", message: "Unable to verify code. Please try again" }
                ]);
            }

            if (e instanceof TokenExpiredError) {
                e = ServerError.AuthenticationError([
                    { cause: "Expired Verification Code", message: "The verification code entered is expired" }
                ]);
            }

            throw e;
        }
    }
}

export class Token {
    public static async generate(
        uid: string,
        expiresIn: string,
        type: string
    ): Promise<{ payload: CustomJwtPayload; token: string; tokenHash: string }> {
        const payload: CustomJwtPayload = {
            tid: nanoid(),
            uid: uid,
            createdAt: new Date().toISOString()
        };

        const token = jwt.sign(payload, process.env.TOKEN_SECRET_KEY as string, {
            expiresIn: expiresIn,
            algorithm: "HS256",
            issuer: "JustLoop",
            header: {
                typ: type,
                alg: "HS256"
            }
        });

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        return { payload, token, tokenHash };
    }

    public static async verify(token: string): Promise<CustomJwtPayload> {
        try {
            jwt.verify(token, process.env.TOKEN_SECRET_KEY as string);
            const payload: CustomJwtPayload = jwtDecode(token);
            return payload;
        } catch (e) {
            throw e;
        }
    }
}
