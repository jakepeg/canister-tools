import CanisterCard from "./canister-card"
import type { Canister } from "@/lib/types"

interface CanisterGridProps {
  canisters: Canister[]
}

export default function CanisterGrid({ canisters }: CanisterGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {canisters.map((canister) => (
        <CanisterCard key={canister.id} canister={canister} />
      ))}
    </div>
  )
}
