import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'wadie_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

declare global {
  var __wadieEphemeralAuthSecret: string | undefined;
}

function getAuthSecret(): string {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (!globalThis.__wadieEphemeralAuthSecret) {
    globalThis.__wadieEphemeralAuthSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalThis.__wadieEphemeralAuthSecret;
}

export function getConfiguredAdminEmail(): string {
  return (process.env.ADMIN_EMAIL?.trim() || 'aouedbensabeur@gmail.com').toLowerCase();
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0);
}

function sha256Digest(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

export function verifyAdminCredentials(emailInput: string, passwordInput: string): {
  valid: boolean;
  notConfigured?: boolean;
} {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || configuredPassword.trim().length === 0) {
    return { valid: false, notConfigured: true };
  }

  const expectedEmail = getConfiguredAdminEmail();
  const normalizedInputEmail = emailInput.trim().toLowerCase();

  const emailMatches = crypto.timingSafeEqual(
    sha256Digest(expectedEmail),
    sha256Digest(normalizedInputEmail)
  );

  let passwordMatches = false;
  if (configuredPassword.startsWith('scrypt$')) {
    const parts = configuredPassword.split('$');
    if (parts.length === 3) {
      const [, salt, hexHash] = parts;
      const derived = crypto.scryptSync(passwordInput, salt, 64);
      const stored = Buffer.from(hexHash, 'hex');
      if (derived.length === stored.length) {
        passwordMatches = crypto.timingSafeEqual(derived, stored);
      }
    }
  } else {
    passwordMatches = crypto.timingSafeEqual(
      sha256Digest(configuredPassword),
      sha256Digest(passwordInput)
    );
  }

  return { valid: emailMatches && passwordMatches };
}

export interface AdminSessionPayload {
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signSessionToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    email: email.toLowerCase(),
    role: 'admin',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encodedPayload)
    .digest();
  return `${encodedPayload}.${base64UrlEncode(signature)}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;

  const encodedPayload = token.slice(0, dotIdx);
  const encodedSig = token.slice(dotIdx + 1);
  if (!encodedPayload || !encodedSig) return null;

  const expectedSig = base64UrlEncode(
    crypto.createHmac('sha256', getAuthSecret()).update(encodedPayload).digest()
  );

  const a = Buffer.from(encodedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (
      parsed.role !== 'admin' ||
      typeof parsed.exp !== 'number' ||
      parsed.exp <= now ||
      parsed.email !== getConfiguredAdminEmail()
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

export function buildSessionCookie(token: string, isHttps: boolean): string {
  const attrs = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isHttps) {
    attrs.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    attrs.push('SameSite=Lax');
  }
  return attrs.join('; ');
}

export function buildClearSessionCookie(isHttps: boolean): string {
  const attrs = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
  ];
  if (isHttps) {
    attrs.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    attrs.push('SameSite=Lax');
  }
  return attrs.join('; ');
}

export function isRequestHttps(headers: Record<string, string | string[] | undefined>): boolean {
  const proto = headers['x-forwarded-proto'];
  if (typeof proto === 'string' && proto.split(',')[0].trim() === 'https') {
    return true;
  }
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

export function verifyCsrfOrigin(headers: Record<string, string | string[] | undefined>): boolean {
  const requestedWith = headers['x-requested-with'];
  if (typeof requestedWith === 'string' && requestedWith === 'XMLHttpRequest') {
    return true;
  }
  const origin = typeof headers['origin'] === 'string' ? headers['origin'] : undefined;
  const host =
    (typeof headers['x-forwarded-host'] === 'string' ? headers['x-forwarded-host'] : undefined) ||
    (typeof headers['host'] === 'string' ? headers['host'] : undefined);
  if (!origin || !host) return false;
  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host === host;
  } catch {
    return false;
  }
}
