import React from "react";

import styles from "./styles.module.css";

interface ButtonProps {
    label: string;
    type: "submit" | "reset" | undefined;
    variant: "primary" | "dark",
    fill: "solid" | "outline"
}

const variants = {
    "primary" : styles.primary,
    "dark" : styles.dark,
}

const fills = {
    "solid" : styles.solid,
    "outline" : "styles.outline"
}

export const Button:React.FC<ButtonProps> = ({ label, type, variant, fill }) => {

    return (
        <button className={[styles.wrapper, variants[variant], fills[fill]].join(" ")} type={type}>{ label }</button>
    );
}