import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maya Allan – Guide to Psilocybin Integration",
  description:
    "Guide to Psilocybin Integration – 40 Real Scenarios for Navigating What You See, Feel & Experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased font-serif">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wide font-semibold">
          MAYA ALLAN
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/books" className="hover:opacity-70">
            Books
          </Link>
          <Link href="/articles" className="hover:opacity-70">
            Articles
          </Link>
          <Link href="/events" className="hover:opacity-70">
            Events
          </Link>
          <Link href="/media" className="hover:opacity-70">
            Media
          </Link>
          <Link href="/about" className="hover:opacity-70">
            About
          </Link>
          <Link href="/contact" className="hover:opacity-70">
            Contact
          </Link>
          <Link href="/legal" className="hover:opacity-70">
            Legal
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Maya Allan. Informational only. No medical,
          legal or therapeutic advice.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span>in</span>
            <span>LinkedIn</span>
          </span>
          <span className="flex items-center gap-1">
            <span>▢</span>
            <span>Instagram</span>
          </span>
          <span className="flex items-center gap-1">
            <span>▶</span>
            <span>YouTube</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
