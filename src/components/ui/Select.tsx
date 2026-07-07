'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  label,
  options,
  error,
  value,
  onChange,
  required,
  placeholder = 'Select an option',
  name,
  disabled,
  className = '',
}: SelectProps) {
  const selectId = name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm appearance-none
            bg-white dark:bg-slate-800/80
            border border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            dark:focus:ring-indigo-400/50 dark:focus:border-indigo-400
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 cursor-pointer pr-10
            ${error ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/50' : ''}
            ${className}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-rose-500 dark:text-rose-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Also export as named export for backwards compatibility
export { Select };
