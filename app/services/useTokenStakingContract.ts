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

  const useIcoContractAddress = () =>
    useReadContract({ abi, address, functionName: "icoContractAddress" });

  // New ABI: releaseTimes(index) and releasePercents(index)
  const useReleaseTime = (index: number) =>
    useReadContract({ abi, address, functionName: "releaseTimes", args: [BigInt(index)] });

  const useReleasePercent = (index: number) =>
    useReadContract({ abi, address, functionName: "releasePercents", args: [BigInt(index)] });

  // Staking amounts
  const useTotalStakingAmount = () =>
    useReadContract({ abi, address, functionName: "totalStakingAmount" });

  const useStakingPlanAmount = () =>
    useReadContract({ abi, address, functionName: "stakingPlanAmount" });

  const useStakingStartTime = () =>
    useReadContract({ abi, address, functionName: "stakingStartTime" });

  // ----------- Writes ------------
  const setIcoContract = (ico: `0x${string}`) =>
    writeContract({ abi, address, functionName: "setIcoContract", args: [ico] });

  const updateReleasePlan = (percents: bigint[], times: bigint[]) =>
    writeContract({ abi, address, functionName: "updateReleasePlan", args: [percents, times] });

  const adminWithdraw = (to: `0x${string}`, amount: bigint) =>
    writeContract({ abi, address, functionName: "adminWithdraw", args: [to, amount] });

  const releaseTokens = () =>
    writeContract({ abi, address, functionName: "releaseTokens" });

  return {
    // reads
    useCalculateAvailableRelease,
    useTotalReleased,
    useIcoContractAddress,
    useReleaseTime,
    useReleasePercent,
    useTotalStakingAmount,
    useStakingPlanAmount,
    useStakingStartTime,

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
