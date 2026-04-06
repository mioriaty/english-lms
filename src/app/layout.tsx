import type { Metadata } from "next";
import { Roboto_Slab, Spectral } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const robotoSlab = Roboto_Slab({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "English LMS",
  description: "Solo teacher — multiple choice & fill-in-the-blank assignments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoSlab.variable} ${spectral.variable} min-h-screen font-body antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
