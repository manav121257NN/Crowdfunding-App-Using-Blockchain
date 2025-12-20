const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Crowdfunding contract...");

  // Get contract factory
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");

  // Deploy contract
  const crowdfunding = await Crowdfunding.deploy();

  // Wait for deployment to be mined
  await crowdfunding.waitForDeployment();

  // Get deployed address
  const contractAddress = await crowdfunding.getAddress();

  console.log("✅ Crowdfunding deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
}

// Execute deployment
main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
