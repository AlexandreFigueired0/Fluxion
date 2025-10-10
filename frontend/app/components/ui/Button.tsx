'use client';
import React from 'react'

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}

const Button = ({ children, variant = 'primary', onClick, className = '' }: ButtonProps) => {
  const baseStyles = "px-8 py-4 rounded font-bold transition";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700",
    secondary: "border-2 border-zinc-700 hover:border-zinc-600"
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;