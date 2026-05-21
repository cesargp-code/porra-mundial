import type { Metadata, Viewport } from "next";
import { Google_Sans } from "next/font/google";

import "./globals.css";

const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Porra Mundial 2026",
  description: "Predicciones de partidos del Mundial 2026 de Poligoneros.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ECECEA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={googleSans.variable}>
      <body>{children}</body>
    </html>
  );
}
