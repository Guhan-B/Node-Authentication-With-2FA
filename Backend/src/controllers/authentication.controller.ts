import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";
import mailer from "../utilities/mailer.js";
import { ServerError } from "../utilities/error.js";
import { Code, Token } from "../utilities/generator.js";


const register: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: request.body.email }
        });

        if (user) {
            throw ServerError.ValidationError({ 
                field: "email", 
                message: "Email already in use", 
                details: "An account with given email already exist. Multiple accounts cannot have same email" 
            });
        }

        const hash = await bcrypt.hash(request.body.password, 16);

        await prisma.user.create({
            data: {
                id: nanoid(),
                name: request.body.name,
                email: request.body.email,
                password: hash,
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
            throw ServerError.ValidationError({ 
                field: "email", 
                message: "Email is not registered",
                details: "An account with given email does not exist. Email must be registed to an account to login" 
            });
        }

        const isPasswordSame = await bcrypt.compare(request.body.password, user.password);

        if (!isPasswordSame) {
            throw ServerError.ValidationError({ 
                field: "password", 
                message: "Password is incorrect",
                details: "Password provided does not match with account password"
            });
        }

        const { token, code } = await Code.generate(user.id, "5m");

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
            throw ServerError.InternalServerError({ 
                message: "Unable to generate OTP. Please try again",
                details: "Unable to send mail to the account email. Mailing failed due to error from Resend" 
            });
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
        const verificationToken: string = request.cookies["Verification-Token"];

        if (!verificationToken) {
            throw ServerError.AuthenticationError({  
                message: "Unable to verify code. Please try again",
                details: "Verification token is missing from cookie. Cannot verify code without verification token"
            });
        }

        const user_id = await Code.verify(Number.parseInt(request.body.code), verificationToken);
        const user = await prisma.user.findUnique({ where: { id: user_id } });

        if (!user) {
            throw ServerError.AuthenticationError({ 
                message: "Unable to verify code. Please try again",
                details: "User ID from verification token does not identifies a user. Cannot verify code without user" 
            });
        }

        const accessToken = await Token.generate(user.id, `${process.env.TOKEN_SECRET}.${user.password}` ,"7d");

        response
            .clearCookie("Verification-Token")
            .cookie("Access-Token", accessToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false })
            .status(201)
            .json();
    } catch (e) {
        next(e);
    }
};

const logout: RequestHandler = async (request, response, next) => {
    try {
        response
            .clearCookie("Access-Token")
            .status(200)
            .json();
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
            throw ServerError.ValidationError({ 
                field: "email", 
                message: "Email is not registered",
                details: "An account with given email does not exist. Email must be registed to an account to change password" 
            });
        }

        const { token, code } = await Code.generate(user.id, "5m");

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
            throw ServerError.InternalServerError({ 
                message: "Unable to generate OTP. Please try again",
                details: "Unable to send mail to the account email. Mailing failed due to error from Resend" 
            });
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
        const verificationToken: string = request.cookies["Verification-Token"];

        if (!verificationToken) {
            throw ServerError.AuthenticationError({  
                message: "Unable to verify code. Please try again",
                details: "Verification token is missing from cookie. Cannot verify code without verification token"
            });
        }

        const user_id = await Code.verify(Number.parseInt(request.body.code), verificationToken);

        const hash: string = await bcrypt.hash(request.body.password, 16);

        await prisma.user.update({
            data: { password: hash },
            where: { id: user_id }
        });

        response
            .clearCookie("Verification-Token")
            .clearCookie("Access-Token")
            .status(201)
            .json();
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
