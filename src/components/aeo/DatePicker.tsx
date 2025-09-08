import { InputHTMLAttributes } from "react";

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DatePicker({ value, onChange, ...props }: DatePickerProps) {
    return (
        <div>
            <input
                type="date"
                value={value}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                {...props}
            />
        </div>
    );
}