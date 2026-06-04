import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "SecPlus Scout",
  description:
    "Independent study tool for CompTIA Security+ SY0-701 — acronyms, flashcards, quizzes, and domain reviews. Not affiliated with CompTIA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}