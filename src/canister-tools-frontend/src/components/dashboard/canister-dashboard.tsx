"use client"

import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import CanisterGrid from "./canister-grid"
import Footer from "./footer"
import mockData from "@/lib/data/mock-data"

export default function CanisterDashboard() {
  const [activeTab, setActiveTab] = useState("My Canisters")

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto p-6 bg-[#0a0a1e]">
          <div className="flex justify-end mb-4 space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-600 rounded text-white hover:bg-gray-700">
              Link Canister
            </button>
            <button className="px-3 py-1 text-sm border border-gray-600 rounded text-white hover:bg-gray-700">
              New Canister
            </button>
          </div>
          <CanisterGrid canisters={mockData.canisters} />
        </main>
      </div>
      <Footer usagePercentage={mockData.usagePercentage} />
    </div>
  )
}
