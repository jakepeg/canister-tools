import { useState } from 'react';
import { canister_tools_backend } from '../../declarations/canister-tools-backend';
import CanisterDashboard from "@/components/dashboard/canister-dashboard"

function App() {

  return (
    <main className="min-h-screen bg-[#121212]">
      <CanisterDashboard />
    </main>
  );
}

export default App;
