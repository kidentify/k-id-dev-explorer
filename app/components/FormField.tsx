'use client';

import { FORM_CLASSES } from '../utils/constants';

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: 'text' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  className?: string;
}

export default function FormField({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  defaultValue,
  min,
  max,
  options,
  className = ''
}: FormFieldProps) {
  const baseClasses = disabled ? FORM_CLASSES.disabled : FORM_CLASSES.base;
  const finalClasses = `${baseClasses} ${className}`.trim();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          disabled={disabled}
          className={finalClasses}
          required={required}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          className={finalClasses}
          required={required}
          min={min}
          max={max}
        />
      )}
    </div>
  );
}
