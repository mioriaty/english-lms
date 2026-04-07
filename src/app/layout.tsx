import type { Metadata } from "next";
import { Roboto_Slab, Spectral, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/libs/utils/string";
import { Toaster } from "@/libs/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

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
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body
        className={`${robotoSlab.variable} ${spectral.variable} min-h-screen font-body antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
