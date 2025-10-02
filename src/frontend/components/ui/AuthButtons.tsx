// src/components/AuthButtons.tsx
"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until component is mounted to avoid hydration mismatch
  if (!mounted || status === "loading") return null;

  return session ? (
    <button 
      className="btn btn-primary hover:scale-110 flex items-center gap-2" 
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <span>Sign out</span>
      {session.user?.name && (
        <span className="text-xs opacity-80">({session.user.name})</span>
      )}
    </button>
  ) : (
    <button className="btn btn-secondary hover:scale-110" onClick={() => signIn()}>
      Sign in
    </button>
  );
}
