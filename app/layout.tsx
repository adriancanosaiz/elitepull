import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { CartProvider } from "@/components/store/cart-provider";

export const metadata: Metadata = {
  title: "ElitePull | Premium TCG Store",
  description:
    "Frontend premium para una tienda de cartas coleccionables y accesorios en Next.js.",
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
