import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0x127872b7Dcf6365C94E39E056e812334777dD19A"),
  ADMIN_MANAGER: checksumAddress("0xF8Ffc7B66069C27001642bc841954484723A4e3D"),
  MOCK_USDT: checksumAddress("0x676f43056D975eE197D418557764476FA5d8a1B1"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0x7527e14b11681C9748e24D50885E2a1327A0b8ca"),
  TOKEN_STACKING: checksumAddress("0x15cAE8B90302C505B68F715fc8ca50f10B7C3B8e"), 
};
