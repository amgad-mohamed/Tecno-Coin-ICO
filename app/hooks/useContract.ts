// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { useAppKitAccount } from "@reown/appkit/react";
// import { CONTRACT_ADDRESS } from "../utils/web3intraction/constants/contract_address";
// import { CONTRACT_ABIS } from "../utils/web3intraction/constants/contract_abi";

// export const useContract = () => {
//   const [contracts, setContracts] = useState<{
//     icoContract: ethers.Contract | null;
//     token: ethers.Contract | null;
//     adminManager: ethers.Contract | null;
//     mockPriceFeed: ethers.Contract | null;
//   }>({
//     icoContract: null,
//     token: null,
//     adminManager: null,
//     mockPriceFeed: null,
//   });
  
//   const { address, isConnected } = useAppKitAccount();

//   useEffect(() => {
//     const initializeContracts = async () => {
//       try {
//         const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
//         const provider =
//           typeof window !== "undefined" && (window as any).ethereum
//             ? new ethers.BrowserProvider((window as any).ethereum)
//             : rpcUrl
//             ? new ethers.JsonRpcProvider(rpcUrl)
//             : ethers.getDefaultProvider();

//         const contractInstances = {
//           icoContract: new ethers.Contract(
//             CONTRACT_ADDRESS.ICO_CONTRACT,
//             CONTRACT_ABIS.ICO_CONTRACT,
//             provider
//           ),
//           token: new ethers.Contract(
//             CONTRACT_ADDRESS.TOKEN,
//             CONTRACT_ABIS.TOKEN,
//             provider
//           ),
//           adminManager: new ethers.Contract(
//             CONTRACT_ADDRESS.ADMIN_MANAGER,
//             CONTRACT_ABIS.ADMIN_MANAGER,
//             provider
//           ),
//           mockPriceFeed: new ethers.Contract(
//             CONTRACT_ADDRESS.MOCK_PRICE_FEED,
//             CONTRACT_ABIS.MOCK_PRICE_FEED,
//             provider
//           ),
//         };
//         setContracts(contractInstances);
//       } catch (error) {
//         console.error("Error initializing contracts:", error);
//       }
//     };

//     initializeContracts();
//   }, []);

//   const getSignedContracts = async () => {
//     if (!isConnected || typeof window === "undefined" || !(window as any).ethereum) {
//       throw new Error("Please connect your wallet first");
//     }

//     const provider = new ethers.BrowserProvider((window as any).ethereum);
//     const signer = await provider.getSigner();
    
//     return {
//       icoContract: new ethers.Contract(
//         CONTRACT_ADDRESS.ICO_CONTRACT,
//         CONTRACT_ABIS.ICO_CONTRACT,
//         signer
//       ),
//       token: new ethers.Contract(
//         CONTRACT_ADDRESS.TOKEN,
//         CONTRACT_ABIS.TOKEN,
//         signer
//       ),
//       adminManager: new ethers.Contract(
//         CONTRACT_ADDRESS.ADMIN_MANAGER,
//         CONTRACT_ABIS.ADMIN_MANAGER,
//         signer
//       ),
//       mockPriceFeed: new ethers.Contract(
//         CONTRACT_ADDRESS.MOCK_PRICE_FEED,
//         CONTRACT_ABIS.MOCK_PRICE_FEED,
//         signer
//       ),
//     };
//   };

//   // ICO Contract Functions
//   const buyTokensWithETH = async (ethAmount: string) => {
//     try {
//       const signedContracts = await getSignedContracts();
//       const tx = await signedContracts.icoContract.buyTokensWithETH({
//         value: ethers.parseEther(ethAmount)
//       });
//       return await tx.wait();
//     } catch (error) {
//       console.error("Error buying tokens with ETH:", error);
//       throw error;
//     }
//   };

//   const buyTokensWithUSDT = async (usdtAmount: string) => {
//     try {
//       const signedContracts = await getSignedContracts();
//       const tx = await signedContracts.icoContract.buyTokens(ethers.parseUnits(usdtAmount, 6));
//       return await tx.wait();
//     } catch (error) {
//       console.error("Error buying tokens with USDT:", error);
//       throw error;
//     }
//   };

//   const getTokenPrice = async () => {
//     try {
//       if (!contracts.icoContract) return null;
//       return await contracts.icoContract.tokenPrice();
//     } catch (error) {
//       console.error("Error getting token price:", error);
//       return null;
//     }
//   };

//   const getTotalTokensSold = async () => {
//     try {
//       if (!contracts.icoContract) return null;
//       return await contracts.icoContract.totalTokensSold();
//     } catch (error) {
//       console.error("Error getting total tokens sold:", error);
//       return null;
//     }
//   };

//   const getTokenBalance = async () => {
//     try {
//       if (!contracts.icoContract) return null;
//       return await contracts.icoContract.getTokenBalance();
//     } catch (error) {
//       console.error("Error getting token balance:", error);
//       return null;
//     }
//   };

//   const getETHBalance = async () => {
//     try {
//       if (!contracts.icoContract) return null;
//       return await contracts.icoContract.getETHBalance();
//     } catch (error) {
//       console.error("Error getting ETH balance:", error);
//       return null;
//     }
//   };

//   const getRequiredETHAmount = async (tokenAmount: string) => {
//     try {
//       if (!contracts.icoContract) return null;
//       return await contracts.icoContract.getRequiredETHAmount(ethers.parseEther(tokenAmount));
//     } catch (error) {
//       console.error("Error getting required ETH amount:", error);
//       return null;
//     }
//   };

//   // Token Contract Functions
//   // const getTokenStats = async () => {
//   //   try {
//   //     if (!contracts.token) return null;
//   //     return await contracts.token.getTokenStats();
//   //   } catch (error) {
//   //     console.error("Error getting token stats:", error);
//   //     return null;
//   //   }
//   // };

//   const getUserTokenBalance = async (userAddress?: string) => {
//     try {
//       if (!contracts.token) return null;
//       const userAddr = userAddress || address;
//       if (!userAddr) return null;
//       return await contracts.token.balanceOf(userAddr);
//     } catch (error) {
//       console.error("Error getting user token balance:", error);
//       return null;
//     }
//   };

//   const getTotalSupply = async () => {
//     try {
//       if (!contracts.token) return null;
//       return await contracts.token.totalSupply();
//     } catch (error) {
//       console.error("Error getting total supply:", error);
//       return null;
//     }
//   };

//   // Price Feed Functions
//   const getLatestETHPrice = async () => {
//     try {
//       if (!contracts.mockPriceFeed) return null;
//       const priceData = await contracts.mockPriceFeed.latestRoundData();
//       return priceData.answer;
//     } catch (error) {
//       console.error("Error getting ETH price:", error);
//       return null;
//     }
//   };

//   const getChainEthPrice = async () => {
//     try {
//       if (!contracts.icoContract) return null;
//       const priceData = await contracts.icoContract.getLatestETHPrice();
//       return priceData;
//     } catch (error) {
//       console.error("Error getting chain ETH price:", error);
//       return null;
//     }
//   };

//   return {
//     contracts,
//     getSignedContracts,
//     isConnected,
//     address,
//     // ICO Functions
//     buyTokensWithETH,
//     buyTokensWithUSDT,
//     getTokenPrice,
//     getTotalTokensSold,
//     getTokenBalance,
//     getETHBalance,
//     getRequiredETHAmount,
//     // Token Functions
//     // getTokenStats,
//     getUserTokenBalance,
//     getTotalSupply,
//     // Price Feed Functions
//     getLatestETHPrice,
//     getChainEthPrice,
//   };
// };
