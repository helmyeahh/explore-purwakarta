import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline";
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  icon: Icon,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-300 active:scale-95";
  
  const variants = {
    primary: "bg-forest-dark text-white hover:bg-forest-light shadow-sm",
    secondary: "bg-forest-light text-white hover:bg-forest-dark shadow-sm",
    accent: "bg-white text-forest-dark border border-forest-dark hover:bg-gray-50 shadow-sm",
    outline: "bg-transparent text-forest-dark border border-forest-dark hover:bg-gray-50",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
