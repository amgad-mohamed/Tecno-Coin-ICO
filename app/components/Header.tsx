"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { BiWallet } from "react-icons/bi";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useAdminManagerContract } from "@/app/services/useAdminManagerContract";
import { formatAddress } from "@/app/utils/formatAddress";

interface NavItem {
  name: string;
  href: string;
  id: string;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAppKitAccount();
  const { useAddressExists } = useAdminManagerContract();
  const addressExistsResult = useAddressExists(address as `0x${string}`);
  const isAdminUser = Boolean(address && addressExistsResult?.data);
  const { open } = useAppKit();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Only detect sections if we're on the home page
      if (pathname === "/") {
        const sections = {
          home: 0,
          "token-sale": document.getElementById("token-sale")?.offsetTop || 0,
          "how-to-buy": document.getElementById("how-to-buy")?.offsetTop || 0,
        };

        const currentPosition = window.scrollY + window.innerHeight / 3;

        let current = "home";
        Object.entries(sections).forEach(([key, value]) => {
          if (currentPosition >= value) {
            current = key;
          }
        });

        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navItems: NavItem[] = [
    { name: "Home", href: "/", id: "home" },
    { name: "Token Sale", href: "/#token-sale", id: "token-sale" },
    { name: "How to Buy", href: "/#how-to-buy", id: "how-to-buy" },
    { name: "Transactions", href: "/transactions", id: "transactions" },
    ...(isAdminUser ? [{ name: "Admin", href: "/admin", id: "admin" }] : []),
  ];

  const handleDisconnect = async () => {
    try {
      await open({ view: "Account" });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-lg shadow-lg border-b border-white/10"
          : "bg-black/70 border-b border-white/10"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <a
              href="#"
              className="flex items-center"
              aria-label="Platireum home"
            >
              <div className="flex flex-col relative w-20 items-center">
                <Image
                  src="/logo.png"
                  alt="Platireum Logo"
                  width={40}
                  height={20}
                  className="w-28 sm:w-32 md:w-auto h-auto"
                />
                <p className="absolute -bottom-1 text-[9px] font-normal">NEFE COIN</p>
              </div>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 transition-colors text-sm lg:text-base ${
                  (pathname === "/" && activeSection === item.id) ||
                  (!item.href.includes("#") && pathname === item.href)
                    ? "text-amber-400 font-medium"
                    : "text-white/80 hover:text-white"
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{item.name}</span>
              </motion.a>
            ))}
          </nav>

          <motion.div
            className="flex items-center space-x-3 sm:space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isConnected ? (
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <span className="text-xs lg:text-sm text-white/70">
                  {address ? formatAddress(address) : ""}
                </span>
                <motion.button
                  onClick={handleDisconnect}
                  className="px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Disconnect
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => open()}
                className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-all duration-300 bg-primary text-white hover:bg-primary/90 text-xs lg:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BiWallet className="text-lg lg:text-xl" />
                <span className="font-medium">Connect Wallet</span>
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FiX className="text-2xl" />
              ) : (
                <FiMenu className="text-2xl" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="md:hidden overflow-hidden bg-black border-t border-white/10 rounded-md p-4">
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      (pathname === "/" && activeSection === item.id) ||
                      (!item.href.includes("#") && pathname === item.href)
                        ? "bg-amber-500/10 text-amber-400"
                        : "hover:bg-white/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm">{item.name}</span>
                  </a>
                ))}
                {isConnected ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-white/80">
                      {address ? formatAddress(address) : ""}
                    </span>
                    <motion.button
                      onClick={handleDisconnect}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => open()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 bg-primary text-white hover:bg-primary/90"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BiWallet className="text-xl" />
                    <span className="text-sm font-medium">Connect Wallet</span>
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
