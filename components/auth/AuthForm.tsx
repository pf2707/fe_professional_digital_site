"use client";

// /login and /register: email + password, or Google.

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { clientAuth, firebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "register";

// Firebase error codes → what to tell the person.
function explain(err: unknown) {
  const code = (err as { code?: string }).code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match an account.";
    case "auth/email-already-in-use":
      return "There's already an account with this email. Sign in instead.";
    case "auth/weak-password":
      return "Use a password of at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like an email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes, or reset your password.";
    case "auth/operation-not-allowed":
      return "This way of signing in isn't turned on yet.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups for this site and try again.";
    case "auth/network-request-failed":
      return "Couldn't reach the sign-in service. Check your connection.";
    default:
      return "Something went wrong. Try again.";
  }
}

const QUIET = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const dest = next?.startsWith("/") && !next.startsWith("//") ? next : "/scene/admin";
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Signed in (just now, or already): carry on to where they were going.
  useEffect(() => {
    if (!loading && user) router.replace(dest);
  }, [loading, user, dest, router]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await action();
    } catch (e) {
      if (!QUIET.has((e as { code?: string }).code ?? "")) setError(explain(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() =>
      mode === "register"
        ? createUserWithEmailAndPassword(clientAuth(), email.trim(), password)
        : signInWithEmailAndPassword(clientAuth(), email.trim(), password),
    );
  };

  const google = () => run(() => signInWithPopup(clientAuth(), new GoogleAuthProvider()));

  const reset = () => {
    if (!email.trim()) return setError("Enter your email above first, then choose “Forgot password?”.");
    run(async () => {
      await sendPasswordResetEmail(clientAuth(), email.trim());
      setInfo(`We sent a link to reset your password to ${email.trim()}.`);
    });
  };

  const other = `${mode === "login" ? "/register" : "/login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  if (!firebaseConfigured)
    return (
      <main className="notice">
        <h1>Sign-in isn&apos;t set up yet</h1>
        <p>
          Add the Firebase web app config (the <code>NEXT_PUBLIC_FIREBASE_*</code> values) to <code>.env.local</code> and restart
          the server.
        </p>
      </main>
    );

  return (
    <main className="auth">
      <Link href="/" className="auth-home">
        3D CV
      </Link>
      <h1>{mode === "login" ? "Sign in" : "Create your account"}</h1>
      <p className="auth-lede">
        {mode === "login" ? "Sign in to edit and publish your CV." : "An account keeps your CV safe and lets you edit it from any device."}
      </p>

      <button type="button" className="auth-google" onClick={google} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continue with Google
      </button>

      <p className="auth-or">or with email</p>

      <form onSubmit={submit} className="auth-form">
        <label>
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {mode === "login" && (
          <button type="button" className="auth-link" onClick={reset} disabled={busy}>
            Forgot password?
          </button>
        )}
        {error && (
          <p className="f-error" role="alert">
            {error}
          </p>
        )}
        {info && <p className="auth-info">{info}</p>}
        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link href={other}>{mode === "login" ? "Create an account" : "Sign in"}</Link>
      </p>
    </main>
  );
}
