import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import CONTRACT_ABIS from "../utils/web3intraction/constants/contract_abi";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";

const abi = CONTRACT_ABIS.MOCK_USDC;
const address = CONTRACT_ADDRESS.MOCK_USDC as `0x${string}`;

export function useMockUSDCContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // ----------- Reads ------------
  const useAllowance = (owner: `0x${string}`, spender: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "allowance",
      args: [owner, spender],
    });

  const useBalanceOf = (account: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "balanceOf",
      args: [account],
    });

  const useDecimals = () => useReadContract({ abi, address, functionName: "decimals" });

  const useSymbol = () => useReadContract({ abi, address, functionName: "symbol" });

  const useName = () => useReadContract({ abi, address, functionName: "name" });

  const useTotalSupply = () => useReadContract({ abi, address, functionName: "totalSupply" });

  // ----------- Writes ------------
  const approve = (spender: `0x${string}`, amount: bigint) =>
    writeContract({ abi, address, functionName: "approve", args: [spender, amount] });

  const transfer = (recipient: `0x${string}`, amount: bigint) =>
    writeContract({ abi, address, functionName: "transfer", args: [recipient, amount] });

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

  return {
    // reads
    useAllowance,
    useBalanceOf,
    useDecimals,
    useSymbol,
    useName,
    useTotalSupply,

    // writes
    approve,
    transfer,
    transferFrom,
    mint,

    // tx state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}