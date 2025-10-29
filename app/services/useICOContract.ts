// src/hooks/useICOContract.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import CONTRACT_ABIS from "../utils/web3intraction/constants/contract_abi";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";

// Contract constants
const abi = CONTRACT_ABIS.ICO_CONTRACT;
const address = CONTRACT_ADDRESS.ICO_CONTRACT as `0x${string}`;
const chainId = 11155111; // Sepolia

export function useICOContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // ----------- Reads ------------
  const useGetTokenBalance = () =>
    useReadContract({ abi, address, functionName: "getTokenBalance", chainId });

  // Generic balance for specific payment token address
  const useGetTokenBalanceOf = (tokenAddr: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "getTokenBalanceOf",
      args: [tokenAddr],
      chainId,
    });

  // Backward-compatible USDT balance getter
  const useGetUSDTBalance = () =>
    useGetTokenBalanceOf(CONTRACT_ADDRESS.MOCK_USDT as `0x${string}`);

  const useGgetTokenPrice = () =>
    useReadContract({ abi, address, functionName: "tokenPrice", chainId });

  const useGetPauseStatus = () =>
    useReadContract({ abi, address, functionName: "paused", chainId });

  const useGetTotalTokensSold = () =>
    useReadContract({ abi, address, functionName: "totalTokensSold", chainId });

  // Receivers management (reads)
  const useGetReceivers = () =>
    useReadContract({ abi, address, functionName: "getReceivers", chainId });

  const useCurrentReceiverIndex = () =>
    useReadContract({
      abi,
      address,
      functionName: "currentReceiverIndex",
      chainId,
    });

  const useIsPaymentTokenAllowed = (tokenAddr: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "allowedPaymentTokens",
      args: [tokenAddr],
      chainId,
    });

  const useRewardPercent = () =>
    useReadContract({ abi, address, functionName: "rewardPercent", chainId });

  const usePriceDecimals = () =>
    useReadContract({ abi, address, functionName: "priceDecimals", chainId });

  // ----------- Writes ------------
  // Dual-currency purchase: specify payment token address and amount (smallest units)
  const buyTokens = (paymentTokenAddr: `0x${string}`, amount: bigint) =>
    writeContract({
      abi,
      address,
      functionName: "buyTokens",
      args: [paymentTokenAddr, amount],
    });

  const withdrawRemainingTokens = (amount: bigint) =>
    writeContract({
      abi,
      address,
      functionName: "withdrawRemainingTokens",
      args: [amount],
    });

  const pause = (flag: boolean) =>
    writeContract({ abi, address, functionName: "pause", args: [flag] });

  const updateTokenPrice = (newPrice: bigint) =>
    writeContract({
      abi,
      address,
      functionName: "updateTokenPrice",
      args: [newPrice],
    });

  const emergencyWithdraw = () =>
    writeContract({ abi, address, functionName: "emergencyWithdraw" });

  // Payment token management (admin)
  const addPaymentToken = (tokenAddr: `0x${string}`) =>
    writeContract({ abi, address, functionName: "addPaymentToken", args: [tokenAddr] });

  const removePaymentToken = (tokenAddr: `0x${string}`) =>
    writeContract({ abi, address, functionName: "removePaymentToken", args: [tokenAddr] });

  // Receivers management (writes)
  const addReceiver = (receiver: `0x${string}`) =>
    writeContract({ abi, address, functionName: "addReceiver", args: [receiver] });

  const removeReceiver = (index: bigint) =>
    writeContract({ abi, address, functionName: "removeReceiver", args: [index] });

  const clearReceivers = () =>
    writeContract({ abi, address, functionName: "clearReceivers" });

  // Reward and staking integration (admin)
  const setRewardPercent = (percent: bigint) =>
    writeContract({ abi, address, functionName: "setRewardPercent", args: [percent] });

  const setRewardPercentFromStaking = (percent: bigint) =>
    writeContract({ abi, address, functionName: "setRewardPercentFromStaking", args: [percent] });

  const setStakingContract = (stakingAddr: `0x${string}`) =>
    writeContract({ abi, address, functionName: "setStakingContract", args: [stakingAddr] });

  const setTokenPriceFromStaking = (newPrice: bigint) =>
    writeContract({ abi, address, functionName: "setTokenPriceFromStaking", args: [newPrice] });

  return {
    // reads
    useGetTokenBalance,
    useGetTokenBalanceOf,
    useGetUSDTBalance,
    useGgetTokenPrice,
    useGetPauseStatus,
    useGetTotalTokensSold,
    useIsPaymentTokenAllowed,
    useRewardPercent,
    usePriceDecimals,
    useGetReceivers,
    useCurrentReceiverIndex,

    // writes
    buyTokens,
    withdrawRemainingTokens,
    pause,
    updateTokenPrice,
    emergencyWithdraw,
    addPaymentToken,
    removePaymentToken,
    addReceiver,
    removeReceiver,
    clearReceivers,
    setRewardPercent,
    setRewardPercentFromStaking,
    setStakingContract,
    setTokenPriceFromStaking,

    // tx state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
