import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0x5b1a14e219ca13e36D368Ef59b2600f1C6dAE37d"),
  ADMIN_MANAGER: checksumAddress("0xb6EBc2AE9F7A3007AFE155df5508C42798Ef5D64"),
  MOCK_USDT: checksumAddress("0xf56127E906D3689F4f4AC6F8E5fcBCCF474A8a08"),
  MOCK_USDC: checksumAddress("0x3fefD5B9F2a3EfA43976964f73CE6cafdfD3eE83"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0x48f3E8b3a93C3d87E124994bde8EDEc981978d8c"),
  TOKEN_STACKING: checksumAddress("0x40e88A691170d3CfEE22e1627e2B45427f5F1b6E"), 
};
