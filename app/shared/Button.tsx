"use client";

type ButtonVariant = "primary" | "danger" | "new" | "filter";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isActive?: boolean;
}

const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
    "cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed " +
    "whitespace-nowrap w";

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500",
    danger: "border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 focus-visible:ring-red-500",
    new: "bg-slate-500 text-white shadow-sm hover:bg-slate-600 focus-visible:ring-slate-400",
    filter: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
};

const activeFilterClasses = "bg-neutral-300 text-white border-neutral-600 hover:bg-neutral-700";

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
};

export function Button({ variant = "primary", size = "md", isActive = false, className, ...props }: ButtonProps) {
    let classes = baseClasses + " " + sizeClasses[size];

    if (variant === "filter" && isActive) {
        classes += " " + activeFilterClasses;
    } else {
        classes += " " + variantClasses[variant];
    }

    if (className) {
        classes += " " + className;
    }

    return <button className={classes} {...props} />;
}
