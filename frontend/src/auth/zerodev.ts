/**
 * zerodev.ts — Account abstraction via ZeroDev Kernel (ERC-4337).
 *
 * After a user signs in with Google, call `getSmartWalletAddress(idToken)`
 * to silently provision (or retrieve) their gasless Kernel smart account.
 * The smart wallet is deterministic per Firebase UID so it never changes.
 *
 * Requires VITE_ZERODEV_PROJECT_ID in frontend/.env
 */

import { createPublicClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// ZeroDev's 0G Galileo testnet chain definition (chain id 16602).
// We mirror the chain Mindfeint already uses so the wallet lives on the same network.
const og0GGalileo = {
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
} as const;

/**
 * Derive a deterministic private key from the user's Firebase UID.
 * We hash the UID + a fixed salt so the resulting key is always the same
 * for the same user, but never the raw Firebase credential.
 *
 * NOTE: This is a development-grade approach. In production, use a proper
 * key-management solution (e.g. Web3Auth / Lit Protocol).
 */
async function deriveKeyFromUid(uid: string): Promise<`0x${string}`> {
  const salt = "mindfeint-v1-account-abstraction";
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${uid}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // Private keys must be 32 bytes; SHA-256 is exactly that.
  return `0x${hashHex}`;
}

export interface SmartWalletResult {
  address: string;
  status: "ready" | "error";
  error?: string;
}

/**
 * Provisions (or retrieves) the ZeroDev Kernel smart account for the given Firebase UID.
 * Returns the smart wallet address that acts as the player's on-chain identity.
 */
export async function getSmartWalletAddress(
  uid: string
): Promise<SmartWalletResult> {
  const projectId = import.meta.env.VITE_ZERODEV_PROJECT_ID as string | undefined;

  // Graceful degradation: if ZeroDev is not configured, skip silently.
  if (!projectId) {
    return { address: "", status: "error", error: "VITE_ZERODEV_PROJECT_ID not set" };
  }

  try {
    // Dynamically import ZeroDev so it doesn't block the initial bundle parse.
    const { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } =
      await import("@zerodev/sdk");
    const { signerToEcdsaValidator } = await import("@zerodev/ecdsa-validator");
    const { KERNEL_V3_1 } = await import("@zerodev/sdk/constants");
    const { createBundlerClient } = await import("viem/account-abstraction");

    const privateKey = await deriveKeyFromUid(uid);
    const signer = privateKeyToAccount(privateKey);

    const bundlerRpc = `https://rpc.zerodev.app/api/v3/${projectId}/chain/${og0GGalileo.id}`;
    const paymasterRpc = `https://rpc.zerodev.app/api/v3/${projectId}/chain/${og0GGalileo.id}`;

    const publicClient = createPublicClient({
      chain: og0GGalileo,
      transport: http(bundlerRpc),
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      kernelVersion: KERNEL_V3_1,
    });

    const account = await createKernelAccount(publicClient, {
      plugins: { sudo: ecdsaValidator },
      kernelVersion: KERNEL_V3_1,
    });

    return { address: account.address, status: "ready" };
  } catch (err) {
    console.warn("[ZeroDev] Smart wallet provisioning failed:", err);
    return {
      address: "",
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
