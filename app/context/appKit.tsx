"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { ReactNode } from "react";
import { wagmiAdapter, projectId } from "../../config";
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. Get projectId at https://cloud.reown.com
// const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const queryClient = new QueryClient()

if (!projectId) throw new Error("Project ID is not defined");

// 2. Create a metadata object
const metadata = {
  name: "Platireum Token Presale",
  description:
    "Join our exclusive presale phase and be among the first to acquire PLT tokens.",
  url: "https://platireum.com",
  icons: ["https://avatars.platireum.com/"],
};

// 3. Create the ethers adapter
const ethersAdapter = new EthersAdapter();

// 4. Define custom localhost network
// const hardhatLocal = {
//   id: 31337,
//   name: "Hardhat",
//   network: "hardhat",
//   nativeCurrency: {
//     name: "Ethereum",
//     symbol: "ETH",
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ["http://127.0.0.1:8545"],
//     },
//     public: {
//       http: ["http://127.0.0.1:8545"],
//     },
//   },
// };

// 5. Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, sepolia],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: true,
  },
});

interface AppKitProviderProps {
  children: ReactNode;
}

export function AppKitProvider({
  children,
}: {
  children: ReactNode;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
