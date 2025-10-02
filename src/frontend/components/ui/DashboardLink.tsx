"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function DashboardLink() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  // Oturum yoksa veya yükleniyor durumundaysa veya auth sayfalarındaysa gösterme
  if (
    status !== "authenticated" || 
    !session || 
    pathname?.startsWith("/auth/")
  ) {
    return null;
  }
  
  return (
    <Link href="/dashboard" className="btn btn-secondary hover:scale-110">
      Dashboard
    </Link>
  );
}
