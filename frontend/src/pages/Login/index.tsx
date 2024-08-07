import React from "react";
import Joi from "joi";
import { Link, useNavigate } from "react-router-dom";
import { FieldValues, UseFormSetError } from "react-hook-form";

import { Form } from "../../components/form";
import { ClientError } from "../../api";
import { loginGenerateCodeRequest } from "../../api/authentication";

import styles from "./styles.module.css";


export const LoginPage = () => {
    const fields = [
        { type: "text", label: "Email", name: "email" },
        { type: "password", label: "Password", name: "password" },
    ]

    const schema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            "string.empty": "Enter your email address",
            "string.email": "Email provided is not valid"
        }),
        password: Joi.string().min(8).max(16).required().messages({
            "string.empty": "Password cannot be empty",
            "string.min": "Password should be 8 to 16 characters long",
            "string.max": "Password should be 8 to 16 characters long"
        })
    });
    
    const [isLoading, setIsLoading] = React.useState(false);

    const navigate = useNavigate();

    const onSubmit = async (data: FieldValues, setError: UseFormSetError<FieldValues>) => {
        setIsLoading(true);

        try {
            await loginGenerateCodeRequest({
                email: data.email,
                password: data.password
            });

            navigate("/authentication/verify", {
                state: {
                    email: data.email,
                    password: data.password
                }
            });
        }
        catch(error) {
            const clientError = error as ClientError;
            const names = fields.map(field => field.name);
            
            if (clientError.errors) {
                clientError.errors.forEach(e => {
                    if (e.field && names.includes(e.field.toLowerCase())) {
                        setError(e.field.toLowerCase(), { type: "server", message: e.message });
                    }
                });
            }

            if (clientError.error) {
                if(clientError.error.field && names.includes(clientError.error.field.toLowerCase())) {
                    setError(clientError.error.field.toLowerCase(), { type: "server", message: clientError.error.message });
                }
                else {
                    // Show a form level error message (or) Show a toast message
                    console.log(clientError.error.message);
                }
            }
        }

        setIsLoading(false);
    }

    return (
        <div className={styles.wrapper}>
            <section className={styles.left}></section>
            <section className={styles.right}>
                <div className={styles.content}>
                    <header>
                        <h2>Log In & Continue Your Learning Journey</h2>
                    </header>
                    <Form fields={fields} schema={schema} label="Log In" onSubmit={onSubmit} loading={isLoading}/>
                    <footer>
                        <span>Don't have an account? <Link to="/authentication/register">Register</Link></span>
                        <span><Link to="/authentication/reset-password">Forgot Password</Link></span>
                    </footer>
                </div>
            </section>
        </div>
    );
}