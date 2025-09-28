import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "./constants/contract_address";
import { CONTRACT_ABIS } from "./constants/contract_abi";

export const contractProvider = async (signer) => {
  try {
    // Create contract instances for all contracts
    const contracts = {
      icoContract: new ethers.Contract(
        CONTRACT_ADDRESS.ICO_CONTRACT,
        CONTRACT_ABIS.ICO_CONTRACT,
        signer
      ),
      token: new ethers.Contract(
        CONTRACT_ADDRESS.TOKEN,
        CONTRACT_ABIS.TOKEN,
        signer
      ),
      adminManager: new ethers.Contract(
        CONTRACT_ADDRESS.ADMIN_MANAGER,
        CONTRACT_ABIS.ADMIN_MANAGER,
        signer
      ),
      mockPriceFeed: new ethers.Contract(
        CONTRACT_ADDRESS.MOCK_PRICE_FEED,
        CONTRACT_ABIS.MOCK_PRICE_FEED,
        signer
      ),
    };

    return { contracts };
  } catch (error) {
    console.error("Error creating contract instances:", error);
    return { error: error.message };
  }
};
