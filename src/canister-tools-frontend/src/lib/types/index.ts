export interface Canister {
    id: string
    status: "active" | "inactive"
    memoryUsage: number
    size: string
    name: string
  }
  