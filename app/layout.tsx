import "./globals.css";
import type { Metadata } from "next";
import { Montagu_Slab } from "next/font/google";

// Initialize the Montagu Slab font with semi-bold (600) weight
const montaguSlab = Montagu_Slab({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-montagu-slab",
});

export const metadata: Metadata = {
  title: "Name Spin Wheel",
  description: "A prize wheel app to randomly select names",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montaguSlab.variable}>
      <body>{children}</body>
    </html>
  );
}
