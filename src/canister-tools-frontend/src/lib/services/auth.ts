import { unreachable } from "@/lib/shared/unreachable";
import { AuthClient } from "@dfinity/auth-client";
import { derived, get, writable } from "svelte/store";
import { createActor } from "../../../../declarations/canister-tools-backend"; // Use the factory
import type { ActorType } from "../shared/actor";
import { CanisterManagementService } from "./canisterManagement"

import { UserService } from "./user";

type AuthStateUninitialized = {
  state: "uninitialized";
};

export type AuthStateAuthenticated = {
  state: "authenticated";
  actor: ActorType;
  authClient: AuthClient;
  userService: UserService;
  canisterManagementService: CanisterManagementService;
};

export type AuthStateUnauthenticated = {
  state: "unauthenticated";
  authClient: AuthClient;
  actor: ActorType;
};

export type AuthState =
  | AuthStateUninitialized
  | AuthStateAuthenticated
  | AuthStateUnauthenticated;

function createAuthStore() {
  const { subscribe, set } = writable<AuthState>({
    state: "uninitialized",
  });

  return {
    subscribe,
    set,
    setLoggedin: (
      actor: ActorType,
      authClient: AuthClient,
      userService: UserService,
      canisterManagementService: CanisterManagementService
    ) => {
      set({
        state: "authenticated",
        actor,
        authClient,
        userService,
        canisterManagementService
      });
    },
    setLoggedout: (
      actor: ActorType,
      authClient: AuthClient,
      canisterManagementService: CanisterManagementService
    ) => {
      set({
        state: "unauthenticated",
        actor,
        authClient,
        canisterManagementService
      });
    },
  };
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(
  authStore,
  (store) => store.state === "authenticated"
);

function createServices(actor: ActorType) {
  const userService = new UserService(actor);
  userService.init();
 
  return {
    userService,
   
  };
}

export class AuthService {
  constructor(
    private canisterId: string,
    private host: string,
    private iiUrl: string
  ) {}

  async init() {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      const actor = createActor(this.canisterId, {
        agentOptions: { host: this.host, identity: authClient.getIdentity() },
      });

      const { userService, } =
        createServices(actor);

      authStore.setLoggedin(
        actor,
        authClient,
        userService,
        
      );
    } else {
      const actor = createActor(this.canisterId, {
        agentOptions: {
          host: this.host,
          identity: authClient.getIdentity(),
        },
      });
    
      authStore.setLoggedout(actor, authClient);
    }
  }

  async login() {
    const store = get(authStore);

    if (store.state === "authenticated") {
      return;
    } else if (store.state === "uninitialized") {
      return;
    } else if (store.state === "unauthenticated") {
      try {
        await new Promise<void>((resolve, reject) => {
          store.authClient.login({
            identityProvider: this.iiUrl,
            onSuccess: resolve,
            onError: reject,
          });
        });
        const actor = createActor(this.canisterId, {
          agentOptions: {
            host: this.host,
            identity: store.authClient.getIdentity(),
          },
        });
        const { userService } =
          createServices(actor);

        authStore.setLoggedin(
          actor,
          store.authClient,
          userService,
         
        );
      } catch (e) {
        const actor = createActor(this.canisterId, {
          agentOptions: {
            host: this.host,
            identity: store.authClient.getIdentity(),
          },
        });

        authStore.setLoggedout(actor, store.authClient);
      }
    } else {
      unreachable(store);
    }
  }

  async logout() {
    const store = get(authStore);
    if (store.state === "authenticated") {
      try {
        await store.authClient.logout();
        store.userService.reset();
        const actor = createActor(this.canisterId, {
          agentOptions: {
            host: this.host,
            identity: store.authClient.getIdentity(),
          },
        });
        authStore.setLoggedout(actor, store.authClient);
      } catch (e) {}
    } else if (store.state === "uninitialized") {
      return;
    } else if (store.state === "unauthenticated") {
      return;
    } else {
      unreachable(store);
    }
  }
}

export const authService = new AuthService(
  import.meta.env.VITE_BACKEND_CANISTER_ID,
  import.meta.env.VITE_HOST,
  import.meta.env.VITE_II_URL
);