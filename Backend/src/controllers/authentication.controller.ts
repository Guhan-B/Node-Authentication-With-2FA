import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import mailer from "../utilities/mailer.js";
import { ServerError } from "../utilities/error.js";
import { Code, Token } from "../utilities/generator.js";

const register: RequestHandler = async (request, response, next) => {
    console.log("HERE");
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (user) {
            throw ServerError.ValidationError([
                { cause: "Email", message: "An account with given email already exists" }
            ]);
        }

        const hash: string = await bcrypt.hash(request.body.password, 16);

        await prisma.user.create({
            data: {
                id: nanoid(),
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

const loginGenerateOTP: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (!user) {
            throw ServerError.ValidationError([
                { cause: "Email", message: "An account with given email does not exists" }
            ]);
        }

        const isPasswordSame = await bcrypt.compare(request.body.password, user.password);

        if (!isPasswordSame) {
            throw ServerError.ValidationError([{ cause: "Password", message: "Password is incorrect" }]);
        }

        const { tid, code, token } = await Code.generate(user.id, "5m");

        const mailerResponse = await mailer.emails.send({
            from: "no-reply@justloop.xyz",
            to: user.email,
            subject: "Your JustLoop Account: Access From New Device",
            html: ` 
                <p>
                    Hello <strong>${user.name}</strong>, 
                    It looks like you are trying to log in from a new device. 
                    Here is the verification code you need to access your account 
                    <strong>${code}</strong>. The verification code will be valid 
                    for <strong>5 Minutes</strong>.
                </p>
            `
        });

        if (mailerResponse.error) {
            await prisma.verification.delete({
                where: { id: tid }
            });

            throw ServerError.InternalServerError([
                { cause: "Mailing Failed", message: "Unable to generate OTP. Please try again" }
            ]);
        }

        response
            .clearCookie("Verification-Token")
            .cookie("Verification-Token", token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: false })
            .status(201)
            .json();
    } catch (e) {
        return next(e);
    }
};

const loginVerifyOTP: RequestHandler = async (request, response, next) => {
    try {
        const tokenFromCookie: string = request.cookies["Verification-Token"];

        if (!tokenFromCookie) {
            throw ServerError.AuthenticationError([
                { cause: "Verification Token Missing", message: "Unable to verify code. Please try again" }
            ]);
        }

        const uid = await Code.verify(Number.parseInt(request.body.code), tokenFromCookie);

        const { payload, token, tokenHash } = await Token.generate(uid, "7d", "Access-Token");

        await prisma.session.create({
            data: {
                id: payload.tid,
                user_id: uid,
                token: tokenHash,
                created_at: payload.createdAt
            }
        });

        response
            .clearCookie("Verification-Token")
            .cookie("Access-Token", token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false })
            .status(201)
            .json();
    } catch (e) {
        next(e);
    }
};

const logout: RequestHandler = async (request, response, next) => {
    try {
        const tokenFromCookie = request.cookies["Access-Token"] as string;
        const tokenHashFromCookie = crypto.createHash("sha256").update(tokenFromCookie).digest("hex");

        await prisma.session.delete({ where: { user_id: request.uid, token: tokenHashFromCookie } });

        response.clearCookie("Access-Token").status(201).json();
    } catch (e) {
        return next(e);
    }
};

const changePasswordGenerateOTP: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (!user) {
            throw ServerError.ValidationError([
                { cause: "Email", message: "An account with given email does not exists" }
            ]);
        }

        const { tid, token, code } = await Code.generate(user.id, "5m");

        const mailerResponse = await mailer.emails.send({
            from: "no-reply@justloop.xyz",
            to: user.email,
            subject: "Your JustLoop Account: Password Change",
            html: ` 
                <p>
                    Hello <strong>${user.name}</strong>, 
                    It looks like you are trying to change your account password. Once the password is 
                    changed you will be logged out of all active devices. Here is the verificaion code 
                    you need for changing your account password <strong>${code}</strong>. The verification 
                    code will be valid for <strong>5 Minutes</strong>.
                </p>
            `
        });

        if (mailerResponse.error) {
            await prisma.verification.delete({
                where: { id: tid }
            });

            throw ServerError.InternalServerError([
                { cause: "Mailing Failed", message: "Unable to generate OTP. Please try again" }
            ]);
        }

        response
            .clearCookie("Verification-Token")
            .cookie("Verification-Token", token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: false })
            .status(201)
            .json();
    } catch (e) {
        next(e);
    }
};

const changePasswordVerifyOTP: RequestHandler = async (request, response, next) => {
    try {
        const tokenFromCookie: string = request.cookies["Verification-Token"];

        if (!tokenFromCookie) {
            throw ServerError.AuthenticationError([
                { cause: "Verification Token Missing", message: "Unable to verify code. Please try again" }
            ]);
        }

        const uid = await Code.verify(Number.parseInt(request.body.code), tokenFromCookie);

        const hash: string = await bcrypt.hash(request.body.password, 16);

        await prisma.user.update({
            data: { password: hash },
            where: { id: uid }
        });

        await prisma.session.deleteMany({
            where: { user_id: uid }
        });

        response.clearCookie("Verification-Token").clearCookie("Access-Token").status(201).json();
    } catch (e) {
        return next(e);
    }
};

export default {
    register,
    loginGenerateOTP,
    loginVerifyOTP,
    logout,
    changePasswordGenerateOTP,
    changePasswordVerifyOTP
};
