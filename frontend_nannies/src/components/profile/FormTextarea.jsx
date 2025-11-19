import React from "react";

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  maxLength,
  rows = 4,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {maxLength && (
          <span className="text-xs text-gray-500 ml-2">
            ({value?.length || 0}/{maxLength})
          </span>
        )}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
      />
    </div>
  );
}
