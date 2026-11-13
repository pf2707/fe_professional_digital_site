import Link from "next/link";

// Shown at /<slug> while a CV waits for the owner's approval.
export function PendingCv() {
  return (
    <main className="notice">
      <h1>This CV isn&apos;t live yet</h1>
      <p>Its owner has reserved this address. The CV appears here as soon as it&apos;s approved.</p>
      <Link href="/" className="btn-solid">
        Go to the home page
      </Link>
    </main>
  );
}
