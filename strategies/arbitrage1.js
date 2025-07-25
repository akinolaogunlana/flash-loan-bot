// strategies/arbitrage1.js
require("dotenv").config();
const hre = require("hardhat");
const { checkProfit } = require("../utils/profitChecker");

async function runArbitrageStrategy(token = process.env.TOKEN_ADDRESS) {
  const contract = await hre.ethers.getContractAt("FlashLoanArbitrage", process.env.CONTRACT_ADDRESS);

  const amount = hre.ethers.utils.parseUnits(process.env.TRADE_AMOUNT, 18);

  const profit = await checkProfit(token, token, amount);
  if (profit >= process.env.PROFIT_THRESHOLD) {
    console.log("✅ Profit threshold met. Executing arbitrage...");
    const tx = await contract.executeArbitrage(amount);
    console.log("🚀 Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Transaction confirmed!");
  } else {
    console.log("❌ Profit not high enough. Skipping arbitrage.");
  }
}

module.exports = { runArbitrageStrategy };
