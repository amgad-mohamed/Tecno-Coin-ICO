"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import { useTokenContract } from "../../services/useTokenContract";
import { useICOContract } from "../../services/useICOContract";
import { useToastContext } from "../../context/ToastContext";
import { postPriceChange } from "@/lib/api";

interface TokenStats {
  totalMinted: number;
  currentSupply: number;
  totalBurned: number;
}

export default function TokenManagement() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { showSuccess, showError, showInfo } = useToastContext();

  // State management
  const [tokenPrice, setTokenPrice] = useState("0");
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    totalMinted: 0,
    currentSupply: 0,
    totalBurned: 0,
  });
  const [loading, setLoading] = useState(false);
  // Contract hooks
  const { useGetTokenStats, useTotalSupply, useBalanceOf, useAllowance } =
    useTokenContract();

  const {
    useGgetTokenPrice,
    updateTokenPrice: updateICOPrice,
    error: updateTokenPriceError,
    isPending: updateTokenPending,
    isConfirmed,
  } = useICOContract();

  const { data: tokenStatsData } = useGetTokenStats();
  const { data: tokenPriceData } = useGgetTokenPrice();
  // Effects
  useEffect(() => {
    if (Array.isArray(tokenStatsData) && tokenStatsData.length === 3) {
      setTokenStats({
        totalMinted: Number(tokenStatsData[0]),
        currentSupply: Number(tokenStatsData[1]) / 1e18,
        totalBurned: Number(tokenStatsData[2]),
      });
    }
  }, [tokenStatsData]);

  // Event handlers
  const [pendingPriceToPersist, setPendingPriceToPersist] = useState<
    string | null
  >(null);
  const [hasPostedPrice, setHasPostedPrice] = useState(false);

  useEffect(() => {
    const persistPriceIfConfirmed = async () => {
      if (isConfirmed && pendingPriceToPersist && !hasPostedPrice) {
        try {
          await postPriceChange({
            token: "MEM",
            price: parseFloat(pendingPriceToPersist),
          });
          setHasPostedPrice(true);
          showSuccess("Price Saved", "New price was saved to the database");
        } catch (e) {
          console.error("Failed to persist price change:", e);
        } finally {
          setPendingPriceToPersist(null);
        }
      }
    };
    void persistPriceIfConfirmed();
  }, [isConfirmed, pendingPriceToPersist, hasPostedPrice, showSuccess]);
  const handleUpdateTokenPrice = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading(true);
    try {
      await updateICOPrice(ethers.parseUnits(tokenPrice, 6));
      showInfo("Price Update", "Token price update transaction submitted");
      setPendingPriceToPersist(tokenPrice);
      setHasPostedPrice(false);
    } catch (error) {
      console.error("Error updating token price:", error);
      showError("Price Update Failed", "Failed to update token price");
    } finally {
      setLoading(false);
    }
  }, [
    isConnected,
    address,
    tokenPrice,
    updateICOPrice,
    open,
    showInfo,
    showError,
  ]);

  return (
    <div className="p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">
          Token Management
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Token Contract
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 block text-sm">
                  Total Minted
                </span>
                <span className="font-semibold text-lg">
                  {tokenStats.totalMinted.toLocaleString()} MEM
                </span>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 block text-sm">
                  Current Supply
                </span>
                <span className="font-semibold text-lg">
                  {tokenStats.currentSupply.toLocaleString()} MEM
                </span>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 block text-sm">
                  Total Burned
                </span>
                <span className="font-semibold text-lg">
                  {tokenStats.totalBurned.toLocaleString()} MEM
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Token Price
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Price{" "}
                  {tokenPriceData
                    ? (Number(tokenPriceData) / 1e6).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })
                    : "0"}{" "}
                  (USDT)
                </label>

                <input
                  type="number"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  step="0.01"
                  min="0"
                  placeholder="Enter token price"
                />
              </div>
              <motion.button
                onClick={handleUpdateTokenPrice}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? "Updating..." : "Update Price"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
