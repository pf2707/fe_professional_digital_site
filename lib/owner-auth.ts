// ─────────────────────────────────────────────────────────────────────────────
//  The site owner's sign-in for /owner, where pending CVs are reviewed and
//  approved. One account, set in the environment (OWNER_EMAIL and
//  OWNER_PASSWORD), separate from customers' Firebase accounts. Signing in
//  sets an httpOnly cookie holding an expiry signed with a key derived from
//  those credentials, so changing the password signs every session out.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "owner_session";
const SESSION_SECONDS = 60 * 60 * 12;

function credentials() {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD;
  return email && password ? { email, password } : null;
}

export const ownerConfigured = () => credentials() !== null;

const digest = (s: string) => createHash("sha256").update(s).digest();
// Compares without leaking where the strings differ.
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

function sign(expires: number) {
  const c = credentials()!;
  return createHmac("sha256", `owner-session:${c.email}:${c.password}`).update(String(expires)).digest("base64url");
}

export function checkOwnerLogin(email: string, password: string) {
  const c = credentials();
  if (!c) return false;
  // Both comparisons always run, so timing doesn't reveal which one failed.
  const emailOk = same(email.trim().toLowerCase(), c.email);
  const passwordOk = same(password, c.password);
  return emailOk && passwordOk;
}

export async function startOwnerSession() {
  const expires = Date.now() + SESSION_SECONDS * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endOwnerSession() {
  (await cookies()).delete(COOKIE);
}

// True when this request comes from the signed-in site owner.
export async function isOwner() {
  if (!ownerConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  const [expires, signature] = value?.split(".") ?? [];
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return same(signature, sign(Number(expires)));
}
