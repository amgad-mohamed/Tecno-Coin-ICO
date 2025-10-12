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
  const useGetLatestETHPrice = () =>
    useReadContract({ abi, address, functionName: "getLatestETHPrice", chainId });

  const useGetTokenBalance = () =>
    useReadContract({ abi, address, functionName: "getTokenBalance", chainId });

  const useGetUSDTBalance = () =>
    useReadContract({ abi, address, functionName: "getUSDTBalance", chainId });

  const useGetETHBalance = () =>
    useReadContract({ abi, address, functionName: "getETHBalance", chainId });

  const useGgetTokenPrice = () =>
    useReadContract({ abi, address, functionName: "tokenPrice", chainId });

  const useGetPauseStatus = () =>
    useReadContract({ abi, address, functionName: "paused", chainId });

  const useGetTotalTokensSold = () =>
    useReadContract({ abi, address, functionName: "totalTokensSold", chainId });

  // ----------- Writes ------------
  const buyTokens = (amount) =>
    writeContract({ abi, address, functionName: "buyTokens", args: [amount] });

  const buyTokensWithETH = (ethAmount) =>
    writeContract({
      abi,
      address,
      functionName: "buyTokensWithETH",
      value: ethAmount,
    });

  const withdrawFunds = (amount) =>
    writeContract({
      abi,
      address,
      functionName: "withdrawFunds",
      args: [amount],
    });

  const withdrawETH = (amount) =>
    writeContract({
      abi,
      address,
      functionName: "withdrawETH",
      args: [amount],
    });

  const withdrawRemainingTokens = (amount) =>
    writeContract({
      abi,
      address,
      functionName: "withdrawRemainingTokens",
      args: [amount],
    });

  const pause = (flag) =>
    writeContract({ abi, address, functionName: "pause", args: [flag] });

  const updateTokenPrice = (newPrice) =>
    writeContract({
      abi,
      address,
      functionName: "updateTokenPrice",
      args: [newPrice],
    });

  const emergencyWithdraw = () =>
    writeContract({ abi, address, functionName: "emergencyWithdraw" });

  return {
    // reads
    useGetLatestETHPrice,
    useGetTokenBalance,
    useGetUSDTBalance,
    useGetETHBalance,
    useGgetTokenPrice,
    useGetPauseStatus,
    useGetTotalTokensSold,
    // writes
    buyTokens,
    buyTokensWithETH,
    withdrawFunds,
    withdrawETH,
    withdrawRemainingTokens,
    pause,
    updateTokenPrice,
    emergencyWithdraw,

    // tx state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
