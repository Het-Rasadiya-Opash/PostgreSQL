import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable ADS-style Button
 */
const Button = ({
  children,
  type = "button",
  variant = "primary", // primary, outline, ghost, danger
  size = "md", // sm, md, lg
  loading = false,
  disabled = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: "bg-ads-primary text-white hover:bg-ads-primary-hover shadow-sm",
    secondary: "bg-ads-surface text-ads-text border border-ads-border hover:bg-ads-surface-hover",
    ghost: "text-ads-text-subtle hover:bg-ads-surface hover:text-ads-text",
    danger: "bg-ads-danger-light text-ads-danger border border-ads-danger/20 hover:bg-ads-danger/10",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs font-semibold",
    md: "px-4 py-2 text-sm font-bold",
    lg: "px-6 py-3 text-base font-bold",
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
