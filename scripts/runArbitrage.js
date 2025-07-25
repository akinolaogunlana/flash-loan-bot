// scripts/runArbitrage.js
const hre = require("hardhat");

async function main() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const contract = await hre.ethers.getContractAt("FlashLoanArbitrage", contractAddress);

  const token = "TOKEN_ADDRESS"; // Token to borrow
  const amount = hre.ethers.utils.parseUnits("1000", 18); // Borrow 1000 units

  const tx = await contract.executeArbitrage(amount);
  console.log("Arbitrage transaction sent:", tx.hash);
  await tx.wait();
  console.log("Transaction confirmed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
