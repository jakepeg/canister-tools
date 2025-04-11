"use client"

import { useState, useEffect } from "react";
// import { Principal } from "@dfinity/principal";
import { useIdentity, useAgent } from "@nfid/identitykit/react";
import Header from "./header";
import Sidebar from "./sidebar";
import CanisterGrid from "./canister-grid";
import Footer from "./footer";
import { CanisterManagementService, type CanisterMonitoringData } from "@/lib/services/canisterManagement";
// Import backend actor factory, actor type and CanisterInfo type from generated declarations
import { createActor } from "../../../../declarations/canister-tools-backend"; // Use the factory
import type { CanisterInfo } from "../../../../declarations/canister-tools-backend/canister-tools-backend.did"; // Import types
import type { Canister } from "@/lib/types"; // Import the target Canister type for the grid
import type { ActorType } from "@/lib/shared/actor";

// Define a combined type for the fetched data
interface FetchedCanisterData extends CanisterInfo {
  monitoringData: CanisterMonitoringData | null;
  error?: string;
}

export default function CanisterDashboard() {
  const [activeTab, setActiveTab] = useState("My Canisters");
  // State to hold the raw fetched data
  const [fetchedData, setFetchedData] = useState<FetchedCanisterData[]>([]);
  // State to hold the data formatted for the grid
  const [gridData, setGridData] = useState<Canister[]>([]);
  // State for total memory usage (example for footer)
  const [totalMemoryMB, setTotalMemoryMB] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get identity and agent directly from hooks
  const identity = useIdentity();
  const agent = useAgent();

  const host = import.meta.env.VITE_HOST || (import.meta.env.DEV ? 'http://127.0.0.1:4943' : 'https://icp-api.io');
  const backendCanisterId = import.meta.env.CANISTER_ID_CANISTER_TOOLS_BACKEND;

  useEffect(() => {
    // Function to format bytes (add this to utils.ts or define inline)
    const formatBytes = (bytes: bigint, decimals = 2): string => {
        if (bytes === 0n) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(Number(bytes)) / Math.log(k)); // Convert BigInt for Math.log
        // Use Number() for calculation, potentially losing precision for very large numbers
        return parseFloat((Number(bytes) / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const fetchCanisterData = async () => {
      // Check if identity and agent are ready
      if (!identity || !agent || !backendCanisterId) {
        setError("User not authenticated or agent/backend ID not available.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setFetchedData([]); // Clear previous data
      setGridData([]);
      setTotalMemoryMB(0);

      try {
        console.log("Creating backend actor...");
        // Use the actor factory from declarations
        const actor: ActorType = createActor(backendCanisterId, { agent });

        console.log("Fetching user canisters from backend...");
        const userCanisters: CanisterInfo[] = await actor.get_user_canisters();
        console.log("User canisters received:", userCanisters);

        if (userCanisters.length === 0) {
          console.log("No canisters registered for this user.");
          setIsLoading(false);
          return;
        }

        const managementService = new CanisterManagementService();
        // Fetch monitoring data for each canister
        const promises = userCanisters.map(async (canisterInfo): Promise<FetchedCanisterData> => {
          console.log(`Fetching status for canister: ${canisterInfo.id.toText()} (${canisterInfo.name})`);
          // Pass the identity object directly
          const result = await managementService.getCanisterMonitoringData(canisterInfo.id, identity, host);

          if ('ok' in result) {
            console.log(`Status OK for ${canisterInfo.id.toText()}`);
            return { ...canisterInfo, monitoringData: result.ok };
          } else {
            console.error(`Status Error for ${canisterInfo.id.toText()}: ${result.err}`);
            return { ...canisterInfo, monitoringData: null, error: result.err };
          }
        });

        const fetchedResults = await Promise.all(promises);
        console.log("All canister statuses fetched:", fetchedResults);
        setFetchedData(fetchedResults);

        // --- Transform data for the grid ---
        let currentTotalMemoryBytes = 0n;
        const transformedGridData = fetchedResults
          .filter(data => data.monitoringData !== null) // Filter out canisters where status fetch failed
          .map((data): Canister => {
            const monitoring = data.monitoringData!; // We know it's not null here
            const memoryBytes = monitoring.memorySize;
            currentTotalMemoryBytes += memoryBytes; // Accumulate total memory

            // Convert memorySize (BigInt bytes) to MB (number)
            const memoryUsageMB = Number(memoryBytes / (1024n * 1024n));

            return {
              id: data.id.toText(), // Assumes CanisterInfo has 'id' (Principal)
              name: data.name,      // Assumes CanisterInfo has 'name' (string)
              status: monitoring.status === 'running' ? 'active' : 'inactive',
              memoryUsage: memoryUsageMB, // Use memory in MB as the number value
              size: formatBytes(memoryBytes), // Format bytes to string (e.g., "1.5 GB")
            };
          });

        setGridData(transformedGridData);
        // Set total memory in MB for the footer
        setTotalMemoryMB(Number(currentTotalMemoryBytes / (1024n * 1024n)));

      } catch (err: any) {
        console.error("Error fetching or processing canister data:", err);
        setError(`Failed to load canister data: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanisterData();
  }, [identity, agent, host, backendCanisterId]); // Add backendCanisterId to dependencies

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* ConnectWallet button is inside Header */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto p-6 bg-[#0a0a1e]">
          <div className="flex justify-end mb-4 space-x-2">
            {/* TODO: Implement Link/New Canister functionality */}
            <button className="px-3 py-1 text-sm border border-gray-600 rounded text-white hover:bg-gray-700">
              Link Canister
            </button>
            <button className="px-3 py-1 text-sm border border-gray-600 rounded text-white hover:bg-gray-700">
              New Canister
            </button>
          </div>
          {isLoading && <p className="text-white text-center">Loading canisters...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!isLoading && !error && gridData.length === 0 && fetchedData.length > 0 && <p className="text-yellow-500 text-center">Could not load status for any registered canisters.</p>}
          {!isLoading && !error && gridData.length === 0 && fetchedData.length === 0 && <p className="text-gray-400 text-center">No canisters found. Link or create a new one.</p>}
          {!isLoading && !error && gridData.length > 0 && (
            <CanisterGrid canisters={gridData} /> // Pass transformed data
          )}
        </main>
      </div>
      {/* Pass calculated total memory (example) */}
      <Footer usagePercentage={totalMemoryMB} />
    </div>
  );
}
