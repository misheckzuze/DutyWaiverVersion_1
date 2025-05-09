import React, { FC, useCallback } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  formatNumber?: boolean; // New prop to enable number formatting
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  formatNumber = false, // Default to false for backward compatibility
}) => {
  // Format number with commas
  const formatNumberWithCommas = useCallback((num: string): string => {
    // Remove all non-digit characters except decimal point
    const numStr = num.replace(/[^\d.]/g, '');
    if (!numStr) return '';
    
    // Split into whole and decimal parts
    const parts = numStr.split('.');
    let wholePart = parts[0];
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';
    
    // Add commas to whole number part
    wholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return wholePart + decimalPart;
  }, []);

  // Parse formatted number back to raw number
  const parseFormattedNumber = useCallback((formattedValue: string): string => {
    return formattedValue.replace(/,/g, '');
  }, []);

  // Handle change event for formatted numbers
  const handleFormattedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    
    const rawValue = parseFormattedNumber(e.target.value);
    const formattedValue = formatNumberWithCommas(rawValue);
    
    // Create a new event with the formatted value
    const formattedEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatNumber ? formattedValue : rawValue
      }
    };
    
    onChange(formattedEvent);
  }, [onChange, formatNumber, formatNumberWithCommas, parseFormattedNumber]);

  // Determine input styles based on state
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  // Determine the actual input type
  const inputType = formatNumber ? 'text' : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={formatNumber && typeof value === 'string' ? 
          formatNumberWithCommas(parseFormattedNumber(value)) : 
          value
        }
        onChange={formatNumber ? handleFormattedChange : onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
        inputMode={formatNumber ? "numeric" : undefined}
        pattern={formatNumber ? "[0-9,.]*" : undefined}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;