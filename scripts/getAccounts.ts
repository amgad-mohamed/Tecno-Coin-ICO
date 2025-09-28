const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  console.log("\nHardhat Test Accounts:");
  console.log("=====================");

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const balance = await ethers.provider.getBalance(account.address);

    console.log(`\nAccount #${i + 1}:`);
    console.log(`Address: ${account.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
