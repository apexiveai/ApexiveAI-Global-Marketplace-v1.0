
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ApexiveAI Marketplace | Discover Beyond Limits",
  description:
    "Discover electronics, fine jewelry, and automotive products on ApexiveAI Global Marketplace.",
  applicationName: "ApexiveAI Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
