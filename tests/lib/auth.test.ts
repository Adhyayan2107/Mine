import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionCookieValue, isValidSessionCookie } from '@/lib/auth';

describe('session cookie signing', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret';
  });

  it('a freshly created cookie value is valid', async () => {
    const value = await createSessionCookieValue();
    expect(await isValidSessionCookie(value)).toBe(true);
  });

  it('rejects a tampered cookie value', async () => {
    const value = await createSessionCookieValue();
    expect(await isValidSessionCookie(value.slice(0, -1) + 'x')).toBe(false);
  });

  it('rejects undefined and empty values', async () => {
    expect(await isValidSessionCookie(undefined)).toBe(false);
    expect(await isValidSessionCookie('')).toBe(false);
  });

  it('rejects a cookie signed with a different secret', async () => {
    const value = await createSessionCookieValue();
    process.env.SESSION_SECRET = 'a-different-secret';
    expect(await isValidSessionCookie(value)).toBe(false);
  });
});
