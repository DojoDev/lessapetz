import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface AuthPayload extends JWTPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: 'root' | 'admin' | 'customer';
}

export async function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is missing');
    }
    console.warn("Generating ephemeral secret. Instance-isolated!");
    return new TextEncoder().encode('fallback_secret_for_development_only');
  }
  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: AuthPayload) {
  const secret = await getJwtSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<AuthPayload | null> {
  try {
    const secret = await getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as AuthPayload;
  } catch {
    return null;
  }
}
