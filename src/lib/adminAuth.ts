const tokens = new Map<string, number>();

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "lacelle-admin-dev-secret"
  );
}

export function createToken(ttlSeconds = 24 * 3600) {
  const expires = Date.now() + ttlSeconds * 1000;
  const nonce = cryptoRandom();
  const payload = `${expires}.${nonce}`;
  const signature = simpleSign(payload, sessionSecret());
  const token = `${payload}.${signature}`;
  return token;
}

export function validateToken(token?: string) {
  if (!token) return false;
  const revokedExp = tokens.get(token);
  if (revokedExp && Date.now() < revokedExp) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const exp = Number(parts[0]);
  const nonce = parts[1];
  const signature = parts[2];
  if (!exp || !nonce || !signature) return false;

  const payload = `${exp}.${nonce}`;
  const expected = simpleSign(payload, sessionSecret());
  if (signature !== expected) return false;

  if (Date.now() > exp) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function revokeToken(token?: string) {
  if (!token) return;
  // Keep a short-lived in-memory revocation entry for immediate logout effect.
  const parts = token.split(".");
  const exp = Number(parts[0]);
  if (exp && Date.now() < exp) {
    tokens.set(token, exp);
  } else {
    tokens.delete(token);
  }
}

function cryptoRandom() {
  // Use Web Crypto when available so this module works in both Node and Edge runtimes.
  try {
    const arr = new Uint8Array(32);
    globalThis.crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function simpleSign(payload: string, secret: string) {
  // Lightweight deterministic signature suitable for stateless session checks.
  let hash = 2166136261;
  const input = `${payload}.${secret}`;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
