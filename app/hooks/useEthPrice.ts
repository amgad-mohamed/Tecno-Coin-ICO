// import { useState, useEffect } from "react";
// import { ethers } from "ethers";

// // Chainlink ETH/USD Price Feed address on Ethereum Mainnet
// const PRICE_FEED_ADDRESS = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

// // AggregatorV3Interface ABI for price feeds
// const aggregatorV3InterfaceABI = [
//   {
//     inputs: [],
//     name: "latestRoundData",
//     outputs: [
//       { internalType: "uint80", name: "roundId", type: "uint80" },
//       { internalType: "int256", name: "answer", type: "int256" },
//       { internalType: "uint256", name: "startedAt", type: "uint256" },
//       { internalType: "uint256", name: "updatedAt", type: "uint256" },
//       { internalType: "uint80", name: "answeredInRound", type: "uint80" },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
// ];

// export const useEthPrice = () => {
//   const [price, setPrice] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPrice = async () => {
//       try {
//         // Connect to Ethereum mainnet
//         const provider = new ethers.JsonRpcProvider(
//           "https://ethereum-rpc.publicnode.com"
//         );

//         // Create contract instance
//         const priceFeed = new ethers.Contract(
//           PRICE_FEED_ADDRESS,
//           aggregatorV3InterfaceABI,
//           provider
//         );

//         // Get latest price
//         const roundData = await priceFeed.latestRoundData();

//         // Chainlink price feeds for ETH/USD have 8 decimals
//         const price = Number(roundData.answer) / 1e8;

//         setPrice(price);
//         setLoading(false);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching ETH price:", err);
//         setError("Failed to fetch ETH price");
//         setLoading(false);
//         // Fallback price if the fetch fails
//         setPrice(3500);
//       }
//     };

//     fetchPrice();

//     // Fetch price every minute
//     const interval = setInterval(fetchPrice, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   return { price, loading, error };
// };
