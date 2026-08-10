import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { keccak256, stringToHex, verifyMessage, type Hex } from "viem";
import type { IntentPayload, Scope, SessionKeyState } from "./types";

/** Real cryptography, sandbox custody.
 *  Session keys are genuine secp256k1 keypairs generated in the browser.
 *  They hold no funds — they exist to sign settlement receipts so every
 *  execution carries a verifiable ECDSA proof. */

export const DEFAULT_SCOPES: Scope[] = [
  "NFT_BUY",
  "DEX_SWAP",
  "YIELD_MOVE",
  "AGENT_PAY",
];

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function forgeSessionKey(scopes: Scope[] = DEFAULT_SCOPES): SessionKeyState {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const now = Date.now();
  return {
    privateKey,
    address: account.address,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    scopes,
    active: true,
  };
}

/** Canonical content hash of a payload + timestamp — what actually gets signed. */
export function payloadHash(payload: IntentPayload, at: number): Hex {
  const canonical = JSON.stringify({ ...payload, at });
  return keccak256(stringToHex(canonical));
}

export async function signHash(key: SessionKeyState, hash: Hex): Promise<Hex> {
  const account = privateKeyToAccount(key.privateKey as Hex);
  return account.signMessage({ message: hash });
}

export async function signText(key: SessionKeyState, message: string): Promise<Hex> {
  const account = privateKeyToAccount(key.privateKey as Hex);
  return account.signMessage({ message });
}

export async function verifySig(
  address: string,
  message: string,
  signature: string,
): Promise<boolean> {
  try {
    return await verifyMessage({
      address: address as Hex,
      message,
      signature: signature as Hex,
    });
  } catch {
    return false;
  }
}
