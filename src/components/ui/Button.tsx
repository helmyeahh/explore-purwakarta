import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 active:scale-95";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-sm",
    md: "px-4 py-3 text-sm rounded-md",
    lg: "px-6 py-4 text-base rounded-lg",
    icon: "p-2 rounded-full",
  };

  const variants = {
    primary: "bg-forest-dark text-white hover:bg-forest-light shadow-sm",
    secondary: "bg-forest-light text-white hover:bg-forest-dark shadow-sm",
    accent: "bg-white text-forest-dark border border-forest-dark hover:bg-gray-50 shadow-sm",
    outline: "bg-transparent text-forest-dark border border-forest-dark hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
