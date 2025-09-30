import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // Deploy AdminManager first
  console.log("\nDeploying AdminManager...");
  const AdminManager = await ethers.getContractFactory("AdminManager");
  const adminManager = await AdminManager.deploy();
  await adminManager.waitForDeployment();
  const adminManagerAddress = await adminManager.getAddress();
  console.log("AdminManager deployed to:", adminManagerAddress);

  // Deploy Token
  console.log("\nDeploying Token...");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(
    "Platireum", // name
    "MEM", // symbol
    18, // decimals
    ethers.parseEther("1000000") // 1 million tokens initial supply
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // Deploy Mock USDT for local testing
  console.log("\nDeploying Mock USDT...");
  const MockUSDT = await ethers.getContractFactory("Token");
  const mockUSDT = await MockUSDT.deploy(
    "Mock USDT",
    "USDT",
    6,
    ethers.parseEther("1000000")
  );
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("Mock USDT deployed to:", mockUSDTAddress);

  // Deploy Mock Price Feed
  console.log("\nDeploying Mock Price Feed...");
  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  const mockPriceFeed = await MockPriceFeed.deploy();
  await mockPriceFeed.waitForDeployment();
  const mockPriceFeedAddress = await mockPriceFeed.getAddress();
  console.log("Mock Price Feed deployed to:", mockPriceFeedAddress);

  // Deploy ICOContract
  console.log("\nDeploying ICOContract...");
  const ICOContract = await ethers.getContractFactory("ICOContract");
  const icoContract = await ICOContract.deploy(
    mockUSDTAddress, // Use our mock USDT address
    tokenAddress, // Our token address
    ethers.parseEther("0.1"), // Initial price 0.1 USDT per token
    mockPriceFeedAddress // Mock price feed address
  );
  await icoContract.waitForDeployment();
  const icoContractAddress = await icoContract.getAddress();
  console.log("ICOContract deployed to:", icoContractAddress);

  // Print all deployment addresses
  console.log("\nDeployment Summary:");
  console.log("--------------------");
  console.log("AdminManager:", adminManagerAddress);
  console.log("Token:", tokenAddress);
  console.log("Mock USDT:", mockUSDTAddress);
  console.log("Mock Price Feed:", mockPriceFeedAddress);
  console.log("ICOContract:", icoContractAddress);

  // Setup initial configuration
  console.log("\nSetting up initial configuration...");

  // Approve ICO contract to spend Mock USDT (for testing)
  console.log("Approving ICO contract to spend Mock USDT...");
  const approveTx = await mockUSDT.approve(
    icoContractAddress,
    ethers.parseEther("1000000")
  );
  const receipt = await approveTx;

  console.log("\nDeployment and configuration completed successfully!");

  // Save the contract addresses to a file
  const fs = require("fs");
  const addresses = {
    adminManager: adminManagerAddress,
    token: tokenAddress,
    mockUSDT: mockUSDTAddress,
    mockPriceFeed: mockPriceFeedAddress,
    icoContract: icoContractAddress,
  };

  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nContract addresses saved to contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
