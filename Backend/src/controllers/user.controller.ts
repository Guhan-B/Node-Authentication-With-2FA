import { RequestHandler } from "express";

import prisma from "../utilities/prisma.js";

const fetchProfile: RequestHandler = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: request.uid } });

        if (user) {
            response.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        } else {
            response.status(404).json();
        }
    } catch (e) {
        next(e);
    }
};

const editProfile: RequestHandler = async (request, response, next) => {};

export default {
    fetchProfile,
    editProfile
};
