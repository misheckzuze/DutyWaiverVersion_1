interface SectionHeaderProps {
    title: string;
    description?: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
    return (
        <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
            {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
        </div>
    );
}