import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/components.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Commodity Analytics Dashboard",
  description: "Commodity benchmarks, portfolio tools, and market analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={poppins.variable}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
