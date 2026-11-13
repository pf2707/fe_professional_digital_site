import Link from "next/link";

// Placeholder until the landing page is designed.
export default function Home() {
  return (
    <main className="notice">
      <h1>Your CV as a 3D room</h1>
      <p>Every part of your CV becomes an object people can click, with an AI twin that answers questions about you.</p>
      <div className="notice-actions">
        <Link href="/scene" className="btn-solid">
          See a sample CV
        </Link>
        <Link href="/register?next=/scene/admin" className="btn-ghost">
          Make your CV
        </Link>
      </div>
      <p>
        Already have an account? <Link href="/login?next=/scene/admin">Sign in</Link>
      </p>
    </main>
  );
}
