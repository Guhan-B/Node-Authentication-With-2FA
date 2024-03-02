import * as uuid from "uuid";
import bcrypt from "bcrypt";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import { ServerError } from "../utilities/error.js";
import { generateToken } from "../utilities/token.js";

const register: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (user) {
            throw new ServerError("VALIDATION_ERROR", [
                { cause: "email", message: "An account with given email already exists" }
            ]);
        }

        const hash: string = await bcrypt.hash(request.body.password, 16);

        await prisma.user.create({
            data: {
                id: uuid.v4(),
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
            throw new ServerError("VALIDATION_ERROR", [
                { cause: "email", message: "An account with given email does not exists" }
            ]);
        }

        if (user.verified !== 1) {
            throw new ServerError("ACCESS_FORBIDDEN_ERROR", [
                { cause: "email", message: "Email address is not verified" }
            ]);
        }

        const isPasswordSame: boolean = await bcrypt.compare(request.body.password, user.password);

        if (!isPasswordSame) {
            throw new ServerError("VALIDATION_ERROR", [{ cause: "password", message: "Password is incorrect" }]);
        }

        const tokenPayload = {
            tid: uuid.v4(),
            uid: user.id,
            createdAt: new Date().toUTCString()
        };
        const { token, tokenHash } = await generateToken(
            tokenPayload,
            process.env.TOKEN_SECRET_KEY + user.password,
            "7d"
        );

        await prisma.session.create({
            data: {
                id: tokenPayload.tid,
                user_id: user.id,
                created_at: tokenPayload.createdAt,
                token: tokenHash
            }
        });

        response.cookie("access-token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false // if secure: true cookie works only on secure channel i.e HTTPS
        });
        response.status(201).json();
    } catch (e) {
        return next(e);
    }
};

const logout: RequestHandler = async (request, response, next) => {
    console.log(request.body);
};

const resetPassword: RequestHandler = async (request, response, next) => {
    console.log(request.body);
};

const verify: RequestHandler = async (request, response, next) => {
    console.log(request.body);
};

export default {
    register,
    login,
    logout,
    resetPassword,
    verify
};
