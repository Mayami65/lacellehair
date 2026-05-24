import crypto from "crypto";

const tokens = new Map<string, number>();

export function createToken(ttlSeconds = 24 * 3600) {
  const token = cryptoRandom();
  const expires = Date.now() + ttlSeconds * 1000;
  tokens.set(token, expires);
  return token;
}

export function validateToken(token?: string) {
  if (!token) return false;
  const exp = tokens.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function revokeToken(token?: string) {
  if (!token) return;
  tokens.delete(token);
}

function cryptoRandom() {
  // 32 bytes hex
  try {
    return crypto.randomBytes(32).toString("hex");
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
