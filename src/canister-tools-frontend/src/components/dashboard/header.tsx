export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-[#121212] text-white border-b border-gray-800">
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
          <span className="text-xs">C</span>
        </div>
        <h1 className="text-sm font-medium">CANISTER TOOLS</h1>
      </div>
      <div className="flex space-x-2">
        <button className="text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2 L12 22 M17 5 L7 5 M19 9 L5 9 M21 13 L3 13 M19 17 L5 17 M17 21 L7 21" />
          </svg>
        </button>
        <button className="text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3 L9 21 M15 3 L15 21 M3 9 L21 9 M3 15 L21 15" />
          </svg>
        </button>
      </div>
    </header>
  )
}
