"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import {
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
  FiCreditCard,
  FiBarChart2,
  FiLoader,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { SiTether } from "react-icons/si";
// import { FaDollarSign } from "react-icons/fa";
import { useICOContract } from "../services/useICOContract";
import { useTokenContract } from "../services/useTokenContract";
import { parseEther, parseUnits, formatEther, formatUnits } from "viem";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";
import { useRouter } from "next/navigation";
import { useMockUSDTContract } from "../services/useMockUSDTContract";
import { useMockUSDCContract } from "../services/useMockUSDCContract";
import {
  postTransaction,
  type NewTransactionBody,
  getActivePrice,
} from "@/lib/api";
import { useTimers } from "../hooks/useTimers";
import { useToastContext } from "../context/ToastContext";
import CircuitBreakerGuide from "./CircuitBreakerGuide";
import { useTokenStakingContract } from "../services/useTokenStakingContract";

// Constants

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USDT" | "USDC">(
    "USDT"
  );
  const [submitting, setSubmitting] = useState(false);
  const [pendingUSDTAmount, setPendingUSDTAmount] = useState<bigint | null>(
    null
  );
  const [pendingUSDCAmount, setPendingUSDCAmount] = useState<bigint | null>(
    null
  );
  const [queuedTxBody, setQueuedTxBody] = useState<Omit<
    NewTransactionBody,
    "hash"
  > | null>(null);
  const [hasPosted, setHasPosted] = useState(false);
  const [showCircuitBreakerGuide, setShowCircuitBreakerGuide] = useState(false);
  const [purchaseQueued, setPurchaseQueued] = useState(false);
  // const TOKEN_PRICE_USD = Number(presaleData?.tokenPrice ?? 0.1);
  const MIN_PURCHASE = 100000;
  const MAX_PURCHASE = 10000000;
  const [tokenAmount, setTokenAmount] = useState<number>(MIN_PURCHASE);
  const [usdSelection, setUsdSelection] = useState<number>(100);
  const USD_OPTIONS = [
    100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 5000, 10000,
  ];

  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToastContext();

  // Wagmi wallet connection
  const { address, isConnected, status } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

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
  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESS.MOCK_USDC as `0x${string}`,
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
  const usdAmount = usdSelection;
  const requiredUsdtUnits = parseUnits(usdSelection.toFixed(6), 6);
  const requiredUsdcUnits = parseUnits(usdSelection.toFixed(6), 6);

  const { useGetRelease } = useTokenStakingContract();
  const { data: release0 } = useGetRelease(0);
  const { data: release1 } = useGetRelease(1);
  const { data: release2 } = useGetRelease(2);
  const { data: release3 } = useGetRelease(3);
  const { data: release4 } = useGetRelease(4);
  const releases = [release0, release1, release2, release3, release4];
  const times = releases.map((r) => {
    const val = Array.isArray(r) ? r[0] : undefined;
    return typeof val === "bigint"
      ? Number(val)
      : typeof val === "number"
      ? val
      : 0;
  });
  const rewardsPercents = releases.map((r) => {
    const val = Array.isArray(r) ? r[2] : undefined;
    return typeof val === "bigint"
      ? Number(val)
      : typeof val === "number"
      ? val
      : 0;
  });
  const nowSec = Math.floor(Date.now() / 1000);
  const nextTs = times.filter((v) => v > nowSec).sort((a, b) => a - b)[0];
  const nextIndex = typeof nextTs === "number" ? times.indexOf(nextTs) - 1 : -1;
  const currentRewardPercent =
    nextIndex >= 0 ? rewardsPercents[nextIndex] : undefined;
  const rewardsNEFE = tokenAmount * ((currentRewardPercent ?? 1) / 100);
  const totalNEFE = tokenAmount + rewardsNEFE;

  // console.log(previousReleaseData);
  console.log("//////////////");
  console.log(currentRewardPercent);

  const hasSufficientUsdt = Boolean(
    isConnected &&
      usdtBalance?.value !== undefined &&
      usdtBalance.value >= requiredUsdtUnits
  );
  const hasSufficientUsdc = Boolean(
    isConnected &&
      usdcBalance?.value !== undefined &&
      usdcBalance.value >= requiredUsdcUnits
  );
  const hasSufficientFunds =
    selectedCurrency === "USDT" ? hasSufficientUsdt : hasSufficientUsdc;

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
    return usdSelection.toFixed(2);
  }, [usdSelection]);

  // Sync NEFE token amount from selected USD to prevent manual NEFE input
  useEffect(() => {
    const derived = usdSelection / TOKEN_PRICE_USD;
    if (!Number.isFinite(derived)) return;
    setTokenAmount(derived);
  }, [usdSelection, TOKEN_PRICE_USD]);

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

      if (selectedCurrency === "USDT") {
        await handleUSDTPurchase();
      } else {
        await handleUSDCPurchase();
      }
    } catch (error) {
      console.error("Error buying tokens:", error);

      let errorMessage = "Failed to complete token purchase";
      if (error instanceof Error) {
        if (error.message.includes("circuit breaker")) {
          errorMessage =
            "MetaMask circuit breaker is active. Please wait a moment and try again, or restart MetaMask.";
          setShowCircuitBreakerGuide(true);
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = `Insufficient ${selectedCurrency} balance for this transaction.`;
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
  }, [
    isConnected,
    address,
    connectWallet,
    showError,
    tokenAmount,
    selectedCurrency,
  ]);

  const handleUSDTPurchase = async () => {
    const usdtAmount = usdSelection;

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

    setPendingUSDTAmount(usdtInSmallest);

    // Add delay to prevent circuit breaker issues
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

  const {
    approve: approveUSDC,
    isConfirming: isUSDCConfirming,
    isConfirmed: isUSDCConfirmed,
    error: usdcApproveError,
  } = useMockUSDCContract();

  const handleUSDCPurchase = async () => {
    const usdcAmount = usdSelection;

    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      throw new Error("Invalid calculation. Please check your input.");
    }

    const usdcInSmallest = parseUnits(usdcAmount.toFixed(6), 6);

    if (
      usdcBalance?.value !== undefined &&
      usdcBalance.value < usdcInSmallest
    ) {
      throw new Error("Insufficient USDC balance for this purchase");
    }

    if (usdcInSmallest <= 0n) {
      throw new Error("USDC amount must be greater than 0");
    }

    setPendingUSDCAmount(usdcInSmallest);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await approveUSDC(
        CONTRACT_ADDRESS.ICO_CONTRACT as `0x${string}`,
        usdcInSmallest
      );
    } catch (error) {
      console.error("USDC Approval Error:", error);
      setPendingUSDCAmount(null);
      throw new Error(
        "Failed to approve USDC. Please try again or check your wallet connection."
      );
    }
  };

  // useEffect(() => {
  //   let priceId: string | undefined = undefined;
  //   const fetchActivePrice = async () => {
  //     try {
  //       const activePrice = await getActivePrice("MEM");
  //       priceId = activePrice?._id as string | undefined;
  //     } catch {}
  //   };
  //   fetchActivePrice();
  //   console.log(priceId);
  // }, []);

  useEffect(() => {
    const proceed = async () => {
      if (isUSDTConfirmed && pendingUSDTAmount && !purchaseQueued) {
        try {
          showInfo(
            "USDT Approved",
            "Approval confirmed, proceeding with purchase"
          );

          try {
            setPurchaseQueued(true);
            await buyTokens(
              CONTRACT_ADDRESS.MOCK_USDT as `0x${string}`,
              pendingUSDTAmount
            );
          } catch (buyError) {
            console.error("Buy Tokens Error:", buyError);
            throw new Error(
              "Failed to complete token purchase. Please try again."
            );
          }

          let priceId: string | undefined = undefined;
          try {
            const activePrice = await getActivePrice("MEM");
            priceId = activePrice?._id as string | undefined;
          } catch {}

          setQueuedTxBody({
            type: "BUY",
            amount: totalNEFE,
            price: Number(tokenAmount * TOKEN_PRICE_USD),
            currency: "USDT",
            status: "COMPLETED",
            date: new Date().toISOString(),
            walletAddress: address as `0x${string}`,
            priceId,
          });
          setHasPosted(false);
        } catch (err) {
          console.error("Buy failed:", err);
          showError("Purchase Failed", "Unable to complete purchase with USDT");
          setPurchaseQueued(false);
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
    purchaseQueued,
    address,
  ]);

  useEffect(() => {
    const proceedUSDC = async () => {
      if (isUSDCConfirmed && pendingUSDCAmount && !purchaseQueued) {
        try {
          showInfo(
            "USDC Approved",
            "Approval confirmed, proceeding with purchase"
          );

          try {
            setPurchaseQueued(true);
            await buyTokens(
              CONTRACT_ADDRESS.MOCK_USDC as `0x${string}`,
              pendingUSDCAmount
            );
          } catch (buyError) {
            console.error("Buy Tokens Error:", buyError);
            throw new Error(
              "Failed to complete token purchase. Please try again."
            );
          }

          let priceId: string | undefined = undefined;
          try {
            const activePrice = await getActivePrice("MEM");
            priceId = activePrice?._id as string | undefined;
          } catch {}

          setQueuedTxBody({
            type: "BUY",
            amount: tokenAmount,
            price: Number(tokenAmount * TOKEN_PRICE_USD),
            currency: "USDC",
            status: "COMPLETED",
            date: new Date().toISOString(),
            walletAddress: address as `0x${string}`,
            priceId,
          });
          setHasPosted(false);
        } catch (err) {
          console.error("Buy failed:", err);
          showError("Purchase Failed", "Unable to complete purchase with USDC");
          setPurchaseQueued(false);
        } finally {
          setPendingUSDCAmount(null);
        }
      }
    };

    void proceedUSDC();
  }, [
    isUSDCConfirmed,
    pendingUSDCAmount,
    tokenAmount,
    TOKEN_PRICE_USD,
    buyTokens,
    showInfo,
    showError,
    purchaseQueued,
    address,
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
    <div className="relative pt-20 md:pt-20 pb-0 md:pb-10 min-h-screen overflow-hidden flex items-center bg-bgColor">
      {/* Main Content */}
      <div className="w-full mx-auto py-8 md:py-0">
        {/* Upper part: coin icon and current price (neutral bg) */}
        <div className="mb-6 md:mb-8  rounded-xl font-nunito bg-secondBgColor border border-bgColor/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-0 justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="rounded-lg p-1 flex items-center justify-center w-20 sm:w-28 md:w-40">
              <Image
                src="/coin-icon.svg"
                alt="NEFE coin"
                width={160}
                height={160}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="leading-tight flex flex-col gap-3">
              <p className="text-sm md:text-base uppercase font-medium font-inter">
                Limited-time presale bonus
              </p>
              <p className="text-base md:text-4xl text-primary font-semibold">
                Early buyers get the best price on NEFE
              </p>
              <p className="text-sm md:text-base font-medium font-nunito">
                Secure your allocation today before the next price increase.{" "}
              </p>
            </div>
          </div>
          <div className="sm:text-right text-left mt-4 sm:mt-0">
            <p className="text-base md:text-2xl uppercase font-medium">
              Current price
            </p>
            <p className="text-lg md:text-5xl font-extrabold text-white">
              USDT{TOKEN_PRICE_USD.toFixed(3)} / NEFE
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8 lg:gap-16 items-stretch">
          {/* Left Column - Hero Content (Order 2 on mobile, 1 on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-6 md:space-y-9 text-white order-2 lg:order-1"
          >
            <div className="space-y-6 md:space-y-16">
              <div>
                <div className="flex items-center gap-2 mb-4 text-white/80">
                  <FiBarChart2 className="text-sm" />
                  <span className="text-sm font-nunito">Presale is Live</span>
                </div>
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-6 font-inter"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  THE INITIAL COIN{" "}
                  <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent ">
                    OFFERING IS LIVE
                  </span>
                </motion.h1>

                <motion.p
                  className="text-lg md:text-xl  leading-relaxed max-w-2xl mb-8 font-inter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Your opportunity to claim a stake in the Nefe dynasty begins
                  now. Be among the first to unearth the legacy.
                </motion.p>
              </div>

              {/* Token Analysis (moved from right card) */}
              <div className="space-y-3 py-4 sm:py-5 bg-bgColor rounded-xl border border-bgColor/60 font-nunito">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-1.5 bg-bgColor/60 rounded-lg">
                    <FiBarChart2 className="text-white text-base sm:text-lg" />
                  </div>
                  <h3 className="text-white/80 text-sm font-semibold">
                    Token Analysis
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
                  <div>
                    <span className="block text-xs sm:text-sm md:text-base mb-1">
                      Total Supply
                    </span>
                    <span className="text-amber font-extrabold text-2xl md:text-3xl text-primary">
                      {TOTAL_SUPPLY.toLocaleString()}
                    </span>
                  </div>
                  <div className="pl-0 sm:pl-10">
                    <span className="block text-xs sm:text-sm md:text-base mb-1">
                      Sold
                    </span>
                    <span className="text-amber font-extrabold text-2xl md:text-3xl text-primary">
                      {SOLD_TOKENS.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm md:text-base mb-1">
                      Available
                    </span>
                    <span className="text-amber font-extrabold text-2xl md:text-3xl text-primary">
                      {AVAILABLE_TOKENS.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Sale Progress</span>
                    <span className="text-white/70 font-medium">
                      {SALE_PROGRESS.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-secondBgColor rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${SALE_PROGRESS}%` }}
                    />
                  </div>
                </div>
              </div>
              {/* Soft and Hard Cap Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-6 rounded-xl bg-secondBgColor border border-bgColor/60">
                  <div className="flex items-center gap-2 mb-2 text-white/80">
                    <FiBarChart2 className="text-white/70" />
                    <span className="text-sm font-semibold">Soft Cap</span>
                  </div>
                  <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent font-bold text-2xl md:text-3xl">
                    $1,000,000
                  </span>
                </div>
                <div className="p-6 rounded-xl bg-secondBgColor border border-bgColor/60">
                  <div className="flex items-center gap-2 mb-2 text-white/80">
                    <FiBarChart2 className="text-white/70" />
                    <span className="text-sm font-semibold">Hard Cap</span>
                  </div>
                  <span className="bg-gradient-to-r from-[#F4AD30] to-[#CA6C2F] bg-clip-text text-transparent font-bold text-2xl md:text-3xl">
                    $4,000,000
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Purchase Card (Order 1 on mobile, 2 on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full order-1 lg:order-2"
          >
            <div className="card h-full p-4 sm:p-6 md:p-8 bg-secondBgColor rounded-3xl border border-bgColor/60 shadow-md text-white">
              <div className="space-y-3 sm:space-y-4">
                {/* Token Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-bgColor rounded-xl border border-bgColor/60">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-bgColor/60 rounded-lg">
                        <FiBarChart2 className="text-white text-base sm:text-lg" />
                      </div>
                      <h3 className=" text-xs sm:text-sm font-semibold">
                        Token Price
                      </h3>
                    </div>
                    <p className="text-amber-400 text-sm sm:text-base font-bold">
                      ${TOKEN_PRICE_USD.toFixed(3)} USD
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-bgColor rounded-xl border border-bgColor/60">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-bgColor/60 rounded-lg">
                        <FiTrendingUp className="text-white text-base sm:text-lg" />
                      </div>
                      <h3 className="text-white/80 text-xs sm:text-sm font-semibold">
                        USDT or USDC Price
                      </h3>
                    </div>
                    <p className="text-amber-400 text-sm sm:text-base font-bold">
                      $1.00 USD
                    </p>
                  </div>
                </div>

                {/* Select Currency (ETH disabled) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <FiBarChart2 className="text-white text-base sm:text-lg" />
                    <label className="text-white/80 text-xs sm:text-sm font-medium">
                      Currency
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCurrency("USDT")}
                      className={`flex-1 rounded-md py-2 md:py-2.5 px-4 text-sm md:text-base border ${
                        selectedCurrency === "USDT"
                          ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                          : "bg-bgColor text-white/80 border-bgColor/60"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 justify-center">
                        <SiTether className="w-5 h-5" />
                        USDT
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCurrency("USDC")}
                      className={`flex-1 rounded-md py-2 md:py-2.5 px-4 text-sm md:text-base border ${
                        selectedCurrency === "USDC"
                          ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                          : "bg-bgColor text-white/80 border-bgColor/60"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Image
                          src="/usdc.png"
                          alt="USDC"
                          width={22}
                          height={22}
                          className="inline-block bg-white rounded-full"
                        />
                        USDC
                      </span>
                    </button>
                  </div>
                </div>

                {/* Amount Selection */}
                {/* Purchase Amount Selection */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <FiShoppingCart className="text-amber-500 text-base sm:text-lg md:text-xl" />
                      <label className="text-white text-sm md:text-base">
                        Purchase Amount
                      </label>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-bold text-amber-400">
                      {usdSelection.toLocaleString()} {selectedCurrency}
                    </span>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative pt-1">
                      <div className="flex items-center gap-3 sm:gap-4 w-full">
                        <select
                          value={usdSelection}
                          onChange={(e) =>
                            setUsdSelection(Number(e.target.value))
                          }
                          className="flex-1 w-full bg-neutral-900 text-white rounded-md px-3 py-2 border border-bgColor/60 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        >
                          {USD_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.toLocaleString()} {selectedCurrency}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-between mt-1 sm:mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-white/70">
                            Min
                          </span>
                          <span className="text-xs font-bold text-white">
                            {USD_OPTIONS[0].toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-white/70">
                            Max
                          </span>
                          <span className="text-xs font-bold text-white">
                            {USD_OPTIONS[
                              USD_OPTIONS.length - 1
                            ].toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 bg-bgColor rounded-xl border border-bgColor/60">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiDollarSign className="text-white/70 text-base sm:text-lg md:text-xl" />
                    <h3 className="text-white/80 text-xs sm:text-sm font-medium">
                      Payment Summary
                    </h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">
                      You Pay
                    </span>
                    <span className="text-amber-400 text-xs sm:text-sm md:text-base font-bold">
                      {calculatePaymentAmount()} {selectedCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">
                      Amount of NEFE
                    </span>
                    <span className="text-amber-400 text-xs sm:text-sm md:text-base font-bold">
                      {tokenAmount.toLocaleString()} NEFE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">
                      Rewards (ascription {currentRewardPercent}%)
                    </span>
                    <span className="text-amber-400 text-xs sm:text-sm md:text-base font-bold">
                      {rewardsNEFE.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      NEFE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">
                      Total NEFE
                    </span>
                    <span className="text-amber-400 text-xs sm:text-sm md:text-base font-bold">
                      {totalNEFE.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      NEFE
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">
                      Total in USD
                    </span>
                    <span className="text-white text-xs sm:text-sm md:text-base font-bold">
                      ${usdAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  type="button"
                  onClick={isConnected ? handleBuyTokens : connectWallet}
                  disabled={isConnected && !hasSufficientFunds}
                  className={`relative z-50 cursor-pointer w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base rounded-xl bg-amber-600 hover:bg-amber-700 text-white ${
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
                        ? `Insufficient ${selectedCurrency}`
                        : "Buy Tokens Now"
                      : "Connect Wallet to Buy"}
                  </span>
                </motion.button>

                <p className="text-xs text-center">
                  Compatible with MetaMask, Trust Wallet, or any ERC-20 wallet.
                  <br />
                  Do not send from an exchange.
                </p>

                {/* USDT Balance Status Message */}
                {isConnected && !hasSufficientFunds && (
                  <div className="text-center">
                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      {`Insufficient ${selectedCurrency} balance for the selected amount.`}
                    </p>
                  </div>
                )}

                {/* Circuit Breaker Help */}
                {/* <div className="text-center">
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
                            className="text-xs text-amber-600 hover:text-amber-700 underline"
                  >
                    Get Help with Circuit Breaker
                  </button>
                </div> */}
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
