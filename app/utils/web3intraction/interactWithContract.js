import { ethers } from "ethers";

import { contractProvider } from "./contract_provider";

/**
 * General function to interact with smart contract functions
 * @param {ethers.Contract} contract - The contract instance
 * @param {string} functionName - The name of the contract function to call
 * @param {Array} params - Array of parameters to pass to the contract function
 * @returns {Object} The data returned by the contract function or an error
 */
export const interactWithContract = async (
  contract,
  functionName,
  params = []
) => {
  try {
    if (!contract) {
      throw new Error("Contract instance is required");
    }

    // Dynamically call the contract function with parameters
    const result = await contract[functionName](...params);
    console.log(`${functionName} result:`, result);

    return { data: result };
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    return { error: error.message };
  }
};
