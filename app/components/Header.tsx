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
      if (pathname === "/") {
        const tokenSaleTop = document.getElementById("token-sale")?.offsetTop ?? Number.POSITIVE_INFINITY;
        const howToBuyTop = document.getElementById("how-to-buy")?.offsetTop ?? Number.POSITIVE_INFINITY;

        // Buffer to account for fixed header height
        const buffer = 80;
        const y = window.scrollY;

        // Determine active section using simple ranges:
        // home: before token-sale
        // token-sale: between token-sale and how-to-buy
        // how-to-buy: after how-to-buy
        let current = "home";
        if (y + buffer >= tokenSaleTop && y + buffer < howToBuyTop) {
          current = "token-sale";
        } else if (y + buffer >= howToBuyTop) {
          current = "how-to-buy";
        }

        setActiveSection(current);
      }
    };

    if (pathname === "/") {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // Map non-home routes to nav item ids; support admin subroutes
      setIsScrolled(window.scrollY > 50);
      if (pathname.startsWith("/admin")) {
        setActiveSection("admin");
      } else if (pathname.startsWith("/transactions")) {
        setActiveSection("transactions");
      } else {
        setActiveSection("home");
      }
    }
  }, [pathname]);

  const navItems: NavItem[] = [
    { name: "Home", href: "/", id: "home" },
    { name: "Token Sale", href: "/#token-sale", id: "token-sale" },
    { name: "How to Buy", href: "/#how-to-buy", id: "how-to-buy" },
    { name: "Transactions", href: "/transactions", id: "transactions" },
    ...(isAdminUser ? [{ name: "Admin", href: "/admin", id: "admin" }] : []),
  ];

  // Smooth-scroll behavior on homepage to avoid refresh
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem
  ) => {
    if (pathname === "/") {
      // On home page, prevent navigation and smooth scroll
      if (item.id === "home") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const target = document.getElementById(item.id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  const handleDisconnect = async () => {
    try {
      await open({ view: "Account" });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <motion.header
      className={`fixed container top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-bgColor backdrop-blur-lg shadow-lg border-b border-white/10"
          : "bg-bgColor "
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <a href="#" className="flex items-center" aria-label="Nefe home">
              <div className="flex flex-col relative items-center w-14 sm:w-16">
                <Image
                  src="/logo.png"
                  alt="Nefe Logo"
                  width={40}
                  height={20}
                  className="w-10 sm:w-13 h-auto"
                />
                <p className="absolute -bottom-1 text-[8px] sm:text-[9px] font-normal">
                  NEFE COIN
                </p>
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
                  activeSection === item.id
                    ? "text-amber-400 font-medium"
                    : "text-white/80 hover:text-white"
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleNavClick(e, item)}
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
                      activeSection === item.id
                        ? "bg-amber-500/10 text-amber-400"
                        : "hover:bg-white/10"
                    }`}
                    onClick={(e) => handleNavClick(e, item)}
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
