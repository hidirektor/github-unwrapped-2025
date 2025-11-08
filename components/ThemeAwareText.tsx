"use client";

import {useTheme} from "@/contexts/ThemeContext";
import {ReactNode} from "react";

interface ThemeAwareTextProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

export function ThemeAwareText({ children, variant = "primary", className = "" }: ThemeAwareTextProps) {
  const { theme } = useTheme();
  
  const getColorClass = () => {
    if (variant === "primary") return "theme-text-primary";
    if (variant === "secondary") return "theme-text-secondary";
    return "theme-text-accent";
  };

  return <span className={`${getColorClass()} ${className}`}>{children}</span>;
}

