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
  FiExternalLink,
} from "react-icons/fi";
import { useICOContract } from "../../services/useICOContract";
import { fromTokenUnits } from "../../helpers/format";
import { useToastContext } from "../../context/ToastContext";
import { postPriceChange } from "@/lib/api";
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
    withdrawTokens: false,
    emergencyWithdraw: false,
    refreshing: false,
  });
  const [priceHistory, setPriceHistory] = useState<
    { timestamp: number; price: string }[]
  >([]);
  const [showPriceInput, setShowPriceInput] = useState(false);
  // NEW: custom withdraw amount + emergency confirm
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  // Contract hooks
  const {
    useGgetTokenPrice,
    useGetPauseStatus,
    updateTokenPrice: updateICOPrice,
    pause,
    withdrawRemainingTokens,
    emergencyWithdraw,
    useGetTokenBalance,
    useGetUSDTBalance,
    useGetTokenBalanceOf,
    usePriceDecimals,
    error: updateTokenPriceError,
    isPending: updateTokenPending,
    isConfirmed: ICOConfirmed,
    hash: txHash,
    isConfirming: txConfirming,
  } = useICOContract();

  const { data: tokenPriceData, refetch: refetchTokenPrice } =
    useGgetTokenPrice();
  const { data: pauseStatusData, refetch: refetchPauseStatus } =
    useGetPauseStatus();
  const { data: icoTokenBal, refetch: refetchTokenBalance } =
    useGetTokenBalance();
  const { data: icoUSDTBal, refetch: refetchUSDTBalance } = useGetUSDTBalance();
  const { data: icoUSDCBal, refetch: refetchUSDCBalance } =
    useGetTokenBalanceOf(CONTRACT_ADDRESS.MOCK_USDC as `0x${string}`);
  const { data: priceDecimalsData } = usePriceDecimals();

  const PRICE_DECIMALS =
    priceDecimalsData !== undefined ? Number(priceDecimalsData as number) : 6;
  const TOKEN_PRICE_USD = tokenPriceData
    ? fromTokenUnits(BigInt(tokenPriceData as bigint), PRICE_DECIMALS)
    : "0";

  // Effects
  useEffect(() => {
    if (TOKEN_PRICE_USD && TOKEN_PRICE_USD !== tokenPrice) {
      setTokenPrice(TOKEN_PRICE_USD);
      setPriceHistory((prev) => [
        { timestamp: Date.now(), price: TOKEN_PRICE_USD },
        ...prev.slice(0, 4),
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

  const [pendingPriceToPersist, setPendingPriceToPersist] = useState<
    string | null
  >(null);
  const [hasPostedPrice, setHasPostedPrice] = useState(false);

  useEffect(() => {
    const persistPriceIfConfirmed = async () => {
      if (ICOConfirmed && pendingPriceToPersist && !hasPostedPrice) {
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
  }, [ICOConfirmed, pendingPriceToPersist, hasPostedPrice, showSuccess]);

  const refreshAllData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, refreshing: true }));
    try {
      await Promise.all([
        refetchTokenPrice(),
        refetchPauseStatus(),
        refetchTokenBalance(),
        refetchUSDTBalance(),
        refetchUSDCBalance(),
      ]);
      showSuccess("Data Refreshed", "All data has been updated");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      showError("Refresh Failed", "Failed to refresh data");
    } finally {
      setLoading((prev) => ({ ...prev, refreshing: false }));
    }
  }, [
    refetchTokenPrice,
    refetchPauseStatus,
    refetchTokenBalance,
    refetchUSDTBalance,
    refetchUSDCBalance,
    showSuccess,
    showError,
  ]);

  const handleUpdateTokenPrice = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading((prev) => ({ ...prev, priceUpdate: true }));
    try {
      await updateICOPrice(ethers.parseUnits(tokenPrice, PRICE_DECIMALS));
      showInfo("Price Update", "Token price update transaction submitted");
      setPendingPriceToPersist(tokenPrice);
      setHasPostedPrice(false);
      setShowPriceInput(false);
    } catch (error) {
      console.error("Error updating token price:", error);
      showError("Price Update Failed", "Failed to update token price");
    } finally {
      setLoading((prev) => ({ ...prev, priceUpdate: false }));
    }
  }, [
    isConnected,
    address,
    tokenPrice,
    updateICOPrice,
    open,
    showInfo,
    showError,
    PRICE_DECIMALS,
  ]);

  const handleTogglePause = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading((prev) => ({ ...prev, pauseToggle: true }));
    try {
      await pause(!isPaused);
      showInfo("Pause Toggle", `${isPaused ? "Resuming" : "Pausing"} ICO...`);
    } catch (error) {
      console.error("Error toggling pause status:", error);
      showError("Pause Toggle Failed", "Failed to toggle ICO pause status");
    } finally {
      setLoading((prev) => ({ ...prev, pauseToggle: false }));
    }
  }, [isConnected, address, isPaused, pause, open, showInfo, showError]);

  const handleWithdrawTokens = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading((prev) => ({ ...prev, withdrawTokens: true }));
    try {
      // Determine withdraw amount: custom input or full balance
      let useCustom = false;
      let amountBn: bigint | null = null;
      try {
        if (withdrawAmount && Number(withdrawAmount) > 0) {
          amountBn = ethers.parseUnits(withdrawAmount, 18);
          useCustom = true;
        }
      } catch {
        showWarning("Invalid Amount", "Please enter a valid NEFE amount.");
        return;
      }

      const available = icoTokenBal ? (icoTokenBal as bigint) : 0n;
      if (useCustom && amountBn) {
        if (amountBn > available) {
          showWarning(
            "Amount Too Large",
            "Entered amount exceeds available balance."
          );
          return;
        }
        await withdrawRemainingTokens(amountBn);
      } else if (available > 0n) {
        await withdrawRemainingTokens(available);
      } else {
        showWarning("No Tokens", "No sale tokens available to withdraw");
        return;
      }

      showSuccess("Tokens Withdrawn", "Sale tokens withdrawn successfully");
      refetchTokenBalance();
      setWithdrawAmount("");
    } catch (error) {
      console.error("Failed to withdraw tokens:", error);
      showError("Withdrawal Failed", "Failed to withdraw sale tokens");
    } finally {
      setLoading((prev) => ({ ...prev, withdrawTokens: false }));
    }
  }, [
    withdrawRemainingTokens,
    icoTokenBal,
    withdrawAmount,
    isConnected,
    address,
    open,
    showSuccess,
    showError,
    showWarning,
    refetchTokenBalance,
  ]);

  const handleEmergencyWithdraw = useCallback(async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    setLoading((prev) => ({ ...prev, emergencyWithdraw: true }));
    try {
      const hasUSDT = icoUSDTBal && Number(icoUSDTBal) > 0;
      const hasUSDC = icoUSDCBal && Number(icoUSDCBal) > 0;
      const hasTokens = icoTokenBal && Number(icoTokenBal) > 0;

      if (hasUSDT || hasUSDC || hasTokens) {
        await emergencyWithdraw();
        showSuccess(
          "Emergency Withdrawn",
          "Payment tokens and remaining sale tokens withdrawn"
        );
        refetchUSDTBalance();
        refetchUSDCBalance();
        refetchTokenBalance();
      } else {
        showWarning("No Funds", "No funds available for emergency withdrawal");
      }
    } catch (error) {
      console.error("Failed to perform emergency withdraw:", error);
      showError("Emergency Withdraw Failed", "Failed to withdraw funds");
    } finally {
      setLoading((prev) => ({ ...prev, emergencyWithdraw: false }));
    }
  }, [
    emergencyWithdraw,
    icoUSDTBal,
    icoUSDCBal,
    icoTokenBal,
    isConnected,
    address,
    open,
    showSuccess,
    showError,
    showWarning,
    refetchUSDTBalance,
    refetchUSDCBalance,
    refetchTokenBalance,
  ]);

  const formatBalance = (
    balance: bigint | undefined,
    decimals: number = 18
  ) => {
    if (!balance) return "0";
    return (Number(balance) / 10 ** decimals).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals === 6 ? 2 : 4,
    });
  };

  const priceChangePercentage =
    priceHistory.length > 1
      ? ((parseFloat(priceHistory[0].price) -
          parseFloat(priceHistory[1].price)) /
          parseFloat(priceHistory[1].price)) *
        100
      : 0;

  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with refresh button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            ICO Management
          </h1>

          <motion.button
            onClick={refreshAllData}
            onTouchStart={refreshAllData}
            disabled={loading.refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-secondBgColor border border-bgColor/60 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw
              className={`${loading.refreshing ? "animate-spin" : ""} text-lg`}
            />
            Refresh Data
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
          {/* Left column - Token Price & Status */}
          <div className="md:col-span-2 space-y-4 md:space-y-6">
            {/* Token Price Card */}

            {/* ICO Status Card */}
            <div className="bg-secondBgColor rounded-xl shadow-md p-4 sm:p-6 border border-bgColor/60">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
                ICO Status
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-amber-500/10`}>
                    {isPaused ? (
                      <FiPause className="text-btnColor text-lg sm:text-xl" />
                    ) : (
                      <FiPlay className="text-btnColor text-lg sm:text-xl" />
                    )}
                  </div>
                  <div>
                    <span className="text-white/70 block text-xs sm:text-sm">
                      Current Status
                    </span>
                    <span
                      className={`font-semibold text-lg sm:text-xl text-amber-400`}
                    >
                      {isPaused ? "PAUSED" : "ACTIVE"}
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={handleTogglePause}
                  onTouchStart={handleTogglePause}
                  disabled={loading.pauseToggle}
                  className={`px-4 sm:px-6 sm:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50`}
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

              <div className="mt-4 p-3 bg-fourthBgColor rounded-lg">
                <div className="flex items-start gap-2">
                  <FiInfo className="text-amber-400 mt-0.5 flex-shrink-0 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm text-white/70">
                    {isPaused
                      ? "ICO is currently paused. No purchases can be made until resumed."
                      : "ICO is active. Users can purchase tokens using USDT or USDC."}
                  </p>
                </div>
              </div>
            </div>
            {/* Withdraw Funds Card */}
            <div className="bg-secondBgColor rounded-xl shadow-md p-4 sm:p-6 border border-bgColor/60">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
                Withdraw Funds
              </h3>

              <div className="space-y-3">
                {/* NEW: Optional custom withdraw amount input */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.000000000000000001"
                    min="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-bgColor/60 rounded-lg bg-fourthBgColor text-white text-sm min-h-[44px]"
                    placeholder="Amount to withdraw (NEFE). Leave blank for all"
                  />
                  <motion.button
                    onClick={() =>
                      setWithdrawAmount(
                        fromTokenUnits((icoTokenBal ?? 0n) as bigint, 18)
                      )
                    }
                    onTouchStart={() =>
                      setWithdrawAmount(
                        fromTokenUnits((icoTokenBal ?? 0n) as bigint, 18)
                      )
                    }
                    className="px-3 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm min-h-[44px] touch-manipulation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Max
                  </motion.button>
                </div>

                <motion.button
                  onClick={handleWithdrawTokens}
                  onTouchStart={handleWithdrawTokens}
                  disabled={
                    loading.withdrawTokens ||
                    ((!withdrawAmount || Number(withdrawAmount) <= 0) &&
                      (!icoTokenBal || Number(icoTokenBal) === 0))
                  }
                  className="w-full flex items-center justify-between px-4 py-2.5 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Withdraw Sale Tokens</span>
                  <span className="font-mono">
                    {withdrawAmount && Number(withdrawAmount) > 0
                      ? `${withdrawAmount} NEFE`
                      : `${formatBalance(icoTokenBal as bigint)} NEFE`}
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setShowEmergencyConfirm(true)}
                  onTouchStart={() => setShowEmergencyConfirm(true)}
                  disabled={
                    loading.emergencyWithdraw ||
                    (!(icoUSDTBal && Number(icoUSDTBal) > 0) &&
                      !(icoUSDCBal && Number(icoUSDCBal) > 0) &&
                      !(icoTokenBal && Number(icoTokenBal) > 0))
                  }
                  className="w-full flex items-center justify-between px-4 py-2.5 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Emergency Withdraw (All)</span>
                  <span className="font-mono">
                    {formatBalance(icoUSDTBal as bigint, 6)} USDT,{" "}
                    {formatBalance(icoUSDCBal as bigint, 6)} USDC
                  </span>
                </motion.button>
              </div>

              {/* NEW: transaction status + link */}
              {(updateTokenPending ||
                loading.withdrawTokens ||
                loading.emergencyWithdraw) && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                  <FiRefreshCw className="animate-spin" /> Submitting
                  transaction...
                </div>
              )}
              {txConfirming && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                  <FiRefreshCw className="animate-spin" /> Confirming
                  on-chain...
                </div>
              )}
              {ICOConfirmed && txHash && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                  <span>Last transaction confirmed.</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
                  >
                    View on Etherscan <FiExternalLink />
                  </a>
                </div>
              )}

              <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-amber-400 mt-0.5 flex-shrink-0 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm text-amber-300">
                    Emergency withdraw transfers payment tokens and any
                    remaining sale tokens to the owner. This action is
                    irreversible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Balances */}
          <div className="space-y-4 md:space-y-6">
            {/* Balances Card */}
            <div className="bg-secondBgColor rounded-xl shadow-md p-4 sm:p-6 border border-bgColor/60">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
                Contract Balances
              </h3>

              <div className="space-y-3">
                <div className="p-3 sm:p-4 bg-fourthBgColor rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/70 text-xs sm:text-sm">
                      Token Balance
                    </span>
                    <span className="text-xs text-white/60">NEFE</span>
                  </div>
                  <span className="font-semibold text-lg sm:text-xl text-white">
                    {formatBalance(icoTokenBal as bigint)}
                  </span>
                </div>

                <div className="p-3 sm:p-4 bg-fourthBgColor rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/70 text-xs sm:text-sm">
                      USDT Balance
                    </span>
                    <span className="text-xs text-white/60">USDT</span>
                  </div>
                  <span className="font-semibold text-lg sm:text-xl text-white">
                    {formatBalance(icoUSDTBal as bigint, 6)}
                  </span>
                </div>

                <div className="p-3 sm:p-4 bg-fourthBgColor rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/70 text-xs sm:text-sm">
                      USDC Balance
                    </span>
                    <span className="text-xs text-white/60">USDC</span>
                  </div>
                  <span className="font-semibold text-lg sm:text-xl text-white">
                    {formatBalance(icoUSDCBal as bigint, 6)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-secondBgColor rounded-xl shadow-md p-4 sm:p-6 border border-bgColor/60">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  Token Price
                </h3>

                {/* <div className="flex items-center gap-3">
                  {priceHistory.length > 1 && (
                    <span
                      className={`flex items-center text-sm font-medium ${
                        priceChangePercentage >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {priceChangePercentage >= 0 ? (
                        <FiArrowUp />
                      ) : (
                        <FiArrowDown />
                      )}
                      {Math.abs(priceChangePercentage).toFixed(2)}%
                    </span>
                  )}
                </div> */}
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
                        className="flex-1 px-3 py-2.5 border border-bgColor/60 rounded-lg bg-fourthBgColor text-white text-sm min-h-[44px]"
                        placeholder="Enter new token price"
                      />
                      <motion.button
                        onClick={handleUpdateTokenPrice}
                        onTouchStart={handleUpdateTokenPrice}
                        disabled={loading.priceUpdate}
                        className="px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm min-h-[44px] touch-manipulation"
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
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      ${tokenPrice}
                    </span>
                    <span className="text-white/60 text-sm mb-1">
                      per token
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Withdrawals Card moved to left column */}
          </div>
        </div>
      </motion.div>

      {/* NEW: Emergency Confirm Modal */}
      <AnimatePresence>
        {showEmergencyConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-secondBgColor rounded-xl border border-bgColor/60 p-6 w-full max-w-md shadow-xl"
            >
              <h4 className="text-lg font-semibold text-white mb-2">
                Confirm Emergency Withdraw
              </h4>
              <p className="text-white/70 text-sm mb-4">
                This will move all payment tokens and remaining NEFE tokens to
                the owner address.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-white/70">
                  <span>USDT</span>
                  <span className="font-mono text-white">
                    {formatBalance(icoUSDTBal as bigint, 6)} USDT
                  </span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>USDC</span>
                  <span className="font-mono text-white">
                    {formatBalance(icoUSDCBal as bigint, 6)} USDC
                  </span>
                </div>
                <div className="flex justify-between text-sm text-white/70">
                  <span>NEFE</span>
                  <span className="font-mono text-white">
                    {formatBalance(icoTokenBal as bigint)} NEFE
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowEmergencyConfirm(false);
                    handleEmergencyWithdraw();
                  }}
                  disabled={loading.emergencyWithdraw}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading.emergencyWithdraw ? "Withdrawing..." : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
