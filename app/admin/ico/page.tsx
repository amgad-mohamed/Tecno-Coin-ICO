"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { ethers } from "ethers";
import { 
  FiDollarSign, 
  FiAlertCircle, 
  FiRefreshCw, 
  FiPause, 
  FiPlay,
  FiArrowUp,
  FiArrowDown,
  FiInfo,
  FiExternalLink
} from "react-icons/fi";
import { useICOContract } from "../../services/useICOContract";
import { fromTokenUnits } from "../../helpers/format";
import { useToastContext } from "../../context/ToastContext";
import { CONTRACT_ADDRESS } from "../../utils/web3intraction/constants/contract_address";

export default function ICOManagement() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { showSuccess, showError, showInfo, showWarning } = useToastContext();

  // State management
  const [tokenPrice, setTokenPrice] = useState("0.1");
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState({
    priceUpdate: false,
    pauseToggle: false,
    withdrawETH: false,
    withdrawUSDT: false,
    refreshing: false
  });
  const [priceHistory, setPriceHistory] = useState<{timestamp: number, price: string}[]>([]);
  const [showPriceInput, setShowPriceInput] = useState(false);

  // Contract hooks
  const {
    useGgetTokenPrice,
    useGetPauseStatus,
    updateTokenPrice: updateICOPrice,
    pause,
    withdrawFunds,
    withdrawETH,
    useGetTokenBalance,
    useGetUSDTBalance,
    useGetETHBalance,
    error: updateTokenPriceError,
    isPending: updateTokenPending,
    isConfirmed: ICOConfirmed,
  } = useICOContract();

  const { data: tokenPriceData, refetch: refetchTokenPrice } = useGgetTokenPrice();
  const { data: pauseStatusData, refetch: refetchPauseStatus } = useGetPauseStatus();
  const { data: icoTokenBal, refetch: refetchTokenBalance } = useGetTokenBalance();
  const { data: icoUSDTBal, refetch: refetchUSDTBalance } = useGetUSDTBalance();
  const { data: icoETHBal, refetch: refetchETHBalance } = useGetETHBalance();

  const TOKEN_PRICE_USD = tokenPriceData
    ? fromTokenUnits(BigInt(tokenPriceData as bigint), 6)
    : "0";

  // Effects
  useEffect(() => {
    if (TOKEN_PRICE_USD && TOKEN_PRICE_USD !== tokenPrice) {
      setTokenPrice(TOKEN_PRICE_USD);
      setPriceHistory(prev => [
        { timestamp: Date.now(), price: TOKEN_PRICE_USD },
        ...prev.slice(0, 4)
      ]);
    }
  }, [TOKEN_PRICE_USD, tokenPrice]);

  useEffect(() => {
    if (pauseStatusData !== undefined) {
      setIsPaused(Boolean(pauseStatusData));
    }
  }, [pauseStatusData]);

  useEffect(() => {
    if (ICOConfirmed) {
      const refreshPauseStatus = async () => {
        try {
          if (typeof window !== "undefined" && (window as any).ethereum) {
            const provider = new ethers.BrowserProvider(
              (window as any).ethereum
            );
            const icoContract = new ethers.Contract(
              CONTRACT_ADDRESS.ICO_CONTRACT,
              ["function paused() view returns (bool)"],
              provider
            );
            const newPauseStatus = await icoContract.paused();
            setIsPaused(Boolean(newPauseStatus));
            showSuccess(
              "ICO Status Updated",
              "Pause status has been refreshed"
            );
          }
        } catch (error) {
          console.error("Failed to refresh pause status:", error);
          showWarning("Status Update", "Failed to refresh pause status");
        }
      };

      refreshPauseStatus();
    }
  }, [ICOConfirmed, showSuccess, showWarning]);

  const refreshAllData = useCallback(async () => {
    setLoading(prev => ({ ...prev, refreshing: true }));
    try {
      await Promise.all([
        refetchTokenPrice(),
        refetchPauseStatus(),
        refetchTokenBalance(),
        refetchUSDTBalance(),
        refetchETHBalance()
      ]);
      showSuccess("Data Refreshed", "All data has been updated");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      showError("Refresh Failed", "Failed to refresh data");
    } finally {
      setLoading(prev => ({ ...prev, refreshing: false }));
    }
  }, [
    refetchTokenPrice, 
    refetchPauseStatus, 
    refetchTokenBalance, 
    refetchUSDTBalance, 
    refetchETHBalance,
    showSuccess,
    showError
  ]);

  const handleUpdateTokenPrice = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading(prev => ({ ...prev, priceUpdate: true }));
    try {
      await updateICOPrice(ethers.parseUnits(tokenPrice, 6));
      showInfo("Price Update", "Token price update transaction submitted");
      setShowPriceInput(false);
    } catch (error) {
      console.error("Error updating token price:", error);
      showError("Price Update Failed", "Failed to update token price");
    } finally {
      setLoading(prev => ({ ...prev, priceUpdate: false }));
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

  const handleTogglePause = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading(prev => ({ ...prev, pauseToggle: true }));
    try {
      await pause(!isPaused);
      showInfo("Pause Toggle", `${isPaused ? "Resuming" : "Pausing"} ICO...`);
    } catch (error) {
      console.error("Error toggling pause status:", error);
      showError("Pause Toggle Failed", "Failed to toggle ICO pause status");
    } finally {
      setLoading(prev => ({ ...prev, pauseToggle: false }));
    }
  }, [isConnected, address, isPaused, pause, open, showInfo, showError]);

  const handleWithdrawETH = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading(prev => ({ ...prev, withdrawETH: true }));
    try {
      if (icoETHBal && Number(icoETHBal) > 0) {
        await withdrawETH(icoETHBal);
        showSuccess("ETH Withdrawn", "ETH has been withdrawn successfully");
        refetchETHBalance();
      } else {
        showWarning("No ETH to Withdraw", "No ETH available for withdrawal");
      }
    } catch (error) {
      console.error("Failed to withdraw ETH:", error);
      showError(
        "ETH Withdrawal Failed",
        "Failed to withdraw ETH from contract"
      );
    } finally {
      setLoading(prev => ({ ...prev, withdrawETH: false }));
    }
  }, [
    withdrawETH,
    icoETHBal,
    isConnected,
    address,
    open,
    showSuccess,
    showError,
    showWarning,
    refetchETHBalance
  ]);

  const handleWithdrawUSDT = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading(prev => ({ ...prev, withdrawUSDT: true }));
    try {
      if (icoUSDTBal && Number(icoUSDTBal) > 0) {
        await withdrawFunds(icoUSDTBal);
        showSuccess("USDT Withdrawn", "USDT has been withdrawn successfully");
        refetchUSDTBalance();
      } else {
        showWarning("No USDT to Withdraw", "No USDT available for withdrawal");
      }
    } catch (error) {
      console.error("Failed to withdraw USDT:", error);
      showError(
        "USDT Withdrawal Failed",
        "Failed to withdraw USDT from contract"
      );
    } finally {
      setLoading(prev => ({ ...prev, withdrawUSDT: false }));
    }
  }, [
    withdrawFunds,
    icoUSDTBal,
    isConnected,
    address,
    open,
    showSuccess,
    showError,
    showWarning,
    refetchUSDTBalance
  ]);

  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return "0";
    return (Number(balance) / 10 ** decimals).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals === 6 ? 2 : 4
    });
  };

  const priceChangePercentage = priceHistory.length > 1 
    ? ((parseFloat(priceHistory[0].price) - parseFloat(priceHistory[1].price)) / parseFloat(priceHistory[1].price)) * 100
    : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with refresh button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            ICO Management
          </h1>
          
          <motion.button
            onClick={refreshAllData}
            onTouchStart={refreshAllData}
            disabled={loading.refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw className={`${loading.refreshing ? "animate-spin" : ""} text-lg`} />
            Refresh Data
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
          {/* Left column - Token Price & Status */}
          <div className="md:col-span-2 space-y-4 md:space-y-6">
            {/* Token Price Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Token Price
                </h3>
                
                <div className="flex items-center gap-3">
                  {priceHistory.length > 1 && (
                    <span className={`flex items-center text-sm font-medium ${
                      priceChangePercentage >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {priceChangePercentage >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                      {Math.abs(priceChangePercentage).toFixed(2)}%
                    </span>
                  )}
               
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {showPriceInput ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={tokenPrice}
                        onChange={(e) => setTokenPrice(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-h-[44px]"
                        placeholder="Enter new token price"
                      />
                      <motion.button
                        onClick={handleUpdateTokenPrice}
                        onTouchStart={handleUpdateTokenPrice}
                        disabled={loading.priceUpdate}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm min-h-[44px] touch-manipulation"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {loading.priceUpdate ? "Updating..." : "Update"}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2 mb-4"
                  >
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      ${tokenPrice}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">per token</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {priceHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Recent Price History
                  </h4>
                  <div className="space-y-2">
                    {priceHistory.slice(0, 3).map((entry, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-medium">${entry.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ICO Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ICO Status
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isPaused ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                    {isPaused ? (
                      <FiPause className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
                    ) : (
                      <FiPlay className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 block text-xs sm:text-sm">
                      Current Status
                    </span>
                    <span
                      className={`font-semibold text-lg sm:text-xl ${
                        isPaused
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {isPaused ? "PAUSED" : "ACTIVE"}
                    </span>
                  </div>
                </div>
                
                <motion.button
                  onClick={handleTogglePause}
                  onTouchStart={handleTogglePause}
                  disabled={loading.pauseToggle}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation ${
                    isPaused
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  } disabled:opacity-50`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading.pauseToggle ? (
                    <FiRefreshCw className="animate-spin text-lg" />
                  ) : isPaused ? (
                    <FiPlay className="text-lg" />
                  ) : (
                    <FiPause className="text-lg" />
                  )}
                  {loading.pauseToggle
                    ? "Processing..."
                    : isPaused
                    ? "Resume ICO"
                    : "Pause ICO"}
                </motion.button>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {isPaused 
                      ? "ICO is currently paused. No purchases can be made until resumed." 
                      : "ICO is active. Users can purchase tokens using ETH or USDT."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Balances & Withdrawals */}
          <div className="space-y-4 md:space-y-6">
            {/* Balances Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Contract Balances
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                      Token Balance
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">PLT</span>
                  </div>
                  <span className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-white">
                    {formatBalance(icoTokenBal as bigint)}
                  </span>
                </div>
                
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                      ETH Balance
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ETH</span>
                  </div>
                  <span className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-white">
                    {formatBalance(icoETHBal as bigint)}
                  </span>
                </div>
                
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                      USDT Balance
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">USDT</span>
                  </div>
                  <span className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-white">
                    {formatBalance(icoUSDTBal as bigint, 6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Withdrawals Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Withdraw Funds
              </h3>
              
              <div className="space-y-3">
                <motion.button
                  onClick={handleWithdrawETH}
                  onTouchStart={handleWithdrawETH}
                  disabled={loading.withdrawETH || !icoETHBal || Number(icoETHBal) === 0}
                  className="w-full flex items-center justify-between px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Withdraw ETH</span>
                  <span className="font-mono">
                    {formatBalance(icoETHBal as bigint)} ETH
                  </span>
                </motion.button>
                
                <motion.button
                  onClick={handleWithdrawUSDT}
                  onTouchStart={handleWithdrawUSDT}
                  disabled={loading.withdrawUSDT || !icoUSDTBal || Number(icoUSDTBal) === 0}
                  className="w-full flex items-center justify-between px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Withdraw USDT</span>
                  <span className="font-mono">
                    {formatBalance(icoUSDTBal as bigint, 6)} USDT
                  </span>
                </motion.button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                    Withdrawals will transfer funds to the contract owner's wallet. This action is irreversible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}