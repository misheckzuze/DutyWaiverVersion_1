interface RemoveButtonProps {
    onClick: () => void;
}

export default function RemoveButton({ onClick }: RemoveButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            title="Remove"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}