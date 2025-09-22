import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function FormInput({ label, error, ...props }: FormInputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <input
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors ${
                    error 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                }`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}