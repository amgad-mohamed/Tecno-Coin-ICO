import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0xD0C31Efd8187b7D3F27beFeFeE6D84c273eb55ee"),
  ADMIN_MANAGER: checksumAddress("0x7d56189364f67C9896558a64639fb69B0cc8ff98"),
  MOCK_USDT: checksumAddress("0x1Dc7517f0e7cdeD1D319de0c8E3027D085A8FF2c"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0x4774fbe376Ee97f92E3F6C4ba2Db2056b27d73A6"),
  TOKEN_STACKING: checksumAddress("0x66a0dF4abaac57F122242d726780EE81A9cACc21"), 
};
