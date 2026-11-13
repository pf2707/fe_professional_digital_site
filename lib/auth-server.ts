// Who is calling an API route. The browser signs in with Firebase
// Authentication (email + password, or Google) and sends its ID token as
// `Authorization: Bearer <token>`; the server verifies it with the Admin SDK.

import "server-only";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "./store";

export type SignedInUser = { uid: string; email: string };

export async function userFrom(req: Request): Promise<SignedInUser | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const app = adminApp();
  if (!token || !app) return null;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? "" };
  } catch {
    return null; // expired, revoked or forged
  }
}

export const signInRequired = () => new Response("Sign in to continue.", { status: 401 });
