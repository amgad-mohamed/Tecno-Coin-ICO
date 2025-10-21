// src/hooks/useTokenStakingContract.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";
import CONTRACT_ABIS from "../utils/web3intraction/constants/contract_abi";

const abi = CONTRACT_ABIS.TOKEN_STACKING;
const address = CONTRACT_ADDRESS.TOKEN_STACKING as `0x${string}`;

export function useTokenStakingContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // ----------- Reads ------------
  const useCalculateAvailableRelease = () =>
    useReadContract({ abi, address, functionName: "calculateAvailableRelease" });

  const useTotalReleased = () =>
    useReadContract({ abi, address, functionName: "totalReleased" });

  const useTotalStakingAmount = () =>
    useReadContract({ abi, address, functionName: "totalStakingAmount" });

  const useStakingPlanAmount = () =>
    useReadContract({ abi, address, functionName: "stakingPlanAmount" });

  const useStakingStartTime = () =>
    useReadContract({ abi, address, functionName: "stakingStartTime" });

  const useIcoContractAddress = () =>
    useReadContract({ abi, address, functionName: "icoContractAddress" });

  const useGetReleasesCount = () =>
    useReadContract({ abi, address, functionName: "getReleasesCount" });

  // Returns [time, price, rewardPercent]
  const useGetRelease = (index: number) =>
    useReadContract({ abi, address, functionName: "getRelease", args: [BigInt(index)] });

  // ----------- Writes ------------
  const setIcoContract = (ico: `0x${string}`) =>
    writeContract({ abi, address, functionName: "setIcoContract", args: [ico] });

  const updateReleasePlan = (
    times: bigint[],
    prices: bigint[],
    rewardPercents: bigint[]
  ) =>
    writeContract({
      abi,
      address,
      functionName: "updateReleasePlan",
      args: [times, prices, rewardPercents],
    });

  const adminWithdraw = (to: `0x${string}`, amount: bigint) =>
    writeContract({ abi, address, functionName: "adminWithdraw", args: [to, amount] });

  const releaseTokens = () =>
    writeContract({ abi, address, functionName: "releaseTokens" });

  return {
    // reads
    useCalculateAvailableRelease,
    useTotalReleased,
    useTotalStakingAmount,
    useStakingPlanAmount,
    useStakingStartTime,
    useIcoContractAddress,
    useGetReleasesCount,
    useGetRelease,

    // writes
    setIcoContract,
    updateReleasePlan,
    adminWithdraw,
    releaseTokens,

    // tx state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
