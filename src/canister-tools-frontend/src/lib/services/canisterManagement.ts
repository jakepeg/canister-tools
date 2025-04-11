import { Principal } from '@dfinity/principal';
import { Identity } from '@dfinity/agent'; // Import Identity and createAgent
import {
	ICManagementCanister,
	type canister_status_result, // Correct type import
} from '@dfinity/ic-management';
import { createAgent } from '@dfinity/utils'; // Use createAgent helper

// --- Interface for Monitoring Data ---
export interface CanisterMonitoringData {
	status: 'running' | 'stopping' | 'stopped' | 'unknown';
	memorySize: bigint;
	cycles: bigint;
	idleCyclesBurnedPerDay: bigint; // Correct property name
	moduleHash: string | null; // Module hash can be empty
	controllers: string[];
}

// --- Result Type ---
export type GetCanisterMonitoringDataResult =
	| { ok: CanisterMonitoringData }
	| { err: string };

// --- Canister Management Service Class ---
export class CanisterManagementService {

	/**
	 * Fetches the status of a given canister using the provided identity and host.
	 * @param canisterId - The Principal of the canister to query.
	 * @param identity - The Identity to use for the call (must have controller rights).
	 * @param host - The IC host URL (e.g., 'https://icp-api.io' or 'http://127.0.0.1:4943').
	 * @returns A promise resolving to GetCanisterMonitoringDataResult.
	 */
	async getCanisterMonitoringData(
		canisterId: Principal,
		identity: Identity, // Expect an Identity
		host: string
	): Promise<GetCanisterMonitoringDataResult> {

		console.log(`Fetching status for canister: ${canisterId.toText()} using identity: ${identity.getPrincipal().toText()}`);

		try {
			// Create an agent using the provided identity and host
			const agent = await createAgent({ identity, host });

			// Fetch root key for local development network ONLY
			if (host.includes('localhost') || host.includes('127.0.0.1')) {
				try {
					console.log('Fetching root key for local replica (status check)...');
					await agent.fetchRootKey();
					console.log('Root key fetched (status check).');
				} catch (err: any) {
					console.warn(
						'Could not fetch root key (status check). Network might not be running or requires authentication.',
						err
					);
					// Continue anyway, might work if root key already fetched
				}
			}

			// Create the management canister actor
			const managementCanister = ICManagementCanister.create({ agent });

			console.log(`Requesting status for canister ${canisterId.toText()}...`);
			// Pass the canisterId Principal directly
			const statusResult = await managementCanister.canisterStatus(canisterId);
			console.log(`Status received for ${canisterId.toText()}:`, statusResult);

			// Map the result to our interface
			const monitoringData: CanisterMonitoringData = {
				// Safely access the status key, default to 'unknown'
				status: (Object.keys(statusResult.status)[0] as CanisterMonitoringData['status']) ?? 'unknown',
				memorySize: statusResult.memory_size,
				cycles: statusResult.cycles,
				// Use the correct property name from the type definition
				idleCyclesBurnedPerDay: statusResult.idle_cycles_burned_per_day,
				// module_hash is optional ([Uint8Array] or []), extract the inner array if present
				moduleHash: statusResult.module_hash.length > 0 && statusResult.module_hash[0]
					? Buffer.from(statusResult.module_hash[0]).toString('hex')
					: null,
				controllers: statusResult.settings.controllers.map(p => p.toText()),
			};

			return { ok: monitoringData };

		} catch (err: any) {
			console.error(`Error fetching status for canister ${canisterId.toText()}:`, err);
			// Provide more specific error feedback if possible
			if (err.message?.includes('only controllers')) {
				return { err: `Error fetching status: Only controllers of canister ${canisterId.toText()} can check its status.` };
			}
			if (err.message?.includes('could not be found')) {
				return { err: `Error fetching status: Canister ${canisterId.toText()} not found.` };
			}
			return { err: `Error fetching status for ${canisterId.toText()}: ${err.message || 'Unknown error'}` };
		}
	}
}

// Optional: Export a singleton instance if preferred for easier use
// export const canisterManagementService = new CanisterManagementService();
