
'use server';

import { headers } from 'next/headers';
import * as jose from 'jose';

// The following is a simplified example of how you might get the user ID
// from an Authorization header. In a production app, you would want to
// use a more robust solution that caches the JWKS and handles errors more gracefully.

// Fetch the public keys from Google's certs endpoint
async function getGooglePublicKeys(): Promise<jose.JSONWebKeySet> {
    const response = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    if (!response.ok) {
        throw new Error('Failed to fetch Google public keys');
    }
    return response.json();
}

/**
 * Gets the authenticated user's ID (UID) from the Authorization header
 * sent by the Firebase client.
 *
 * This function is for use in Next.js Server Actions and Route Handlers.
 * It verifies the ID token and returns the UID.
 *
 * @returns {Promise<string | null>} The user's ID or null if not authenticated.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const authorization = headers().get('Authorization');
  if (!authorization) {
    return null;
  }

  const token = authorization.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const jwks = await getGooglePublicKeys();
    const { payload } = await jose.jwtVerify(token, jose.createLocalJWKSet(jwks), {
        issuer: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
        audience: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    return payload.sub ?? null;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
