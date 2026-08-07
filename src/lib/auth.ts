// Uses the Web Crypto API (global `crypto`), not Node's `crypto` module —
// this file is imported by middleware.ts, which runs in the Edge runtime
// where Node built-ins like `crypto.createHmac` aren't available.

const SESSION_PAYLOAD = 'authenticated';

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export async function createSessionCookieValue(): Promise<string> {
  const key = await importKey(process.env.SESSION_SECRET!);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(SESSION_PAYLOAD));
  return `${SESSION_PAYLOAD}.${toHex(signature)}`;
}

export async function isValidSessionCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [payload, signatureHex] = value.split('.');
  if (payload !== SESSION_PAYLOAD || !signatureHex) return false;

  const key = await importKey(process.env.SESSION_SECRET!);
  try {
    return await crypto.subtle.verify(
      'HMAC',
      key,
      fromHex(signatureHex) as BufferSource,
      new TextEncoder().encode(SESSION_PAYLOAD),
    );
  } catch {
    return false;
  }
}
