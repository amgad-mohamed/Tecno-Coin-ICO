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

  // New: Release time getters
  const useFirstReleaseTime = () =>
    useReadContract({ abi, address, functionName: "firstReleaseTime" });

  const useSecondReleaseTime = () =>
    useReadContract({ abi, address, functionName: "secondReleaseTime" });

  const useThirdReleaseTime = () =>
    useReadContract({ abi, address, functionName: "thirdReleaseTime" });

  const useFinalReleaseTime = () =>
    useReadContract({ abi, address, functionName: "finalReleaseTime" });

  // New: Release amount getters (public constants)
  const useTotalStakingAmount = () =>
    useReadContract({ abi, address, functionName: "TOTAL_STAKING_AMOUNT" });

  const useFirstReleaseAmount = () =>
    useReadContract({ abi, address, functionName: "FIRST_RELEASE" });

  const useSecondReleaseAmount = () =>
    useReadContract({ abi, address, functionName: "SECOND_RELEASE" });

  const useThirdReleaseAmount = () =>
    useReadContract({ abi, address, functionName: "THIRD_RELEASE" });

  // ----------- Writes ------------
  const setIcoContract = (ico: `0x${string}`) =>
    writeContract({ abi, address, functionName: "setIcoContract", args: [ico] });

  const releaseTokens = () =>
    writeContract({ abi, address, functionName: "releaseTokens" });

  return {
    // reads
    useCalculateAvailableRelease,
    useTotalReleased,
    useIcoContractAddress,
    useFirstReleaseTime,
    useSecondReleaseTime,
    useThirdReleaseTime,
    useFinalReleaseTime,
    useTotalStakingAmount,
    useFirstReleaseAmount,
    useSecondReleaseAmount,
    useThirdReleaseAmount,

    // writes
    setIcoContract,
    releaseTokens,

    // tx state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
