import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0x24b8AEf7deda047809eC22A8cEA568B1FabE08f7"),
  ADMIN_MANAGER: checksumAddress("0xb6EBc2AE9F7A3007AFE155df5508C42798Ef5D64"),
  MOCK_USDT: checksumAddress("0xf56127E906D3689F4f4AC6F8E5fcBCCF474A8a08"),
  MOCK_USDC: checksumAddress("0x3fefD5B9F2a3EfA43976964f73CE6cafdfD3eE83"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0xf523011F2a9EE66DaAc71A47d659646301B4DC5a"),
  TOKEN_STACKING: checksumAddress("0xda5C4691CCfA6aB3157c13C9905cD8d358cf336c"), 
};
