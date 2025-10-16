import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
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
  title: "Nefe Token Presale",
  description:
    "Join our exclusive presale phase and be among the first to acquire NEFE tokens.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: [
      { url: "/favicon.png", type: "image/png" },
    ],
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
