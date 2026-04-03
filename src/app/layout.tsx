import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "StyleMirror AR – AI Fashion Try-On",
  description: "Try clothes in augmented reality with AI-powered body modeling and personalized style recommendations.",
  keywords: ["fashion", "AR", "try-on", "AI styling", "virtual fitting room"],
  openGraph: {
    title: "StyleMirror AR",
    description: "Try Before You Buy – In Augmented Reality",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080810] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
