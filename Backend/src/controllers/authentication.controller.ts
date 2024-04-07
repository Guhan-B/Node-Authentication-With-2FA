import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import { RequestHandler } from "express";
import { jwtDecode, InvalidTokenError } from "jwt-decode";

import prisma from "../utilities/prisma.js";
import { ServerError } from "../utilities/error.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const register: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (user) {
            throw ServerError.ValidationError([
                { cause: "email", message: "An account with given email already exists" }
            ]);
        }

        const hash: string = await bcrypt.hash(request.body.password, 16);

        await prisma.user.create({
            data: {
                id: v4(),
                name: request.body.name,
                email: request.body.email,
                password: hash,
                avatar: request.body.avatar,
                created_at: new Date().toUTCString()
            }
        });

        response.status(201).json();
    } catch (e) {
        next(e);
    }
};

const login: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (!user) {
            throw ServerError.ValidationError([
                { cause: "email", message: "An account with given email does not exists" }
            ]);
        }

        const isPasswordSame: boolean = await bcrypt.compare(request.body.password, user.password);

        if (!isPasswordSame) {
            throw ServerError.ValidationError([{ cause: "password", message: "Password is incorrect" }]);
        }

        const tokenPayload = {
            uid: user.id
        } satisfies CustomJwtPayload;

        const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET_KEY + user.password, {
            expiresIn: "1m",
            algorithm: "HS256",
            header: {
                typ: "2FA-JWT",
                alg: "HS256"
            }
        });

        response.cookie("2FA-token", token, {
            maxAge: 1 * 60 * 1000,
            httpOnly: true,
            secure: false // if secure: true cookie works only on secure channel i.e HTTPS
        });

        response.status(201).json();
    } catch (e) {
        return next(e);
    }
};

const generateOTP: RequestHandler = async (request, response, next) => {
    try {
        const tokenFromCookie: string = request.cookies["2FA-token"];

        if (!tokenFromCookie) {
            throw ServerError.AuthenticationError([
                { cause: "2FA token missing", message: "Unable to generate OTP. Please login again" }
            ]);
        }

        const payload: CustomJwtPayload = jwtDecode(tokenFromCookie);

        const user = await prisma.user.findUnique({
            where: { id: payload.uid }
        });

        if (!user) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid 2FA token", message: "Unable to generate OTP. Please login again" }
            ]);
        }

        jwt.verify(tokenFromCookie, process.env.TOKEN_SECRET_KEY + user.password);

        const OTP: number = Math.floor(Math.random() * (9999 - 1000) + 1000);

        const tokenPayload = {
            tid: v4(),
            uid: user.id,
            createdAt: new Date().toUTCString()
        } satisfies CustomJwtPayload;

        const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET_KEY + user.password, {
            expiresIn: "1h",
            algorithm: "HS256",
            header: {
                typ: "2FA-JWT",
                alg: "HS256"
            }
        });

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        await prisma.verification.create({
            data: {
                id: tokenPayload.tid,
                user_id: user.id,
                token: tokenHash,
                otp: OTP,
                created_at: tokenPayload.createdAt
            }
        });

        response.clearCookie("2FA-token");

        response.cookie("2FA-token", token, {
            maxAge: 1 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false // if secure: true cookie works only on secure channel i.e HTTPS
        });

        response.status(201).json();
    } catch (e) {
        if (e instanceof InvalidTokenError || e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
            e = ServerError.AuthenticationError([
                { cause: "Invalid 2FA token", message: "Unable to generate OTP. Please login again" }
            ]);
        }

        next(e);
    }
};

const verifyOTP: RequestHandler = async (request, response, next) => {
    try {
        const tokenFromCookie: string = request.cookies["2FA-token"];

        if (!tokenFromCookie) {
            throw ServerError.AuthenticationError([
                { cause: "2FA token missing", message: "Unable to verify OTP. Please login again" }
            ]);
        }

        const payload: CustomJwtPayload = jwtDecode(tokenFromCookie);

        if (!payload.tid) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid 2FA token", message: "Unable to verify OTP. Please login again" }
            ]);
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.uid }
        });
        const session = await prisma.verification.findUnique({
            where: { id: payload.tid }
        });

        if (!user || !session) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid 2FA token", message: "Unable to verify OTP. Please login again" }
            ]);
        }

        jwt.verify(tokenFromCookie, process.env.TOKEN_SECRET_KEY + user.password);

        if (crypto.createHash("sha256").update(tokenFromCookie).digest("hex") !== session.token) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid 2FA token", message: "Unable to verify OTP. Please login again" }
            ]);
        }

        if (Number.parseInt(request.body.otp) !== session.otp) {
            throw ServerError.AuthenticationError([
                { cause: "Invalid OTP", message: "Incorrect OTP entered. Please try again" }
            ]);
        }

        await prisma.verification.delete({
            where: {
                id: payload.tid
            }
        });

        if (user.verified === 0) {
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    verified: 1
                }
            });
        }

        const tokenPayload = {
            tid: v4(),
            uid: user.id,
            createdAt: new Date().toUTCString()
        } satisfies CustomJwtPayload;

        const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET_KEY + user.password, {
            expiresIn: "7d",
            algorithm: "HS256",
            header: {
                typ: "Access-JWT",
                alg: "HS256"
            }
        });

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        await prisma.session.create({
            data: {
                id: tokenPayload.tid,
                user_id: user.id,
                token: tokenHash,
                created_at: tokenPayload.createdAt
            }
        });

        response.clearCookie("2FA-token");

        response.cookie("access-token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false // if secure: true cookie works only on secure channel i.e HTTPS
        });

        response.status(201).json();
    } catch (e) {
        if (e instanceof InvalidTokenError || e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
            e = ServerError.AuthenticationError([
                { cause: "Invalid 2FA token", message: "Unable to verify OTP. Please login again" }
            ]);
        }

        if (e instanceof TokenExpiredError) {
            e = ServerError.AuthenticationError([
                { cause: "Expired 2FA token", message: "OTP Expired. Please login again" }
            ]);
        }

        next(e);
    }
};

const logout: RequestHandler = async (request, response, next) => {
    console.log(request.body);
};

const resetPassword: RequestHandler = async (request, response, next) => {
    console.log(request.body);
};

export default {
    register,
    login,
    logout,
    resetPassword,
    generateOTP,
    verifyOTP
};
