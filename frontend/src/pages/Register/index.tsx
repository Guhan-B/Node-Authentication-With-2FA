import React from "react";
import Joi from "joi";
import { Link } from "react-router-dom";

import { Form } from "../../components/form";
import { registerRequest } from "../../api/authentication";
import { FieldValues, UseFormSetError } from "react-hook-form";
import { ClientError } from "../../api";

import styles from "./styles.module.css";


export const RegisterPage = () => {
    const fields = [
        { type: "text", label: "Name", name: "name" },
        { type: "text", label: "Email", name: "email" },
        { type: "password", label: "Password", name: "password" },
        { type: "password",  label: "Confirm Password", name: "confirmPassword" },
    ]

    const schema = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "Name cannot be empty"
        }),
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            "string.empty": "Email cannot be empty",
            "string.email": "Email provided is not valid"
        }),
        password: Joi.string().min(8).max(16).required().messages({
            "string.empty": "Password cannot be empty",
            "string.min": "Password should be 8 to 16 characters long",
            "string.max": "Password should be 8 to 16 characters long"
        }),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
            "string.empty": "Confirm password cannot be empty",
            "any.only": "Passwords entered does not match",
        })
    });

    const [isLoading, setIsLoading] = React.useState(false);
    
    const onSubmit = async (data: FieldValues, setError: UseFormSetError<FieldValues>) => {
        setIsLoading(true);

        try {
            await registerRequest({
                name: data.name,
                email: data.email,
                password: data.password
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
                        <h2>Register Now & Start Learning</h2>
                    </header>
                    <Form fields={fields} schema={schema} label="Register" onSubmit={onSubmit} loading={isLoading}/>
                    <footer>
                        <span>Already have an account? <Link to="/authentication/login">Log In</Link></span>
                        <span><Link to="/authentication/reset-password">Forgot Password</Link></span>
                    </footer>
                </div>
            </section>
        </div>
    );
}
