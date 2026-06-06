import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronicle",
  description: "A journal-style todo frontend for a Rust backend."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
