import React from "react";

/**
 * Reusable ADS-style Input
 */
const Input = ({
  label,
  error,
  icon: Icon,
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ads-text-subtlest group-focus-within:text-ads-primary transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          disabled={disabled}
          className={`
            w-full h-10 rounded-md border text-sm font-medium transition-all duration-200 outline-none
            ${Icon ? "pl-9 pr-4" : "px-3"}
            ${disabled ? "bg-ads-surface text-ads-text-subtlest border-ads-border cursor-not-allowed" : "bg-white text-ads-text border-ads-border hover:bg-slate-50 focus:border-ads-border-focus focus:ring-2 focus:ring-ads-border-focus/10"}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-semibold text-red-500 ml-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
