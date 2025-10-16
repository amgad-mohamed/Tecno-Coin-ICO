import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AppKitProvider } from "./context/appKit";
import { ToastProvider } from "./context/ToastContext";
import ToastDisplay from "./components/ToastDisplay";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Nefe Token ICO",
  description:
    "Join the NEFE Token presale. Buy NEFE with USDT and track transactions, timers, and staking.",
  applicationName: "NEFE Token",
  keywords: [
    "NEFE",
    "Nefe Token",
    "ICO",
    "token presale",
    "USDT",
    "crypto",
    "Ethereum",
    "Sepolia",
  ],
  authors: [{ name: "NEFE" }],
  category: "cryptocurrency",
  themeColor: "#0b1222",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Nefe Token ICO",
    description:
      "Join the NEFE Token presale. Buy NEFE with USDT and track transactions, timers, and staking.",
    siteName: "NEFE Token",
    url: "/",
    images: [{ url: "/logo.png" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nefe Token ICO",
    description:
      "Join the NEFE Token presale. Buy NEFE with USDT and track transactions, timers, and staking.",
    images: ["/logo.png"],
    creator: "@nefe",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${inter.variable} ${nunito.variable} antialiased bg-bgColor text-white`}>
        <AppKitProvider>
          <ToastProvider>
            <Header />
            {children}
            <Footer />
            <ToastDisplay />
          </ToastProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
