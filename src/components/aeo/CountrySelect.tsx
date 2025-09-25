import { SelectHTMLAttributes } from "react";

interface Option {
    value: string;
    label: string;
}

interface CountrySelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
    label: string;
    options: Option[];
    value: string; // This will be the country label
    onChange: (e: { target: { value: string } }) => void; // This will receive the country label
}

export default function CountrySelect({ label, options, value, onChange, ...props }: CountrySelectProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                value={value}
                onChange={onChange}
                {...props}
            >
                <option value="">Select {label}</option>
                {options.map(option => (
                    <option key={option.value} value={option.label}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

