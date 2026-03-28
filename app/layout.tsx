import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { CartProvider } from "@/components/store/cart-provider";
import { getSiteUrl, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.defaultKeywords],
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
