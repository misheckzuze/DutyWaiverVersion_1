import { InputHTMLAttributes, useRef, useEffect } from "react";

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DatePicker({ value, onChange, className, ...props }: DatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        // Ensure the input is always clickable and properly styled
        if (inputRef.current) {
            const input = inputRef.current;
            input.style.pointerEvents = 'auto';
            input.style.cursor = 'pointer';
            input.style.position = 'relative';
            input.style.zIndex = '10';
            input.style.minHeight = '40px';
            
            // Force show the date picker on click
            const handleClick = () => {
                input.showPicker?.();
            };
            
            input.addEventListener('click', handleClick);
            
            // Cleanup
            return () => {
                input.removeEventListener('click', handleClick);
            };
        }
    }, []);

    const defaultClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors cursor-pointer";
    
    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="date"
                value={value}
                onChange={onChange}
                className={className || defaultClassName}
                style={{
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 10,
                    minHeight: '40px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    display: 'block',
                    width: '100%'
                }}
                onFocus={(e) => {
                    e.currentTarget.style.pointerEvents = 'auto';
                    e.currentTarget.style.cursor = 'pointer';
                    // Try to show the picker on focus
                    if (e.currentTarget.showPicker) {
                        e.currentTarget.showPicker();
                    }
                }}
                onClick={(e) => {
                    // Ensure click events work
                    e.stopPropagation();
                    if (e.currentTarget.showPicker) {
                        e.currentTarget.showPicker();
                    }
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.cursor = 'pointer';
                }}
                {...props}
            />
        </div>
    );
}