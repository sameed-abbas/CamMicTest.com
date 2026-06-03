import crypto from "crypto";

/**
 * Decodes a Base32 string into a Buffer.
 * Compatible with RFC 4648 Base32 alphabet.
 */
export function base32Decode(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/=/g, "").replace(/\s/g, "");
  
  const length = cleaned.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const buffer = Buffer.alloc(Math.floor((length * 5) / 8));
  
  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) {
      throw new Error("Invalid base32 character in key");
    }
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return buffer;
}

/**
 * Generates a standard 6-digit TOTP token using HMAC-SHA1.
 * Matches RFC 6238.
 *
 * @param secret Base32 encoded shared secret
 * @param timeStep Time step in seconds (default: 30)
 * @param timeOffset Integer offset steps to test clock-skew (default: 0)
 * @returns 6-digit string token
 */
export function generateTOTP(secret: string, timeStep = 30, timeOffset = 0): string {
  const key = base32Decode(secret);
  
  // Calculate counter based on time step and offset
  const epoch = Math.floor(Date.now() / 1000);
  const counterVal = Math.floor(epoch / timeStep) + timeOffset;
  
  // Write counter as 8-byte big-endian integer into a Buffer
  const buffer = Buffer.alloc(8);
  let tmp = counterVal;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tmp & 0xff;
    tmp = tmp >> 8;
  }
  
  // HMAC-SHA1
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(buffer);
  const hmacResult = hmac.digest();
  
  // Dynamic Truncation
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = 
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);
  
  const otp = code % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Verifies a user-provided TOTP token against the shared secret.
 * Compares against the current window, as well as preceding/succeeding windows to tolerate clock-skew.
 *
 * @param secret Base32 encoded shared secret
 * @param token The user's input token
 * @param window The window step tolerance on either side (default: 1 step of 30 seconds)
 * @returns boolean true if token is valid, false otherwise
 */
export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  const cleanedToken = token.trim();
  if (cleanedToken.length !== 6 || isNaN(Number(cleanedToken))) {
    return false;
  }
  
  for (let i = -window; i <= window; i++) {
    if (generateTOTP(secret, 30, i) === cleanedToken) {
      return true;
    }
  }
  return false;
}

/**
 * Generates a cryptographically secure random 16-character Base32 secret.
 * Output string is standard RFC 4648 Base32 alphabet.
 */
export function generateSecret(length = 16): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += alphabet[bytes[i] % 32];
  }
  return secret;
}
