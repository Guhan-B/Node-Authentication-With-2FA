import React from "react";
import Joi from "joi";

import { Form } from "../../components/form";

import styles from "./styles.module.css";


export const RegisterPage = () => {
    const fields = [
        { type: "text", label: "Name", name: "name" },
        { type: "text", label: "Email", name: "email" },
        { type: "password", label: "Password", name: "password" },
        { type: "password", label: "Confirm Password", name: "confirmPassword" },
    ]

    const schema = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "Enter your name"
        }),
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            "string.empty": "Enter your email address",
            "string.email": "Email provided is not valid"
        }),
        password: Joi.string().min(8).max(16).required().messages({
            "string.empty": "Password cannot be empty",
            "string.min": "Password should be 8 to 16 characters long",
            "string.max": "Password should be 8 to 16 characters long"
        }),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
            "string.empty": "Password cannot be empty",
            "any.only": "Passwords entered does not match",
        })
    });
    
    const onSubmit = (data: any) => {
        console.log(data);
    }

    return (
        <div className={styles.wrapper}>
            <section className={styles.left}></section>
            <section className={styles.right}>
                <div className={styles.content}>
                    <header>
                        <h2>Register Now & Start Learning</h2>
                    </header>
                    <Form fields={fields} schema={schema} label="Register" onSubmit={onSubmit}/>
                    <footer>
                        <span>Already have an account? <a>Log In</a></span>
                        <span><a>Forgot Password</a></span>
                    </footer>
                </div>
            </section>
        </div>
    );
}
