// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Link from "next/link";


export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Welcome to ReviewBoard</h1>
      {session ? (
        <p>
          Signed in as <strong>{session.user?.email ?? session.user?.name}</strong>{" "}
          — <a className="underline" href="/api/auth/signout">Sign out</a>
          
        </p>
      ) : (
        <p>
          Please{" "}
          <a className="underline" href="/api/auth/signin">Sign in</a>
          {" "}to continue.
        </p>
      )}
    </div>
  );
}
