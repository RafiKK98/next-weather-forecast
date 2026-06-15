import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather & Forecast App",
  description:
    "A modern, responsive weather forecast application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={lexend.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
