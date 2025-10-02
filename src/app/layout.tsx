// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";
import AuthButtons from "@/frontend/components/ui/AuthButtons";
import DashboardLink from "@/frontend/components/ui/DashboardLink";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <header className="border-b bg-[color:var(--color-sage-dark)]">
            <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
              <Link href="/" className="font-bold text-2xl text-[color:var(--color-sage-light)]">ReviewBoard</Link>
              <div className="flex items-center gap-3 text-sm">
                {typeof window !== "undefined" && window.location.pathname !== "/" && <DashboardLink />}
                <AuthButtons />
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-5xl p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}