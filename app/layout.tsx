import "./globals.css";
import type { Metadata } from "next";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
