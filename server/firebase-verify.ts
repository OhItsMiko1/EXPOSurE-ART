import { createRemoteJWKSet, jwtVerify } from "jose";

// Verifies a Firebase Auth ID token server-side without needing the full
// Firebase Admin SDK (which would require a service-account credential).
// Firebase ID tokens are RS256-signed JWTs; Google publishes the current
// signing keys for Firebase's token-minting service at this stable JWKS
// endpoint, so the signature, issuer, audience, and expiry can all be
// verified locally.
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;

const JWKS = FIREBASE_PROJECT_ID
  ? createRemoteJWKSet(
      new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
    )
  : null;

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  if (!JWKS || !FIREBASE_PROJECT_ID) {
    throw new Error("Firebase is not configured on the server");
  }

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  });

  if (!payload.sub) {
    throw new Error("Invalid Firebase token: missing subject");
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : undefined,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}
