import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AppKitProvider } from "./context/appKit";
import { ToastProvider } from "./context/ToastContext";
import ToastDisplay from "./components/ToastDisplay";
import { headers } from "next/headers"; // added

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Platireum Token Presale",
  description:
    "Join our exclusive presale phase and be among the first to acquire MEM tokens.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
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
