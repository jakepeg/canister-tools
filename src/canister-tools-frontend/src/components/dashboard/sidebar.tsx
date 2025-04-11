"use client"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = ["My Canisters", "Backups", "Domains"]

  return (
    <aside className="w-32 bg-[#121212] text-white border-r border-gray-800">
      <nav className="p-4">
        <ul className="space-y-4">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                className={`w-full text-left py-1 text-sm ${activeTab === tab ? "text-white" : "text-gray-400"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
