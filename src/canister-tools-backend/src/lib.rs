use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::{caller, query, update};
use std::cell::RefCell;
use std::collections::HashMap;

#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// --- Canister Registration State (In-Memory Example) ---
// NOTE: For production, use stable storage (e.g., StableBTreeMap)
type CanisterName = String;
type UserCanisterRegistry = HashMap<Principal, HashMap<Principal, CanisterName>>;

thread_local! {
    // Maps User Principal -> (Map of Canister Principal -> Canister Name)
    static REGISTRY: RefCell<UserCanisterRegistry> = RefCell::default();
}

// --- Canister Registration Logic ---

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum RegisterResult {
    Ok,
    Err(String),
}

#[update]
fn register_canister(canister_id: Principal, name: CanisterName) -> RegisterResult {
    let user = caller();
    REGISTRY.with(|registry_ref| {
        let mut registry = registry_ref.borrow_mut();
        let user_canisters = registry.entry(user).or_insert_with(HashMap::new);

        if user_canisters.contains_key(&canister_id) {
            RegisterResult::Err(format!(
                "Canister {} already registered for user {}",
                canister_id, user
            ))
        } else {
            user_canisters.insert(canister_id, name);
            RegisterResult::Ok
        }
    })
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CanisterInfo {
    id: Principal,
    name: CanisterName,
}

#[query]
fn get_user_canisters() -> Vec<CanisterInfo> {
    let user = caller();
    REGISTRY.with(|registry_ref| {
        registry_ref
            .borrow()
            .get(&user)
            .map(|user_canisters| {
                user_canisters
                    .iter()
                    .map(|(id, name)| CanisterInfo {
                        id: *id,
                        name: name.clone(),
                    })
                    .collect()
            })
            .unwrap_or_else(Vec::new) // Return empty vec if user not found
    })
}

// --- ICRC10/ICRC28 Support for NFID ---

#[derive(CandidType, Deserialize, Eq, PartialEq, Debug, Clone)]
pub struct SupportedStandard {
    pub url: String,
    pub name: String,
}

#[query]
fn icrc10_supported_standards() -> Vec<SupportedStandard> {
    vec![
        SupportedStandard {
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md".to_string(),
            name: "ICRC-10".to_string(),
        },
        SupportedStandard {
            url: "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_28_trusted_origins.md".to_string(),
            name: "ICRC-28".to_string(),
        },
    ]
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Icrc28TrustedOriginsResponse {
    pub trusted_origins: Vec<String>,
}

// IMPORTANT: Replace "YOUR_FRONTEND_CANISTER_ID" with your actual frontend canister ID before deployment.
const FRONTEND_CANISTER_ID: &str = "YOUR_FRONTEND_CANISTER_ID";

#[update]
fn icrc28_trusted_origins() -> Icrc28TrustedOriginsResponse {
    // Construct the origins based on the frontend canister ID
    let trusted_origins = vec![
        format!("https://{}.icp0.io", FRONTEND_CANISTER_ID),
        format!("https://{}.raw.icp0.io", FRONTEND_CANISTER_ID),
        format!("https://{}.ic0.app", FRONTEND_CANISTER_ID),
        format!("https://{}.raw.ic0.app", FRONTEND_CANISTER_ID),
        format!("https://{}.icp0.icp-api.io", FRONTEND_CANISTER_ID),
        format!("https://{}.icp-api.io", FRONTEND_CANISTER_ID),
        // Add any custom domains if you have them
        // String::from("https://yourcustomdomain.com"),
    ];

    // Add local development origin if running locally (adjust port if needed)
    // This assumes the standard dfx replica port 4943 and frontend port 3000
    // You might need to adjust this based on your local setup
    let local_origin = format!("http://127.0.0.1:3000"); // Vite default port
    let dfx_replica_origin = format!("http://{}.localhost:4943", FRONTEND_CANISTER_ID);

    let mut final_origins = trusted_origins;
    final_origins.push(local_origin);
    final_origins.push(dfx_replica_origin);

    Icrc28TrustedOriginsResponse {
        trusted_origins: final_origins,
    }
}
