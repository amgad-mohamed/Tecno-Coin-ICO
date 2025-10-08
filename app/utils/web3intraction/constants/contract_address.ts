import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0x21824d6eBC2A3cb47f247af0f4b3dbA37599B6cD"),
  ADMIN_MANAGER: checksumAddress("0x6455902d7CFB13D333F0C4D8d6bA3d605640326a"),
  MOCK_USDT: checksumAddress("0xf4154d54ae816A929048ee6958d2A429Be63D90a"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0xFC3cE755eD3567188704c767159143BbDE247D4D"),
  TOKEN_STACKING: checksumAddress("0xCf7DB64Ef2FeDDBEb21b44DC47C63D7396358FA8"), 
};
