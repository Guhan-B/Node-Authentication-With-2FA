import React, { useState } from "react";
import { ObjectSchema } from "joi";
import { useForm, UseFormRegister, FieldValues, UseFormSetError } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";

import { Button } from "../button";

import styles from "./styles.module.css";
import EYE_OPEN_ICON from "../../assets/eye-outline.svg"
import EYE_CLOSE_ICON from "../../assets/eye-off-outline.svg"

interface FormProps {
    loading: boolean;
    fields: Array<{ name: string, label: string, type: string }>;
    schema: ObjectSchema;
    label: string | undefined;
    onSubmit: (data: FieldValues, setError: UseFormSetError<FieldValues>) => void;
}

export function Form({ fields, schema, label, onSubmit, loading } : FormProps) {
    const { register, handleSubmit, formState: { errors }, setError } = useForm({ 
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        resetOptions: { keepErrors: false },
        shouldUseNativeValidation: false,
        resolver: joiResolver(schema) 
    });

    return (
        <form className={styles.form_wrapper} onSubmit={handleSubmit((data) => { onSubmit(data, setError) })}>
            {
                fields.map((field, index) => {
                    if (field.type == "text") {
                        return (
                            <FormTextField
                                key={index}
                                label={field.label}
                                name={field.name}
                                register={register}
                                error={errors[field.name]?.message}
                            />
                        );
                    }

                    if (field.type == "password") {
                        return (
                            <FormPasswordField
                                key={index}
                                label={field.label}
                                name={field.name}
                                register={register}
                                error={errors[field.name]?.message}
                            />
                        );
                    }

                    if (field.type == "code") {
                        return (
                            <FormAccessCodeField
                                key={index}
                                label={field.label}
                                name={field.name}
                                register={register}
                                error={errors[field.name]?.message}
                            />
                        );
                    }
                })
            }
            <Button label={label? label : "Submit"} type="submit" variant="primary" fill="solid" loading={loading}/>
        </form>
    );
}

interface FormFieldProps {
    label: string;
    name: string;
    register: UseFormRegister<FieldValues>;
    error: any | undefined;
}

function FormTextField({ label, name, register, error } : FormFieldProps) {    
    return (
        <div className={styles.form_field_wrapper}>
            <div className={styles.input + " " + (error? styles.error : "")}>
                <input type="text" {...register(name)} placeholder="" />
                <label>{ label }</label>
                <span></span>
            </div>
            {
                error && 
                <div className={styles.error}>
                    <p>{ error }</p>
                </div>
            }
        </div>
    );
};

function FormPasswordField({ label, name, register, error } : FormFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className={styles.form_field_wrapper}>
            <div className={styles.input + " " + (error? styles.error : "")}>
                <input type={visible? "text" : "password"} {...register(name)} placeholder="" />
                <label>{ label }</label>
                <button type="button" onClick={() => setVisible(!visible)}>
                    { visible? <img src={EYE_CLOSE_ICON}/> : <img src={EYE_OPEN_ICON}/> }
                </button>
            </div>
            {
                error && 
                <div className={styles.error}>
                    <p>{ error }</p>
                </div>
            }
        </div>
    );
};

function FormAccessCodeField({ label, name, register, error } : FormFieldProps) {    
    return (
        <div className={styles.form_field_wrapper}>
            <div className={styles.input + " " + (error? styles.error : "")}>
                <input type="text" {...register(name)} placeholder="" />
                <label>{ label }</label>
                <span></span>
            </div>
            {
                error && 
                <div className={styles.error}>
                    <p>{ error }</p>
                </div>
            }
        </div>
    );
};