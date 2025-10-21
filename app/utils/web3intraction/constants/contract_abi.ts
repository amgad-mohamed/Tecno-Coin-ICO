import ICOContractABI from './abis/ICOContract.json';
import TokenABI from './abis/Token.json';
import AdminManagerABI from './abis/AdminManager.json';
import MockPriceFeedABI from './abis/MockPriceFeed.json';
import TokenStaking from './abis/TokenStaking.json';
import MockUSDT from './abis/MockUSDT.json';
import MockUSDC from './abis/MockUSDC.json';

export const CONTRACT_ABIS = {
  ICO_CONTRACT: ICOContractABI.abi,
  TOKEN: TokenABI.abi,
  ADMIN_MANAGER: AdminManagerABI.abi,
  MOCK_PRICE_FEED: MockPriceFeedABI.abi,
  TOKEN_STACKING: TokenStaking.abi,
  MOCK_USDT: MockUSDT.abi,
  MOCK_USDC: MockUSDC.abi
};

export default CONTRACT_ABIS;

