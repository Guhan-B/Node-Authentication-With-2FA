import React from "react";

import styles from "./styles.module.css";

interface ButtonProps {
    label: string;
    type: "submit" | "reset" | undefined
}

export const Button:React.FC<ButtonProps> = ({ label, type }) => {
    return (
        <button className={styles.wrapper} type={type}>{ label }</button>
    );
}