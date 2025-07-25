require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const logToFile = args.includes("--log");

function log(message) {
  const timestamp = new Date().toISOString();
  const output = `[${timestamp}] ${message}`;
  console.log(output);
  if (logToFile) {
    fs.appendFileSync(path.join(__dirname, "../arbitrage.log"), output + "\n");
  }
}

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || args.find((a) => a.startsWith("--contract="))?.split("=")[1];
  const tokenAddress = process.env.TOKEN_ADDRESS || args.find((a) => a.startsWith("--token="))?.split("=")[1];
  const amountValue = process.env.TRADE_AMOUNT || args.find((a) => a.startsWith("--amount="))?.split("=")[1];
  const gasLimit = args.find((a) => a.startsWith("--gas="))?.split("=")[1] || "400000";

  if (!contractAddress || !amountValue) {
    log("Missing CONTRACT_ADDRESS or TRADE_AMOUNT.");
    return;
  }

  log(`Preparing arbitrage trade on ${contractAddress}`);
  const contract = await hre.ethers.getContractAt("FlashLoanArbitrage", contractAddress);
  const amount = hre.ethers.utils.parseUnits(amountValue, 18);

  if (dryRun) {
    log(`[Dry Run] Would execute arbitrage with amount: ${amountValue}`);
    return;
  }

  try {
    const tx = await contract.executeArbitrage(amount, {
      gasLimit: gasLimit,
    });

    log("Transaction sent: " + tx.hash);
    await tx.wait();
    log("✅ Transaction confirmed!");
  } catch (err) {
    log("❌ Error: " + err.message);
  }
}

main().catch((err) => {
  log("❗ Script failed: " + err.message);
});