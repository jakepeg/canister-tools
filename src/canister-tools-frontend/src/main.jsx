import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import "@nfid/identitykit/react/styles.css"; // Import IdentityKit styles
import { IdentityKitProvider } from "@nfid/identitykit/react"; // Import Provider

// Access the backend canister ID from environment variables
const backendCanisterId = import.meta.env.CANISTER_ID_CANISTER_TOOLS_BACKEND;

// Ensure the canister ID is available before rendering
if (!backendCanisterId) {
  throw new Error("CANISTER_ID_CANISTER_TOOLS_BACKEND environment variable not set.");
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element with ID 'root' not found in the DOM.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <IdentityKitProvider
      authType={'DELEGATION'} // Use uppercase string literal
      signerClientOptions={{
        targets: [backendCanisterId] // Add backend canister ID to targets
      }}>
      <App />
    </IdentityKitProvider>
  </React.StrictMode>,
);
