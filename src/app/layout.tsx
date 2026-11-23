import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  themeColor: "#0B57D0",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CloudBox — Lưu trữ đám mây cá nhân",
  description:
    "Không gian lưu trữ cá nhân thông minh, phong cách Material You. Quản lý tệp tin, xem ảnh & video mượt mà.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CloudBox",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={roboto.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
