require("dotenv").config();
const Web3 = require("web3");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load smart contract ABI
const contractABI = require("../artifacts/contracts/FlashLoanArbitrage.sol/FlashLoanArbitrage.json").abi;

// ENV
const INFURA_KEY = process.env.INFURA_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALERT_EMAIL = process.env.ALERT_EMAIL;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TO_EMAIL = process.env.TO_EMAIL;

// Web3 Providers
const web3BSC = new Web3("https://bsc-dataseed.binance.org/");
const web3ETH = new Web3(`https://mainnet.infura.io/v3/${INFURA_KEY}`);

// Wallet and contract setup
const wallet = new ethers.Wallet(PRIVATE_KEY, new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`));
const contractAddress = "0xYourFlashLoanContractAddress"; // Replace after deployment
const arbitrageContract = new ethers.Contract(contractAddress, contractABI, wallet);

// Pair addresses (WETH/DAI for example)
const pancakePair = "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0";
const uniswapPair = "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940";

// Email setup
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ALERT_EMAIL,
    pass: EMAIL_PASS,
  },
});

// Get price from DexScreener
async function getPrice(pairAddress, chain) {
  try {
    const url = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`;
    const res = await axios.get(url);
    const price = parseFloat(res.data.pair.priceUsd);
    return price;
  } catch (err) {
    console.error(`❌ Error fetching ${chain} price:`, err.message);
    return null;
  }
}

// Send email alert
async function sendEmail(subject, content) {
  try {
    await mailer.sendMail({
      from: `"Arbitrage Bot" <${ALERT_EMAIL}>`,
      to: TO_EMAIL,
      subject,
      text: content,
    });
    console.log("📧 Email sent:", subject);
  } catch (e) {
    console.error("📛 Failed to send email:", e.message);
  }
}

// Arbitrage check + execution
async function checkAndExecuteArbitrage() {
  const pricePancake = await getPrice(pancakePair, "bsc");
  const priceUniswap = await getPrice(uniswapPair, "ethereum");

  if (!pricePancake || !priceUniswap) return;

  const spread = priceUniswap - pricePancake;
  const spreadPercent = (spread / pricePancake) * 100;

  console.log(`🟡 Pancake: $${pricePancake.toFixed(4)} | 🟣 Uniswap: $${priceUniswap.toFixed(4)}`);
  console.log(`📈 Spread: ${spread.toFixed(4)} (${spreadPercent.toFixed(2)}%)`);

  const THRESHOLD = 1.0; // Customize

  if (spreadPercent >= THRESHOLD) {
    const msg = `🚀 Arbitrage Opportunity Detected!
Buy from PancakeSwap at $${pricePancake.toFixed(4)}, sell on Uniswap at $${priceUniswap.toFixed(4)}
Spread: ${spread.toFixed(4)} | %: ${spreadPercent.toFixed(2)}%`;

    await sendEmail("🚨 Arbitrage Opportunity!", msg);

    // 🚀 Execute trade using your smart contract
    try {
      const tx = await arbitrageContract.executeArbitrage(); // Call your method
      console.log("✅ Trade executed:", tx.hash);
    } catch (err) {
      console.error("❌ Execution error:", err.message);
    }
  } else {
    console.log("🔍 No opportunity found.");
  }
}

// Loop every 30s
setInterval(checkAndExecuteArbitrage, 30000);