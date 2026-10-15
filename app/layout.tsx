import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hand-Embroidered One-Piece Dress | A&A Fashion Boutique",
  description:
    "Shop a cool, comfortable and stretchable hand-embroidered one-piece dress from A&A Fashion Boutique. Cash on Delivery available.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Hand-Embroidered One-Piece Dress",
    description: "Easy elegance, delicate handwork, and all-day comfort.",
    images: ["/products/one-piece-full.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
