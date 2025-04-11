interface FooterProps {
    usagePercentage: number
    }

    export default function Footer({ usagePercentage }: FooterProps) {
    return (
        <footer className="p-2 bg-[#121212] text-white border-t border-gray-800 flex items-center">
        <div className="flex items-center">
            <div className="w-6 h-6 mr-2">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#ff6b00" strokeWidth="2" />
                <circle cx="12" cy="12" r="5" fill="#ff6b00" />
            </svg>
            </div>
            <span className="text-xs text-gray-400">{usagePercentage}% on chain</span>
        </div>
        </footer>
    )
}
  