import React from "react";
import Joi from "joi";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { FieldValues, UseFormSetError } from "react-hook-form";

import { Form } from "../../components/form";
import { ClientError } from "../../api";
import { loginVerifyCodeRequest } from "../../api/authentication";

import styles from "./styles.module.css";


export const VerificationPage = () => {
    const fields = [
        { type: "code", label: "Enter Your Access Code", name: "code" },
    ]
    
    const schema = Joi.object({
        code: Joi.number().min(1000).max(9999).messages({
            "number.base" : "Please enter the your access code",
            "number.min" : "Access code must be 4 digits",
            "number.max" : "Access code must be 4 digits"
        }),
    });
    
    const [isLoading, setIsLoading] = React.useState(false);
    
    const navigate = useNavigate();
    
    const location = useLocation();
    
    const onSubmit = async (data: FieldValues, setError: UseFormSetError<FieldValues>) => {
        setIsLoading(true);

        try {
            await loginVerifyCodeRequest({
                code: data.code
            });

            // navigate("/dashboard", {
            //     state: {
            //         email: data.email,
            //         password: data.password
            //     }
            // });
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
                    console.log(clientError.error.details);
                }
            }
        }

        setIsLoading(false);
    }

    const onResend = () => {
        
    }

    if (!location.state || !location.state.email || !location.state.password) {
        return (
            <Navigate to="/authentication/login" replace />
        );
    }

    return (
        <div className={styles.wrapper}>
            <section className={styles.left}></section>
            <section className={styles.right}>
                <div className={styles.content}>
                    <header>
                        <h2>Let's Get You Verified</h2>
                        <p>Enter the access code sent to your email <span>{location.state.email}</span> to access your account</p>
                    </header>
                    <Form fields={fields} schema={schema} label="Continue" onSubmit={onSubmit} loading={isLoading}/>
                    <footer>
                        <span>Didn't recieve the access code? <button>Resend</button></span>
                    </footer>
                </div>
            </section>
        </div>
    );
}
