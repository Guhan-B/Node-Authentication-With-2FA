import React from "react";
import Joi from "joi";

import { Form } from "../../components/form";

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
    
    const onSubmit = (data: any) => {
        console.log(data);
    }

    return (
        <div className={styles.wrapper}>
            <section className={styles.left}></section>
            <section className={styles.right}>
                <div className={styles.content}>
                    <header>
                        <h2>Log In & Continue Your Learning Journey</h2>
                    </header>
                    <Form fields={fields} schema={schema} label="Log In" onSubmit={onSubmit}/>
                    <footer>
                        <span>Don't have an account? <a>Register</a></span>
                        <span><a>Forgot Password</a></span>
                    </footer>
                </div>
            </section>
        </div>
    );
}