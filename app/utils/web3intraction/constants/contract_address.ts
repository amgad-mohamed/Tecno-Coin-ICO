import { getAddress } from "ethers";

// Helper function to ensure addresses are properly checksummed
const checksumAddress = (address: string) => getAddress(address);

export const CONTRACT_ADDRESS = {
  TOKEN: checksumAddress("0x2EcE74882071E22ce686Da1bbb9D72746Cf5Ea75"),
  ADMIN_MANAGER: checksumAddress("0x6455902d7CFB13D333F0C4D8d6bA3d605640326a"),
  MOCK_USDT: checksumAddress("0x20FcA0af658a24948137D833B8F1a8DD5Ab15C34"),
  MOCK_PRICE_FEED: checksumAddress(
    "0x7ED5addb41671Af2886D2EB1b3380ee6C8778446"
  ),
  ICO_CONTRACT: checksumAddress("0x57Fd568D99154022D524905D3832Ee417AA4F649"),
  TOKEN_STACKING: checksumAddress("0x15cAE8B90302C505B68F715fc8ca50f10B7C3B8e"), 
};
