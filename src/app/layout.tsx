import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "openCal",
  description: "Estima calorías y macros de tu comida a partir de una foto. Self-hosted y open source.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "openCal",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-background pb-24 font-sans text-foreground antialiased">
        <ServiceWorkerRegistration />
        <div className="mx-auto max-w-md">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
