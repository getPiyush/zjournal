import React from "react";
import styled, { css } from "styled-components";

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

const StyledButton = styled.button<{ $variant: "primary" | "secondary" }>`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 14px;
  cursor: pointer;

  ${({ $variant }) =>
    $variant === "primary"
      ? css`
          background: #0366d6;
          color: white;
        `
      : css`
          background: #e6eef8;
          color: #0366d6;
        `}
`;

export default function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <StyledButton $variant={variant} onClick={onClick}>
      {children}
    </StyledButton>
  );
}
