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
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95";
  
  const variants = {
    primary: "bg-[#2563EB] text-white hover:bg-[#1E3A8A] shadow-md shadow-blue-500/20",
    secondary: "bg-[#059669] text-white hover:bg-[#047857] shadow-md shadow-green-500/20",
    accent: "bg-[#EA580C] text-white hover:bg-[#C2410C] shadow-md shadow-orange-500/20",
    outline: "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}
