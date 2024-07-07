import React, { useState } from "react";
import { ObjectSchema } from "joi";
import { useForm, SubmitHandler, UseFormRegister, FieldValues } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";

import { Button } from "../button";

import styles from "./styles.module.css";
import EYE_OPEN_ICON from "../../assets/eye-outline.svg"
import EYE_CLOSE_ICON from "../../assets/eye-off-outline.svg"

interface FormProps {
    fields: Array<{ name: string, label: string, type: string }>;
    schema: ObjectSchema;
    label: string | undefined;
    onSubmit: SubmitHandler<FieldValues>;
}

export const Form: React.FC<FormProps> = ({ fields, schema, label, onSubmit }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ 
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        resetOptions: { keepErrors: false },
        shouldUseNativeValidation: false,
        resolver: joiResolver(schema) 
    });

    return (
        <form className={styles.form_wrapper} onSubmit={handleSubmit(onSubmit)}>
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
                })
            }
            <Button label={label? label : "Submit"} type="submit"/>
        </form>
    );
}

interface FormFieldProps {
    label: string;
    name: string;
    register: UseFormRegister<FieldValues>;
    error: any | undefined;
}

const FormTextField: React.FC<FormFieldProps> = ({ label, name, register, error }) => {    
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

const FormPasswordField: React.FC<FormFieldProps> = ({ label, name, register, error }) => {
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
};;