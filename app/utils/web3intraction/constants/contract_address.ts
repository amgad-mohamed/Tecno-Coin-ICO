import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0xd0e528E7B9F7DE80f752715D1bc4827AE6439A6D"),
  ADMIN_MANAGER: checksumAddress("0xb6EBc2AE9F7A3007AFE155df5508C42798Ef5D64"),
  MOCK_USDT: checksumAddress("0xf56127E906D3689F4f4AC6F8E5fcBCCF474A8a08"),
  MOCK_USDC: checksumAddress("0x3fefD5B9F2a3EfA43976964f73CE6cafdfD3eE83"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0xdBC7B90D91cEE95076D7BfCAA5e0f63d5177DCaA"),
  TOKEN_STACKING: checksumAddress("0xFB46f79ee97b9c1D16ea79Ca5Fb18F66ff89CC4d"), 
};
