import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

import { ServerError } from "../utilities/error.js";


const { JsonWebTokenError, TokenExpiredError } = jwt;

export class Code {
    public static async generate(uid: string, expiresIn: string): Promise<{ token: string; code: number }> {
        const code = Math.floor(Math.random() * (9999 - 1000) + 1000);
        const token = await Token.generate(uid, `${process.env.TOKEN_SECRET}.${uid}.${code}`, expiresIn);
        return { token, code };
    }

    public static async verify(code: number, token: string): Promise<string> {
        try {
            const payload = jwt.decode(token, { json: true });

            if (payload && payload.uid) {
                await Token.verify(token, `${process.env.TOKEN_SECRET}.${payload.uid}.${code}`);
            }
            else {
                throw ServerError.AuthenticationError({ 
                    message: "Unable to verify code. Please try again",
                    details: "User ID missing from verification token payload. Cannot validate the verification code without user ID"
                });
            }
            
            return payload.uid;
        } catch (e) {
            if (e instanceof JsonWebTokenError) {
                e = ServerError.AuthenticationError({ 
                    field: "code", 
                    message: "The verification code entered is incorrect" ,
                    details: "Verification code provided does not match the generated verification code"
                });
            }

            if (e instanceof TokenExpiredError) {
                e = ServerError.AuthenticationError({ 
                    field: "code", 
                    message: "The verification code entered is expired",
                    details: "Verification token associated with the code has expired. Cannot validate the verification code"
                });
            }

            throw e;
        }
    }
}

export class Token {
    public static async generate(uid: string, secret: string, expiresIn: string): Promise<string> {
        const token = jwt.sign({ uid }, secret as string, {
            jwtid: nanoid(),            
            algorithm: "HS256",
            issuer: "justloop.xyz",
            audience: "client",
            expiresIn: expiresIn,
        });

        return token;
    }

    public static async verify(token: string, secret: string): Promise<void> {
        try {
            jwt.verify(token, secret);
        } catch (e) {            
            throw e;
        }
    }
}
