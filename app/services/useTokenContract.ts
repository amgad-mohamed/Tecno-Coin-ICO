// src/hooks/useTokenContract.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import CONTRACT_ABIS from "../utils/web3intraction/constants/contract_abi";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";

const abi = CONTRACT_ABIS.TOKEN;

export function useTokenContract(tokenAddress?: `0x${string}`) {
  const address = (tokenAddress ?? (CONTRACT_ADDRESS.TOKEN as `0x${string}`)) as `0x${string}`;
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // ----------- Reads ------------
  const useTotalSupply = () =>
    useReadContract({ abi, address, functionName: "totalSupply" });

  const useBalanceOf = (account: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "balanceOf",
      args: [account],
    });

  const useAllowance = (owner: `0x${string}`, spender: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "allowance",
      args: [owner, spender],
    });

  const useGetTokenStats = () =>
    useReadContract({ abi, address, functionName: "getTokenStats" });

  // ----------- Writes ------------
  const transfer = (recipient: `0x${string}`, amount: bigint) =>
    writeContract({
      abi,
      address,
      functionName: "transfer",
      args: [recipient, amount],
    });

  const approve = (spender: `0x${string}`, amount: bigint) =>
    writeContract({
      abi,
      address,
      functionName: "approve",
      args: [spender, amount],
    });

  const transferFrom = (
    sender: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint
  ) =>
    writeContract({
      abi,
      address,
      functionName: "transferFrom",
      args: [sender, recipient, amount],
    });

  const mint = (amount: bigint) =>
    writeContract({ abi, address, functionName: "mint", args: [amount] });

  const burn = (amount: bigint) =>
    writeContract({ abi, address, functionName: "burn", args: [amount] });

  return {
    // reads
    useTotalSupply,
    useBalanceOf,
    useAllowance,
    useGetTokenStats,
    
    // writes
    transfer,
    approve,
    transferFrom,
    mint,
    burn,

    // tx state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
