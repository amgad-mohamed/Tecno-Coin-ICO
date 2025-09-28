import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from "@reown/appkit/networks";

// Get projectId from https://cloud.reown.com
export const projectId = `${process.env.NEXT_PUBLIC_REOWN_PROJECT_ID}`

if (!projectId) {
  throw new Error('Project ID is not defined')
}

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

export const networks = [ mainnet, sepolia ]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig