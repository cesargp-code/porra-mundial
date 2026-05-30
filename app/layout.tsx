import type { Metadata, Viewport } from "next";
import { Google_Sans } from "next/font/google";
import Image from "next/image";

import { PwaInit } from "@/components/PwaInit";
import "./globals.css";

const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Porra Mundial 2026",
  title: "Porra Mundial 2026",
  description: "Predicciones de partidos del Mundial 2026 de Poligoneros.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Porra 2026",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D8F24A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={googleSans.variable}>
      <body>
        <PwaInit />
        {children}
        <footer className="bottom-logo" aria-label="Porra Mundial">
          <Image src="/img/bottom_logo2.png" alt="" width={667} height={385} />
        </footer>
      </body>
    </html>
  );
}
