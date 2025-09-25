interface AddButtonProps {
    onClick: () => void;
    text: string;
}

export default function AddButton({ onClick, text }: AddButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {text}
        </button>
    );
}