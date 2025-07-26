// scripts/strategyRunner.js
require("dotenv").config();
const hre = require("hardhat");
const { checkSmartProfit } = require("../utils/smartProfitChecker");

const tokenPairs = [
  {
    name: "USDC/DAI",
    tokenIn: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    tokenOut: "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    tokenOutCoingeckoId: "dai"
  },
  {
    name: "WETH/USDT",
    tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    tokenOut: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    tokenOutCoingeckoId: "tether"
  }
  // Add more pairs as needed
];

const contractAddress = process.env.CONTRACT_ADDRESS;
const PROFIT_THRESHOLD = parseFloat(process.env.PROFIT_THRESHOLD || 10); // in USD
const TRADE_AMOUNT = process.env.TRADE_AMOUNT || "100"; // in tokens

async function runStrategies() {
  const contract = await hre.ethers.getContractAt("FlashLoanArbitrage", contractAddress);

  for (const pair of tokenPairs) {
    console.log(`🔍 Scanning ${pair.name}...`);
    const amount = hre.ethers.utils.parseUnits(TRADE_AMOUNT, 18); // assumes 18 decimals

    const profit = await checkSmartProfit({
      tokenIn: pair.tokenIn,
      tokenOut: pair.tokenOut,
      amount: amount.toString(),
      tokenOutCoingeckoId: pair.tokenOutCoingeckoId
    });

    if (profit > PROFIT_THRESHOLD) {
      console.log(`🚀 Profit > $${PROFIT_THRESHOLD}. Executing arbitrage for ${pair.name}...`);
      try {
        const tx = await contract.executeArbitrage(amount);
        console.log("📤 Transaction sent:", tx.hash);
        await tx.wait();
        console.log("✅ Transaction confirmed!");
      } catch (err) {
        console.error(`🛑 Error executing arbitrage: ${err.message}`);
      }
    } else {
      console.log(`⚠️ Skipping ${pair.name}. Profit ($${profit.toFixed(2)}) < threshold.`);
    }
  }
}

runStrategies().catch(console.error);