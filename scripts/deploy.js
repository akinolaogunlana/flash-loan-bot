// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const FlashLoanArbitrage = await hre.ethers.getContractFactory("FlashLoanArbitrage");
  const contract = await FlashLoanArbitrage.deploy("AAVE_POOL_ADDRESS");

  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
