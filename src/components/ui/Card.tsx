import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
