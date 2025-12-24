"use client";

import * as React from "react";

type ButtonVariant = "primary" | "danger";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500",
    danger: "border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
    const classes =
        baseClasses + " " + variantClasses[variant] + " " + sizeClasses[size] + (className ? " " + className : "");

    return <button className={classes} {...props} />;
}
