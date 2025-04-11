"use client"

import { MoreVertical } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Canister } from "@/types"

interface CanisterCardProps {
  canister: Canister
}

export default function CanisterCard({ canister }: CanisterCardProps) {
  return (
    <div className="bg-[#0f1a2b] border border-[#1e3a5f] rounded-md overflow-hidden">
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${canister.status === "active" ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-xs text-gray-400">{canister.id}</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-gray-400 hover:text-white">
              <MoreVertical size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-36 p-0 bg-[#0f1a2b] border border-[#1e3a5f] rounded-md shadow-lg"
            align="end"
            sideOffset={5}
          >
            <div className="p-2">
              <div className="text-xs text-white py-1 hover:bg-[#1e3a5f] rounded px-2 cursor-pointer">Runtime</div>
              <div className="text-xs text-white py-1 hover:bg-[#1e3a5f] rounded px-2 cursor-pointer">Backup</div>
              <div className="text-xs text-white py-1 hover:bg-[#1e3a5f] rounded px-2 cursor-pointer">Controllers</div>
              <div className="text-xs text-white py-1 hover:bg-[#1e3a5f] rounded px-2 cursor-pointer">
                Toggle Cycles
              </div>
              <div className="text-xs text-white py-1 hover:bg-[#1e3a5f] rounded px-2 cursor-pointer">
                Upgrade Storage
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-3 pt-0">
        <div className="mb-2">
          <div className="text-xs text-gray-400 mb-1">Memory</div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${canister.memoryUsage}%` }} />
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-2">{canister.size}</div>

        <div className="text-sm text-white">{canister.name}</div>
      </div>
    </div>
  )
}
