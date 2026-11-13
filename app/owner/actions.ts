"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveCv, setCvTwin } from "@/lib/cv-store";
import { checkOwnerLogin, endOwnerSession, isOwner, startOwnerSession } from "@/lib/owner-auth";
import { cvPath } from "@/lib/slug";

export type SignInState = { error: string; email: string };

export async function signInOwner(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "");
  if (!checkOwnerLogin(email, String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // slows down password guessing
    // The form resets after a submit; hand the email back so it stays filled in.
    return { error: "That email and password don't match the owner account.", email };
  }
  await startOwnerSession();
  redirect("/owner");
}

export async function signOutOwner() {
  await endOwnerSession();
  redirect("/owner");
}

export async function approve(slug: string) {
  if (!(await isOwner())) redirect("/owner");
  const ok = await approveCv(slug);
  revalidatePath("/owner");
  revalidatePath(cvPath(slug));
  redirect(`/owner?${ok ? "approved" : "missing"}=${encodeURIComponent(slug)}`);
}

export async function setTwin(slug: string, enabled: boolean) {
  if (!(await isOwner())) redirect("/owner");
  await setCvTwin(slug, enabled);
  revalidatePath("/owner");
  revalidatePath(cvPath(slug));
}
