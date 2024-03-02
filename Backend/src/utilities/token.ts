import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const generateToken = async (
    payload: object,
    secret: string,
    expiresIn: number | string
): Promise<{ token: string; tokenHash: string }> => {
    const token: string = jwt.sign(payload, secret, { expiresIn: expiresIn });

    const SALT_MAX: number = 8;
    const SALT_MIN: number = 32;

    const tokenSalt: number = Math.floor(Math.random() * (SALT_MAX - SALT_MIN)) + SALT_MIN;
    const tokenHash: string = await bcrypt.hash(token, tokenSalt);

    return { token, tokenHash };
};
