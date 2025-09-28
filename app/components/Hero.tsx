"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import {
  FiDollarSign,
  FiTrendingUp,
  FiBox,
  FiShoppingCart,
  FiCreditCard,
  FiBarChart2,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { useICOContract } from "../services/useICOContract";
import { useTokenContract } from "../services/useTokenContract";
import { parseEther, parseUnits, formatEther, formatUnits } from "viem";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";
import { useRouter } from "next/navigation";
import { useMockUSDTContract } from "../services/useMockUSDTContract";
import { postTransaction, type NewTransactionBody } from "@/lib/api";
import { useTimers } from "../hooks/useTimers";
import { useToastContext } from "../context/ToastContext";
import CircuitBreakerGuide from "./CircuitBreakerGuide";

// Constants

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USDT">("USDT");
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [submitting, setSubmitting] = useState(false);
  const [pendingUSDTAmount, setPendingUSDTAmount] = useState<bigint | null>(
    null
  );
  const [queuedTxBody, setQueuedTxBody] = useState<Omit<
    NewTransactionBody,
    "hash"
  > | null>(null);
  const [hasPosted, setHasPosted] = useState(false);
  const [showCircuitBreakerGuide, setShowCircuitBreakerGuide] = useState(false);

  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToastContext();

  // Wagmi wallet connection
  const { address, isConnected, status } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // const TOKEN_PRICE_USD = Number(presaleData?.tokenPrice ?? 0.1);
  const MIN_PURCHASE = 100;
  const MAX_PURCHASE = 50000;
  const {
    timers,
    loading: timerLoading,
    error: timerError,
    fetchTimers,
  } = useTimers();

  // ICO Contract hooks
  const {
    useGetTokenBalance,
    useGetUSDTBalance,
    buyTokens,
    useGgetTokenPrice,
    useGetTotalTokensSold,
    isPending: isICOPending,
    isConfirmed,
    isConfirming,
    error: icoError,
    hash,
  } = useICOContract();

  // Token Contract hooks
  const {
    useTotalSupply,
    useBalanceOf,
    useAllowance,
    isPending: isTokenPending,
    isConfirmed: isTokenConfirmed,
    error: tokenError,
  } = useTokenContract();

  // USDT Contract hooks (approve flow)
  const {
    approve: approveUSDT,
    isConfirming: isUSDTConfirming,
    isConfirmed: isUSDTConfirmed,
    error: usdtApproveError,
  } = useMockUSDTContract();

  const { data: tokenPrice } = useGgetTokenPrice();
  const TOKEN_PRICE_USD = tokenPrice
    ? Number(formatUnits(tokenPrice as bigint, 6))
    : 0.1;

  const { data: totalSupply } = useTotalSupply();
  const { data: totalTokensSold } = useGetTotalTokensSold();
  // Wallet balances (only meaningful when connected)
  const { data: usdtBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESS.MOCK_USDT as `0x${string}`,
  });

  // Calculate derived values
  const TOTAL_SUPPLY = Number(
    typeof totalSupply === "bigint" ? formatEther(totalSupply) : 0
  );

  const SOLD_TOKENS = Number(
    typeof totalTokensSold === "bigint" ? formatEther(totalTokensSold) : 0
  );

  const AVAILABLE_TOKENS = TOTAL_SUPPLY - SOLD_TOKENS;
  const SALE_PROGRESS =
    TOTAL_SUPPLY > 0 ? (SOLD_TOKENS / TOTAL_SUPPLY) * 100 : 0;

  const endDateString = timers[0]?.endTime;

  // Required payment amounts for current selection
  const usdAmount = tokenAmount * TOKEN_PRICE_USD;
  const requiredUsdtUnits = parseUnits(usdAmount.toFixed(6), 6);

  const hasSufficientUsdt = Boolean(
    isConnected &&
      usdtBalance?.value !== undefined &&
      usdtBalance.value >= requiredUsdtUnits
  );
  const hasSufficientFunds = hasSufficientUsdt;

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchTimers();
  }, []);

  // Handle transaction confirmation and persistence
  useEffect(() => {
    const persistTransaction = async () => {
      if (!isConfirmed || !hash || !queuedTxBody || hasPosted) return;

      try {
        await postTransaction({ ...queuedTxBody, hash: hash as `0x${string}` });
        setHasPosted(true);
        setQueuedTxBody(null);
        showSuccess(
          "Transaction Successful",
          "Your tokens have been purchased successfully!"
        );
        router.push("/transactions");
      } catch (error) {
        console.error("Failed to persist transaction:", error);
        showError("Transaction Error", "Failed to save transaction details");
      }
    };

    void persistTransaction();
  }, [
    isConfirmed,
    hash,
    queuedTxBody,
    hasPosted,
    router,
    showSuccess,
    showError,
  ]);

  // Handle errors
  useEffect(() => {
    if (icoError) {
      showError(
        "Transaction Failed",
        icoError.message || "Failed to process transaction"
      );
    }
    if (tokenError) {
      showError(
        "Token Error",
        tokenError.message || "Failed to process token operation"
      );
    }
  }, [icoError, tokenError, showError]);

  // Event handlers
  const connectWallet = useCallback(async () => {
    try {
      await connect({ connector: injected() });
      showInfo(
        "Wallet Connected",
        "Your wallet has been connected successfully"
      );
    } catch (error) {
      console.error("Error connecting wallet:", error);
      showError("Connection Failed", "Failed to connect wallet");
    }
  }, [connect, showInfo, showError]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    showInfo("Wallet Disconnected", "Your wallet has been disconnected");
  }, [disconnect, showInfo]);

  const resetCircuitBreaker = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access to reset circuit breaker
        await (window.ethereum as any).request({
          method: "eth_requestAccounts",
        });
        showInfo(
          "Circuit Breaker Reset",
          "MetaMask circuit breaker has been reset. You can now try the transaction again."
        );
      }
    } catch (error) {
      console.error("Circuit breaker reset failed:", error);
      showError(
        "Reset Failed",
        "Could not reset circuit breaker. Please restart MetaMask manually."
      );
    }
  }, [showInfo, showError]);

  const calculatePaymentAmount = useCallback(() => {
    return (tokenAmount * TOKEN_PRICE_USD).toFixed(2);
  }, [tokenAmount, TOKEN_PRICE_USD]);

  const handleBuyTokens = useCallback(async () => {
    if (!isConnected || !address) {
      connectWallet();
      return;
    }

    try {
      setSubmitting(true);

      // Check if MetaMask is available and connected
      if (typeof window !== "undefined" && window.ethereum) {
        const chainId = await (window.ethereum as any).request({
          method: "eth_chainId",
        });
        if (chainId !== "0xaa36a7") {
          // Sepolia testnet
          showError(
            "Wrong Network",
            "Please switch to Sepolia testnet in MetaMask"
          );
          return;
        }
      }

      await handleUSDTPurchase();
    } catch (error) {
      console.error("Error buying tokens:", error);

      let errorMessage = "Failed to complete token purchase";
      if (error instanceof Error) {
        if (error.message.includes("circuit breaker")) {
          errorMessage =
            "MetaMask circuit breaker is active. Please wait a moment and try again, or restart MetaMask.";
          setShowCircuitBreakerGuide(true);
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient USDT balance for this transaction.";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was cancelled by user.";
        } else {
          errorMessage = error.message;
        }
      }

      showError("Purchase Failed", errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [isConnected, address, connectWallet, showError, tokenAmount]);

  const handleUSDTPurchase = async () => {
    const usdtAmount = tokenAmount * TOKEN_PRICE_USD;

    // Validate calculation
    if (isNaN(usdtAmount) || usdtAmount <= 0) {
      throw new Error("Invalid calculation. Please check your input.");
    }

    const usdtInSmallest = parseUnits(usdtAmount.toFixed(6), 6);

    // Ensure balance is enough
    if (
      usdtBalance?.value !== undefined &&
      usdtBalance.value < usdtInSmallest
    ) {
      throw new Error("Insufficient USDT balance for this purchase");
    }

    if (usdtInSmallest <= 0n) {
      throw new Error("USDT amount must be greater than 0");
    }

    // 🔹 خزّن القيمة عشان نستخدمها بعد الـ confirm
    setPendingUSDTAmount(usdtInSmallest);

    // Add delay to prevent circuit breaker issues
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 🔹 approve فقط
    try {
      await approveUSDT(
        CONTRACT_ADDRESS.ICO_CONTRACT as `0x${string}`,
        usdtInSmallest
      );
    } catch (error) {
      console.error("USDT Approval Error:", error);
      setPendingUSDTAmount(null);
      throw new Error(
        "Failed to approve USDT. Please try again or check your wallet connection."
      );
    }
  };

  useEffect(() => {
    const proceed = async () => {
      if (isUSDTConfirmed && pendingUSDTAmount) {
        try {
          showInfo(
            "USDT Approved",
            "Approval confirmed, proceeding with purchase"
          );

          try {
            await buyTokens(pendingUSDTAmount);
          } catch (buyError) {
            console.error("Buy Tokens Error:", buyError);
            throw new Error(
              "Failed to complete token purchase. Please try again."
            );
          }

          setQueuedTxBody({
            type: "BUY",
            amount: tokenAmount,
            price: Number(tokenAmount * TOKEN_PRICE_USD),
            currency: "USDT",
            status: "COMPLETED",
            date: new Date().toISOString(),
          });
          setHasPosted(false);
        } catch (err) {
          console.error("Buy failed:", err);
          showError("Purchase Failed", "Unable to complete purchase with USDT");
        } finally {
          setPendingUSDTAmount(null);
        }
      }
    };

    void proceed();
  }, [
    isUSDTConfirmed,
    pendingUSDTAmount,
    tokenAmount,
    TOKEN_PRICE_USD,
    buyTokens,
    showInfo,
    showError,
  ]);

  // Loading states
  const isPending =
    isICOPending ||
    isTokenPending ||
    isConnecting ||
    submitting ||
    isUSDTConfirming ||
    isConfirming;
  const isTxConfirmed = isConfirmed || isTokenConfirmed;
  const error = icoError || tokenError;

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-0">
        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 lg:gap-16 items-stretch">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6 md:space-y-9"
          >
            <div className="space-y-6 md:space-y-8">
              <div className="highlight-box">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-3 mb-4 md:mb-6"
                >
                  <FiTrendingUp className="text-purple-600 text-xl animate-pulse" />
                  <span className="text-purple-600 font-semibold">
                    Presale is Live
                  </span>
                </motion.div>

                <motion.h1
                  className="heading-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Welcome to{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    PLT Token Presale
                  </span>
                </motion.h1>

                <motion.p
                  className="text-sm sm:text-base md:text-xl text-gray-700 dark:text-gray-300 mt-4 md:mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Secure your PLT tokens now with USDT payments. Limited time
                  offer with special bonuses for early participants.
                </motion.p>
              </div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="stat-card p-3 md:p-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FiBarChart2 className="text-purple-600 text-lg md:text-xl" />
                    <h3 className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium">
                      Target Raised
                    </h3>
                  </div>
                  <p className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 text-xl md:text-2xl lg:text-3xl font-bold">
                    $2,500,000
                  </p>
                </div>
                <div className="stat-card p-3 md:p-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="text-purple-600 text-lg md:text-xl" />
                    <h3 className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium">
                      Maximum Raise
                    </h3>
                  </div>
                  <p className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 text-xl md:text-2xl lg:text-3xl font-bold">
                    $5,000,000
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 md:mt-6"
            >
              <CountdownTimer endDate={endDateString} title="Presale Ends In" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 md:mt-6"
            >
              <div className="rounded-2xl p-4 md:p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-3 py-3">
                    <p className="text-sm uppercase tracking-wide/loose opacity-90">
                      Special USDT-only presale
                    </p>
                    <h3 className="text-2xl md:text-xl font-semibold">
                      Buy PLT tokens with USDT at presale price
                    </h3>
                    <p className="text-sm opacity-95">
                      Simple USDT payments with instant token delivery and
                      secure smart contracts.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block h-10 w-px bg-white/20" />
                    <div className="text-right">
                      <p className="text-xs opacity-90">Current price</p>
                      <p className="text-lg md:text-xl font-bold">
                        ${TOKEN_PRICE_USD} / PLT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Purchase Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <div className="card h-full p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="space-y-3 sm:space-y-4">
                {/* Token Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="feature-card p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiDollarSign className="text-purple-600 text-base sm:text-lg md:text-xl" />
                      <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
                        Token Price
                      </h3>
                    </div>
                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-bold">
                      ${TOKEN_PRICE_USD} USD
                    </p>
                  </div>
                  <div className="feature-card p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiTrendingUp className="text-purple-600 text-base sm:text-lg md:text-xl" />
                      <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
                        USDT Price
                      </h3>
                    </div>
                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-bold">
                      $1.00 USD
                    </p>
                  </div>
                </div>

                {/* Token Analysis */}
                <div className="feature-card space-y-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FiBox className="text-purple-600 text-base sm:text-lg md:text-xl" />
                    <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
                      Token Analysis
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">
                        Total Supply
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {TOTAL_SUPPLY.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">
                        Sold
                      </span>
                      <span className="text-purple-600 dark:text-purple-500 font-bold">
                        {SOLD_TOKENS.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block">
                        Available
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {AVAILABLE_TOKENS.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Sale Progress
                      </span>
                      <span className="font-medium text-purple-600 dark:text-purple-500">
                        {SALE_PROGRESS.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${SALE_PROGRESS}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Purchase Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="feature-card p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiAlertCircle className="text-purple-600 text-base sm:text-lg md:text-xl" />
                      <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
                        Min Purchase
                      </h3>
                    </div>
                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm font-bold">
                      {MIN_PURCHASE.toLocaleString()} PLT
                    </p>
                  </div>
                  <div className="feature-card p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FiCheckCircle className="text-purple-600 text-base sm:text-lg md:text-xl" />
                      <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
                        Max Purchase
                      </h3>
                    </div>
                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm font-bold">
                      {MAX_PURCHASE.toLocaleString()} PLT
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <FiCreditCard className="text-gray-500 text-xs sm:text-sm" />
                    <label className="text-gray-500 text-xs sm:text-sm font-medium">
                      Payment Method
                    </label>
                  </div>
                  <div className="bg-purple-100 p-1 rounded-lg">
                    <div className="flex-1 relative rounded-md transition-all duration-200 py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base text-white">
                      <span className="relative z-10">USDT (Tether)</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <FiShoppingCart className="text-purple-600 text-base sm:text-lg md:text-xl" />
                      <label className="text-gray-500 text-xs sm:text-sm font-medium">
                        Amount of PLT
                      </label>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-bold text-purple-600">
                      {tokenAmount.toLocaleString()} PLT
                    </span>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min={MIN_PURCHASE}
                        max={MAX_PURCHASE}
                        step="100"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(Number(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #9333ea, #2563eb ${
                            ((tokenAmount - MIN_PURCHASE) /
                              (MAX_PURCHASE - MIN_PURCHASE)) *
                            100
                          }%, #e5e7eb ${
                            ((tokenAmount - MIN_PURCHASE) /
                              (MAX_PURCHASE - MIN_PURCHASE)) *
                            100
                          }%)`,
                        }}
                        className="w-full h-2 appearance-none rounded-lg cursor-pointer
                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:cursor-pointer
                                   [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600"
                      />

                      <div className="flex justify-between mt-1 sm:mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-gray-500">
                            Min
                          </span>
                          <span className="text-xs font-bold">
                            {MIN_PURCHASE.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-gray-500">
                            Max
                          </span>
                          <span className="text-xs font-bold">
                            {MAX_PURCHASE.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="feature-card space-y-2 sm:space-y-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiDollarSign className="text-purple-600 text-base sm:text-lg md:text-xl" />
                    <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
                      Payment Summary
                    </h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">
                      You Pay
                    </span>
                    <span className="text-purple-600 dark:text-purple-500 text-xs sm:text-sm md:text-base font-bold">
                      {calculatePaymentAmount()} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">
                      Total in USD
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-bold">
                      ${(tokenAmount * TOKEN_PRICE_USD).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  type="button"
                  onClick={isConnected ? handleBuyTokens : connectWallet}
                  disabled={isConnected && !hasSufficientFunds}
                  className={`btn-primary relative z-50 cursor-pointer w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base ${
                    isConnected && !hasSufficientFunds
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  whileHover={
                    isConnected && !hasSufficientFunds ? {} : { scale: 1.02 }
                  }
                  whileTap={
                    isConnected && !hasSufficientFunds ? {} : { scale: 0.98 }
                  }
                >
                  {isPending ? (
                    <FiLoader className="text-sm sm:text-base md:text-lg animate-spin" />
                  ) : (
                    <FiCreditCard className="text-sm sm:text-base md:text-lg" />
                  )}
                  <span className="font-semibold">
                    {isPending
                      ? "Processing..."
                      : isConnected
                      ? !hasSufficientFunds
                        ? "Insufficient USDT"
                        : "Buy Tokens Now"
                      : "Connect Wallet to Buy"}
                  </span>
                </motion.button>

                <p className="text-xs text-gray-500 text-center">
                  Compatible with MetaMask, Trust Wallet, or any ERC-20 wallet.
                  <br />
                  Do not send from an exchange.
                </p>

                {/* USDT Balance Status Message */}
                {isConnected && !hasSufficientFunds && (
                  <div className="text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                      Insufficient USDT balance for the selected amount.
                    </p>
                  </div>
                )}

                {/* Circuit Breaker Help */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Having issues? Try these solutions:
                  </p>
                  <div className="text-xs text-gray-400 space-y-1 mb-3">
                    <p>• Ensure you're on Sepolia testnet</p>
                    <p>• Wait 30 seconds between transactions</p>
                    <p>• Restart MetaMask if circuit breaker is active</p>
                    <p>• Check you have enough ETH for gas fees</p>
                  </div>
                  <button
                    onClick={() => setShowCircuitBreakerGuide(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 underline"
                  >
                    Get Help with Circuit Breaker
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Circuit Breaker Guide Modal */}
      <CircuitBreakerGuide
        isOpen={showCircuitBreakerGuide}
        onClose={() => setShowCircuitBreakerGuide(false)}
        onReset={resetCircuitBreaker}
      />
    </div>
  );
};

export default Hero;
