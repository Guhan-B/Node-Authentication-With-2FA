import React from "react";
import Loader from "react-spinners/BeatLoader";

import styles from "./styles.module.css";

interface ButtonProps {
    loading: boolean;
    label: string;
    type: "submit" | "reset" | "button";
    variant: "primary" | "dark",
    fill: "solid" | "outline"
}

const variants = {
    "primary": styles.primary,
    "dark": styles.dark
}

const fills = {
    "solid": styles.solid,
    "outline": styles.outline
}

export function Button({ label, type, variant, fill, loading } : ButtonProps) {
    return (
        <button className={[styles.wrapper, variants[variant], fills[fill]].join(" ")} type={type} disabled={loading}>
            { loading ? <Loader loading={loading} size={8} color="#f7f9fa" /> : <span>{label}</span> }
        </button>
    );
}