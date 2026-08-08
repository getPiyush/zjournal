import React from "react";
import "./button.css";

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`ui-button ui-button--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
