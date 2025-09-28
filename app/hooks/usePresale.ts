// import { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import { useContract } from "./useContract";
// import { useAppKitAccount } from "@reown/appkit/react";

// export const usePresale = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [presaleData, setPresaleData] = useState({
//     tokenPrice: "0",
//     totalTokensSold: "0",
//     availableTokens: "0",
//     totalSupply: "0",
//     ethPrice: "0",
//     userTokenBalance: "0",
//     contractTokenBalance: "0",
//     contractETHBalance: "0",
//   });

//   const {
//     buyTokensWithETH,
//     buyTokensWithUSDT,
//     getTokenPrice,
//     getTotalTokensSold,
//     getTokenBalance,
//     getETHBalance,
//     getUserTokenBalance,
//     getTotalSupply,
//     getLatestETHPrice,
//     isConnected,
//     address,
//     getChainEthPrice,
//     contracts,
//   } = useContract();

//   // Fetch all presale data
//   const fetchPresaleData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [
//         tokenPrice,
//         totalTokensSold,
//         // tokenStats,
//         contractTokenBalance,
//         contractETHBalance,
//         chainEthPriceData,
//         totalSupply,
//         userTokenBalance,
//       ] = await Promise.all([
//         getTokenPrice(),
//         getTotalTokensSold(),
//         // getTokenStats(),
//         getTokenBalance(),
//         getETHBalance(),
//         getChainEthPrice(), // <-- use the new function
//         getTotalSupply(),
//         isConnected ? getUserTokenBalance() : Promise.resolve("0"),
//       ]);

//       // const totalSupply2 = tokenStats ? tokenStats.currentSupply : "0";
      
//       const availableTokens = contractTokenBalance
//         ? ethers.formatEther(contractTokenBalance)
//         : "0";
//       3; // Handle chainEthPriceData shape: [price, decimals]
//       let formattedEthPrice = "0";
//       if (chainEthPriceData && Array.isArray(chainEthPriceData)) {
//         const [price, decimals] = chainEthPriceData;
//         formattedEthPrice = ethers.formatUnits(price, decimals);
//       }
//       setPresaleData({
//         tokenPrice: tokenPrice ? ethers.formatUnits(tokenPrice, 6) : "0", // USDT has 6 decimals
//         totalTokensSold: totalTokensSold
//           ? ethers.formatEther(totalTokensSold)
//           : "0",
//         availableTokens,
//         totalSupply: totalSupply ? ethers.formatEther(totalSupply) : "0",
//         ethPrice: formattedEthPrice, // <-- use the formatted value
//         userTokenBalance: userTokenBalance
//           ? ethers.formatEther(userTokenBalance)
//           : "0",
//         contractTokenBalance: contractTokenBalance
//           ? ethers.formatEther(contractTokenBalance)
//           : "0",
//         contractETHBalance: contractETHBalance
//           ? ethers.formatEther(contractETHBalance)
//           : "0",
//       });
//     } catch (err) {
//       console.error("Error fetching presale data:", err);
//       setError(
//         err instanceof Error ? err.message : "Failed to fetch presale data"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Buy tokens with ETH
//   const purchaseTokensWithETH = async (tokenAmount: number) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Calculate ETH amount needed
//       const tokenPriceUSD = parseFloat(presaleData.tokenPrice);
//       const ethPriceUSD = parseFloat(presaleData.ethPrice);
//       const usdAmount = tokenAmount * 0.1; // $0.10 per token
//       const ethAmount = usdAmount / ethPriceUSD;

//       const tx = await buyTokensWithETH(ethAmount.toString());

//       // Refresh data after successful purchase
//       await fetchPresaleData();

//       return tx;
//     } catch (err) {
//       console.error("Error purchasing tokens with ETH:", err);
//       setError(
//         err instanceof Error ? err.message : "Failed to purchase tokens"
//       );
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Buy tokens with USDT
//   const purchaseTokensWithUSDT = async (tokenAmount: number) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const usdtAmount = tokenAmount * 0.1; // $0.10 per token

//       const tx = await buyTokensWithUSDT(usdtAmount.toString());

//       // Refresh data after successful purchase
//       await fetchPresaleData();

//       return tx;
//     } catch (err) {
//       console.error("Error purchasing tokens with USDT:", err);
//       setError(
//         err instanceof Error ? err.message : "Failed to purchase tokens"
//       );
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate payment amount for given token amount
//   const calculatePaymentAmount = (
//     tokenAmount: number,
//     currency: "ETH" | "USDT"
//   ) => {
//     const usdAmount = tokenAmount * 0.1; // $0.10 per token

//     if (currency === "USDT") {
//       return usdAmount.toFixed(2);
//     } else {
//       const ethPriceUSD = parseFloat(presaleData.ethPrice);
//       if (ethPriceUSD === 0) return "0";
//       return (usdAmount / ethPriceUSD).toFixed(6);
//     }
//   };

//   // Calculate sale progress percentage
//   const getSaleProgress = () => {
//     const totalSold = parseFloat(presaleData.totalTokensSold);
//     const totalSupply = parseFloat(presaleData.totalSupply);
//     if (totalSupply === 0) return 0;
//     return (totalSold / totalSupply) * 100;
//   };

//   // Fetch data on mount and when connected
//   useEffect(() => {
//     // Wait until public contracts are initialized before first fetch
//     if (!contracts || !contracts.icoContract || !contracts.token) return;

//     fetchPresaleData();

//     // Set up interval to refresh data every 30 seconds
//     const interval = setInterval(fetchPresaleData, 30000);

//     return () => clearInterval(interval);
//   }, [isConnected, contracts]);

//   return {
//     loading,
//     error,
//     presaleData,
//     fetchPresaleData,
//     purchaseTokensWithETH,
//     purchaseTokensWithUSDT,
//     calculatePaymentAmount,
//     getSaleProgress,
//     isConnected,
//     address,
//   };
// };
