import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevisBTP - Gestion devis et factures",
  description: "Application de gestion de devis et factures pour artisans du BTP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex">
        {children}
      </body>
    </html>
  );
}