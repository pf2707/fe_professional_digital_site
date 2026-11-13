"use client";

import { useActionState } from "react";
import { signInOwner } from "@/app/owner/actions";

export function OwnerSignIn() {
  const [{ error, email }, action, pending] = useActionState(signInOwner, { error: "", email: "" });
  return (
    <main className="auth">
      <h1>Owner sign-in</h1>
      <p className="auth-lede">Review and approve CVs waiting to go live.</p>
      <form action={action} className="auth-form">
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required defaultValue={email} />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && (
          <p className="f-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="auth-submit" disabled={pending}>
          {pending ? "One moment…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
