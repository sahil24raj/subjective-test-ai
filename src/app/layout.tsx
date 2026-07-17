import type { Metadata } from "next";
import { AppStateProvider } from "../context/AppStateContext";
import { CyberGrid } from "../components/CyberGrid";
import { Navbar } from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subjective Test AI - Professional Subjective Exam Preparation",
  description: "Generate customized subjective tests, practice answer writing in an immersive environment, and receive deep AI reviews and topper writing suggestions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#050816] text-[#f8fafc]">
        <AppStateProvider>
          {/* Neon animated background */}
          <CyberGrid />
          
          {/* Main header navbar */}
          <Navbar />
          
          {/* Page contents */}
          <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </AppStateProvider>
      </body>
    </html>
  );
}


