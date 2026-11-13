import type { Metadata } from "next";
import Link from "next/link";
import { OwnerSignIn } from "@/components/owner/OwnerSignIn";
import { designById } from "@/lib/designs";
import { listPendingCvs, liveProfile } from "@/lib/cv-store";
import { isOwner, ownerConfigured } from "@/lib/owner-auth";
import { cvPath } from "@/lib/slug";
import { signOutOwner } from "./actions";
import "../scene/admin/admin.css";

export const metadata: Metadata = {
  title: "Pending CVs",
  robots: { index: false, follow: false },
};

// /owner — the site owner signs in (OWNER_EMAIL / OWNER_PASSWORD), sees every
// CV waiting for approval, opens each one in full, and approves it there.
export default async function OwnerPage(props: PageProps<"/owner">) {
  if (!ownerConfigured())
    return (
      <main className="notice">
        <h1>Owner sign-in isn&apos;t set up</h1>
        <p>
          Set <code>OWNER_EMAIL</code> and <code>OWNER_PASSWORD</code> in <code>.env.local</code> and restart the server.
        </p>
      </main>
    );
  if (!(await isOwner())) return <OwnerSignIn />;

  const { approved, missing } = await props.searchParams;
  const cvs = await listPendingCvs();
  const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <main className="publish owner">
      <div className="owner-head">
        <h1>Pending CVs</h1>
        <form action={signOutOwner}>
          <button type="submit" className="ghost">
            Sign out
          </button>
        </form>
      </div>
      {typeof approved === "string" && (
        <p className="owner-flash" role="status">
          Approved. It&apos;s live at <Link href={cvPath(approved)}>{cvPath(approved)}</Link>.
        </p>
      )}
      {typeof missing === "string" && (
        <p className="owner-flash error" role="status">
          {cvPath(missing)} isn&apos;t waiting for approval any more.
        </p>
      )}

      {cvs.length === 0 ? (
        <p className="publish-lede">Nothing is waiting for approval.</p>
      ) : (
        <ul className="owner-list">
          {cvs.map((cv) => {
            const p = liveProfile(cv);
            return (
              <li key={cv.id}>
                <Link href={cvPath(cv.id)}>
                  {p.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatar} alt="" className="avatar-img" />
                  ) : (
                    <span className="avatar-img avatar-initials">{p.initials}</span>
                  )}
                  <span className="owner-cv">
                    <strong>{p.name || "Untitled"}</strong>
                    <span>{p.title}</span>
                    <span>
                      {cvPath(cv.id)} · {designById(p.studio.design).name} · twin {p.twin.enabled === false ? "off" : "on"}
                    </span>
                  </span>
                  <span className="owner-meta">
                    <span>{cv.ownerEmail}</span>
                    <span>Reserved {date(cv.createdAt)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
