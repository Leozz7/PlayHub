export function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1 text-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-900 dark:text-gray-100">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-medium text-gray-900 dark:text-gray-100">{rating}</span>
        </div>
    );
}



