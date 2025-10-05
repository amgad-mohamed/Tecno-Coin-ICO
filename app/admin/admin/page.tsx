"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import {
  FiUsers,
  FiAlertCircle,
  FiUserPlus,
  FiUserMinus,
  FiCopy,
} from "react-icons/fi";
import { useToastContext } from "@/app/context/ToastContext";
import { useAdminManagerContract } from "@/app/services/useAdminManagerContract";
import { CONTRACT_ADDRESS } from "@/app/utils/web3intraction/constants/contract_address";
import CONTRACT_ABIS from "@/app/utils/web3intraction/constants/contract_abi";
import { formatAddress } from "@/app/utils/formatAddress";

interface AdminOperation {
  type: "add" | "remove";
  address: string;
  timestamp: number;
  status: "pending" | "success" | "failed";
  error?: string;
}

export default function AdminManagement() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { showSuccess, showError, showInfo, showWarning } = useToastContext();

  const [adminList, setAdminList] = useState<string[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [removeAdminAddress, setRemoveAdminAddress] = useState("");
  const [operations, setOperations] = useState<AdminOperation[]>([]);
  const [adminListLoading, setAdminListLoading] = useState(false);

  const {
    addAdmin,
    removeAdmin,
    useAddressExists,
    useGetAdmins,
    addAdminError,
    addAdminPending,
    addAdminConfirmed,
    addAdminHash,
    removeAdminError,
    removeAdminPending,
    removeAdminConfirmed,
    removeAdminHash,
  } = useAdminManagerContract();

  const { data: adminListData } = useGetAdmins();
  const addressExistsResult = useAddressExists(address as `0x${string}`);

  useEffect(() => {
    if (Array.isArray(adminListData) && adminListData.length > 0) {
      setAdminList(adminListData);
    }
  }, [adminListData]);

  useEffect(() => {
    if (address) {
      setIsAdminUser(Boolean(addressExistsResult?.data));
    }
  }, [address, addressExistsResult]);

  useEffect(() => {
    if (addAdminConfirmed && !addAdminPending) {
      const hash = addAdminHash ? `${addAdminHash.slice(0, 10)}...` : "";
      showSuccess(
        "Admin Added Successfully",
        `Admin has been added successfully. Transaction hash: ${hash}. Refreshing admin list...`
      );

      const refetchAdminList = async () => {
        try {
          if (typeof window !== "undefined" && (window as any).ethereum) {
            const provider = new ethers.BrowserProvider(
              (window as any).ethereum
            );
            const adminManagerContract = new ethers.Contract(
              CONTRACT_ADDRESS.ADMIN_MANAGER,
              CONTRACT_ABIS.ADMIN_MANAGER,
              provider
            );
            const newAdminList = await adminManagerContract.getAdmins();
            setAdminList(newAdminList);
          }
        } catch (refetchError) {
          console.error("Failed to refetch admin list:", refetchError);
          showWarning(
            "Admin List Update",
            "Failed to refresh admin list, but admin was added successfully"
          );
        }
      };

      refetchAdminList();
      setNewAdminAddress("");
    }
  }, [
    addAdminConfirmed,
    addAdminPending,
    addAdminHash,
    showSuccess,
    showWarning,
  ]);

  useEffect(() => {
    if (removeAdminConfirmed && !removeAdminPending) {
      const hash = removeAdminHash ? `${removeAdminHash.slice(0, 10)}...` : "";
      showSuccess(
        "Admin Removed Successfully",
        `Admin has been removed successfully. Transaction hash: ${hash}. Refreshing admin list...`
      );

      const refetchAdminList = async () => {
        try {
          if (typeof window !== "undefined" && (window as any).ethereum) {
            const provider = new ethers.BrowserProvider(
              (window as any).ethereum
            );
            const adminManagerContract = new ethers.Contract(
              CONTRACT_ADDRESS.ADMIN_MANAGER,
              CONTRACT_ABIS.ADMIN_MANAGER,
              provider
            );
            const newAdminList = await adminManagerContract.getAdmins();
            setAdminList(newAdminList);
          }
        } catch (refetchError) {
          console.error("Failed to refetch admin list:", refetchError);
          showWarning(
            "Admin List Update",
            "Failed to refresh admin list, but admin was removed successfully"
          );
        }
      };

      refetchAdminList();
      setRemoveAdminAddress("");
    }
  }, [
    removeAdminConfirmed,
    removeAdminPending,
    removeAdminHash,
    showSuccess,
    showWarning,
  ]);

  useEffect(() => {
    if (addAdminError) {
      showError(
        "Admin Addition Failed",
        addAdminError.message || "Failed to add admin"
      );
    }
  }, [addAdminError, showError]);

  useEffect(() => {
    if (removeAdminError) {
      showError(
        "Admin Removal Failed",
        removeAdminError.message || "Failed to remove admin"
      );
    }
  }, [removeAdminError, showError]);

  const handleAddAdmin = useCallback(async () => {
    if (!isConnected || !address || !newAdminAddress) {
      open();
      return;
    }
    try {
      addAdmin(newAdminAddress as `0x${string}`);
      showInfo(
        "Adding Admin",
        "Transaction submitted, waiting for confirmation..."
      );
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add admin";
      setOperations((prev) => [
        ...prev,
        {
          type: "add",
          address: newAdminAddress,
          timestamp: Date.now(),
          status: "failed",
          error: errorMessage,
        },
      ]);
      showError("Admin Addition Failed", errorMessage);
    }
  }, [
    isConnected,
    address,
    newAdminAddress,
    addAdmin,
    open,
    showInfo,
    showError,
  ]);

  const handleRemoveAdmin = useCallback(async () => {
    if (!isConnected || !address || !removeAdminAddress) {
      open();
      return;
    }
    try {
      removeAdmin(removeAdminAddress as `0x${string}`);
      showInfo(
        "Removing Admin",
        "Transaction submitted, waiting for confirmation..."
      );
    } catch (error: any) {
      const errorMessage = error.message || "Failed to remove admin";
      setOperations((prev) => [
        ...prev,
        {
          type: "remove",
          address: removeAdminAddress,
          timestamp: Date.now(),
          status: "failed",
          error: errorMessage,
        },
      ]);
      showError("Admin Removal Failed", errorMessage);
    }
  }, [
    isConnected,
    address,
    removeAdminAddress,
    removeAdmin,
    open,
    showInfo,
    showError,
  ]);

  const handleRefreshAdminList = useCallback(async () => {
    setAdminListLoading(true);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const adminManagerContract = new ethers.Contract(
          CONTRACT_ADDRESS.ADMIN_MANAGER,
          CONTRACT_ABIS.ADMIN_MANAGER,
          provider
        );
        const newAdminList = await adminManagerContract.getAdmins();
        setAdminList(newAdminList);
        showSuccess(
          "Admin List Refreshed",
          "Admin list has been updated successfully"
        );
      }
    } catch (error) {
      console.error("Failed to refresh admin list:", error);
      showError("Refresh Failed", "Failed to refresh admin list");
    } finally {
      setAdminListLoading(false);
    }
  }, [showSuccess, showError]);

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      showSuccess("Copied", `Address ${address} copied to clipboard`);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* <main className="flex-1 p-4 sm:p-6 lg:p-8"> */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-gray-900 dark:text-white">
          Admin Management
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Admin Manager
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add New Admin
                </label>
                <input
                  type="text"
                  value={newAdminAddress}
                  onChange={(e) => setNewAdminAddress(e.target.value)}
                  placeholder="Enter admin address"
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                />
                <motion.button
                  onClick={handleAddAdmin}
                  disabled={addAdminPending || !newAdminAddress}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {addAdminPending ? "Adding..." : "Add Admin"}
                </motion.button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remove Admin
                </label>
                <input
                  type="text"
                  value={removeAdminAddress}
                  onChange={(e) => setRemoveAdminAddress(e.target.value)}
                  placeholder="Enter admin address to remove"
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                />
                <motion.button
                  onClick={handleRemoveAdmin}
                  disabled={removeAdminPending || !removeAdminAddress}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {removeAdminPending ? "Removing..." : "Remove Admin"}
                </motion.button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700" />

            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Current Admins
              </h4>
              <motion.button
                onClick={handleRefreshAdminList}
                disabled={adminListLoading}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {adminListLoading ? "Refreshing..." : "Refresh"}
              </motion.button>
            </div>

            <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto touch-auto">
              {adminListLoading ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Refreshing admin list...
                </div>
              ) : adminList.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  No admins found
                </div>
              ) : (
                adminList.map((admin, index) => (
                  <div
                    key={index}
                    className="w-full p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    <span className="truncate max-w-[80%] sm:max-w-[90%] sm:hidden">
                      {formatAddress(admin)}
                    </span>
                    <span className="truncate max-w-[80%] sm:max-w-[90%] hidden sm:block">
                      {admin}
                    </span>
                    <button
                      onClick={() => handleCopy(admin)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>{" "}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* {operations.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Operation Log
              </h4>
              <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto touch-auto">
                {operations.map((op, index) => (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-lg text-sm flex items-center gap-2 sm:gap-3 ${
                      op.status === "success"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {op.status === "success" ? (
                      <FiUserPlus className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <FiUserMinus className="text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm sm:text-base">
                        {op.type === "add" ? "Added" : "Removed"} admin:{" "}
                        <span className="truncate">{op.address}</span>
                      </p>
                      {op.error && (
                        <p className="text-xs sm:text-sm">Error: {op.error}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(op.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </motion.div>
      {/* </main> */}
    </div>
  );
}
