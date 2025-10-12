"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useRouter, usePathname } from "next/navigation";
import {
  FiSettings,
  FiUsers,
  FiDollarSign,
  FiList,
  FiAlertCircle,
  FiClock,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useAdminManagerContract } from "../services/useAdminManagerContract";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State management
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Contract hooks
  const { useAddressExists } = useAdminManagerContract();
  const addressExistsResult = useAddressExists(address as `0x${string}`);

  // Effects
  useEffect(() => {
    if (address) {
      setIsAdminUser(Boolean(addressExistsResult?.data));
    }
  }, [address, addressExistsResult]);

  const adminSections = [
    {
      title: "ICO Management",
      description: "Manage ICO status, pause/resume, and withdraw funds",
      icon: <FiDollarSign className="text-xl" />,
      href: "/admin",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
    },
    {
      title: "Token Management",
      description: "View token statistics and update token price",
      icon: <FiList className="text-xl" />,
      href: "/admin/token",
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
    },
    {
      title: "Staking Management",
      description: "Manage staking contracts and release schedules",
      icon: <FiSettings className="text-xl" />,
      href: "/admin/staking",
      color: "from-amber-600 to-yellow-600",
      hoverColor: "from-amber-700 to-yellow-700",
    },
    {
      title: "Admin Management",
      description: "Add or remove admin users and manage permissions",
      icon: <FiUsers className="text-xl" />,
      href: "/admin/admin",
      color: "from-red-500 to-red-600",
      hoverColor: "from-red-600 to-red-700",
    },
    {
      title: "Timers Management",
      description: "Create and manage countdown timers for events",
      icon: <FiClock className="text-xl" />,
      href: "/admin/timers",
      color: "from-orange-500 to-orange-600",
      hoverColor: "from-orange-600 to-orange-700",
    },
    {
      title: "Transactions Management",
      description: "View and manage transactions",
      icon: <FiList className="text-xl" />,
      href: "/admin/transactions",
      color: "from-orange-500 to-orange-600",
      hoverColor: "from-orange-600 to-orange-700",
    },
  ];

  // Function to handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false); // Close sidebar after navigation
  };

  // Early returns for authentication
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bgColor mt-[84px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md w-full bg-secondBgColor rounded-2xl shadow-xl p-8 border border-bgColor/60"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <FiAlertCircle className="text-amber-400 text-4xl" />
            <h2 className="text-2xl font-bold text-white">
              Wallet Connection Required
            </h2>
          </div>
          <p className="text-white/70 mb-8 text-lg">
            Please connect your wallet to access the admin dashboard.
          </p>
          <motion.button
            onClick={() => open()}
            className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bgColor mt-[84px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md w-full bg-secondBgColor rounded-2xl shadow-xl p-8 border border-bgColor/60"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <FiAlertCircle className="text-amber-400 text-4xl" />
            <h2 className="text-2xl font-bold text-white">
              Admin Access Required
            </h2>
          </div>
          <p className="text-white/70 mb-8 text-lg">
            Your connected wallet does not have admin privileges. Please connect
            with an admin wallet.
          </p>
          <motion.button
            onClick={() => open()}
            className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Admin Wallet
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgColor flex mt-[84px] font-nunito">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 md:z-20 w-[260px] sm:w-[280px] lg:w-[290px] bg-thirdBgColor p-5 sm:p-6 border-r border-bgColor/60 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <FiSettings className="text-amber-400" /> Admin Dashboard
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <FiX className="text-white/70" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {adminSections.map((section) => {
            const isActive = pathname === section.href;
            return (
              <motion.button
                key={section.title}
                onClick={() => handleNavigation(section.href)}
                className={`w-full flex items-center gap-2 px-3 sm:px-3 text-sm md:text-base py-4 rounded-lg transition-colors ${
                  isActive
                    ? "bg-btnColor"
                    : "border-bgColor/60 bg-fourthBgColor"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {section.icon}
                {section.title}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-secondBgColor border-b border-bgColor/60 p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <FiMenu className="text-white/70 text-xl" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto ml-5 md:ml-10 mr-5 md:mr-24 my-5">{children}</div>
      </main>
    </div>
  );
}
