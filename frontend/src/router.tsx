import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "./pages/Home";
import { RegisterPage } from "./pages/Register";
import { LoginPage } from "./pages/Login";
import { VerificationPage } from "./pages/verification";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />
    },
    {
        path: "/authentication/register",
        element: <RegisterPage />
    },
    {
        path: "/authentication/login",
        element: <LoginPage />
    },
    {
        path: "/authentication/verify",
        element: <VerificationPage />
    }
]);