// src/hooks/useAdminManagerContract.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import CONTRACT_ABIS from "../utils/web3intraction/constants/contract_abi";
import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";

const abi = CONTRACT_ABIS.ADMIN_MANAGER;
const address = CONTRACT_ADDRESS.ADMIN_MANAGER as `0x${string}`;

export function useAdminManagerContract() {
  // Separate transaction states for each operation
  const { writeContract: writeAddAdmin, data: addAdminHash, isPending: addAdminPending, error: addAdminError } = useWriteContract();
  const { writeContract: writeRemoveAdmin, data: removeAdminHash, isPending: removeAdminPending, error: removeAdminError } = useWriteContract();
  const { writeContract: writeChangeSuperAdmin, data: changeSuperAdminHash, isPending: changeSuperAdminPending, error: changeSuperAdminError } = useWriteContract();

  // Transaction receipts for each operation
  const { isLoading: addAdminConfirming, isSuccess: addAdminConfirmed } =
    useWaitForTransactionReceipt({ hash: addAdminHash });
  const { isLoading: removeAdminConfirming, isSuccess: removeAdminConfirmed } =
    useWaitForTransactionReceipt({ hash: removeAdminHash });
  const { isLoading: changeSuperAdminConfirming, isSuccess: changeSuperAdminConfirmed } =
    useWaitForTransactionReceipt({ hash: changeSuperAdminHash });

  // ----------- Reads ------------
  const useSuperAdmin = () =>
    useReadContract({ abi, address, functionName: "superAdmin" });

  const useAddressExists = (account: `0x${string}`) =>
    useReadContract({
      abi,
      address,
      functionName: "addressExists",
      args: [account],
    });

  const useGetAdmins = () =>
    useReadContract({ abi, address, functionName: "getAdmins" });

  // ----------- Writes ------------
  const addAdmin = (newAdmin: `0x${string}`) =>
    writeAddAdmin({ abi, address, functionName: "addAdmin", args: [newAdmin] });

  const removeAdmin = (admin: `0x${string}`) =>
    writeRemoveAdmin({ abi, address, functionName: "removeAdmin", args: [admin] });

  const changeSuperAdmin = (newSuperAdmin: `0x${string}`) =>
    writeChangeSuperAdmin({
      abi,
      address,
      functionName: "changeSuperAdmin",
      args: [newSuperAdmin],
    });

  return {
    // reads
    useSuperAdmin,
    useAddressExists,
    useGetAdmins,
    // writes
    addAdmin,
    removeAdmin,
    changeSuperAdmin,

    // tx state for add admin
    addAdminHash,
    addAdminPending,
    addAdminConfirming,
    addAdminConfirmed,
    addAdminError,

    // tx state for remove admin
    removeAdminHash,
    removeAdminPending,
    removeAdminConfirming,
    removeAdminConfirmed,
    removeAdminError,

    // tx state for change super admin
    changeSuperAdminHash,
    changeSuperAdminPending,
    changeSuperAdminConfirming,
    changeSuperAdminConfirmed,
    changeSuperAdminError,

    // Legacy tx state (keeping for backward compatibility)
    hash: addAdminHash,
    isPending: addAdminPending,
    isConfirming: addAdminConfirming,
    isConfirmed: addAdminConfirmed,
    error: addAdminError,
  };
}
