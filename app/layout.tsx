import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "GNDEC TNP | Placement Drive Manager",
  description:
    "Official Training & Placement Cell recruitment drive management system. Guru Nanak Dev Engineering College, Ludhiana.",
  keywords: ["TNP", "GNDEC", "Placement Drive Manager", "Recruitment", "Prisma", "PostgreSQL", "Next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              &copy; {new Date().getFullYear()} Guru Nanak Dev Engineering College — Training &amp; Placement (TNP) Technical Team.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Built with Next.js App Router, Tailwind CSS, PostgreSQL &amp; Prisma ORM.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
