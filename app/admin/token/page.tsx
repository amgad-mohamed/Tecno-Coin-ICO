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
    <div className="">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-nunito"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">
          Token Management
        </h1>

        <div className=" bg-thirdBgColor rounded-2xl shadow-lg p-5 sm:p-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Token Contract
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 bg-secondBgColor rounded-lg">
                <span className="font-semibold block">Total Minted</span>
                <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent font-bold text-xl md:text-2xl">
                  {tokenStats.totalMinted.toLocaleString()} NEFE
                </span>
              </div>
              <div className="p-4 bg-secondBgColor rounded-lg">
                <span className="font-semibold block">Current Supply</span>
                <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent font-bold text-xl md:text-2xl">
                  {tokenStats.currentSupply.toLocaleString()} NEFE
                </span>
              </div>
              <div className="p-4 bg-secondBgColor rounded-lg">
                <span className="font-semibold block">Total Burned</span>
                <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent font-bold text-xl md:text-2xl">
                  {tokenStats.totalBurned.toLocaleString()} NEFE
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-secondBgColor" />
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update Token Price
              </h4>
              <label className="block text-sm font-medium">
                Current Price{" "}
                <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent font-bold text-sm">
                  {tokenPriceData
                    ? (Number(tokenPriceData) / 1e6).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })
                    : "0"}{" "}
                  USDT
                </span>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="number"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-fourthBgColor rounded-lg focus:border-transparent dark:bg-[#201409] dark:text-white"
                  step="0.01"
                  min="0"
                  placeholder="Enter token price"
                />
              </div>
              <motion.button
                onClick={handleUpdateTokenPrice}
                disabled={loading}
                className="w-full px-4 py-2 bg-btnColor text-white rounded-lg transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
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
