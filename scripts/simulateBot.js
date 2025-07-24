// scripts/simulateBot.js
require("dotenv").config();
const axios = require("axios");

const ETH_RPC = process.env.ETH_RPC_URL;
const BNB_RPC = process.env.BNB_RPC_URL;

async function getPrice(pairUrl) {
  try {
    const res = await axios.get(pairUrl);
    const price = res.data.pairs[0].priceUsd;
    return parseFloat(price);
  } catch (err) {
    console.error("Price fetch failed", err);
    return null;
  }
}

async function checkArbitrage() {
  const pancakeURL = "https://api.dexscreener.com/latest/dex/pairs/bsc/0xPancakePairAddress";
  const uniswapURL = "https://api.dexscreener.com/latest/dex/pairs/ethereum/0xUniswapPairAddress";

  const [pancakePrice, uniPrice] = await Promise.all([
    getPrice(pancakeURL),
    getPrice(uniswapURL)
  ]);

  if (!pancakePrice || !uniPrice) return;

  console.log(`Pancake: $${pancakePrice} | Uniswap: $${uniPrice}`);

  const spread = Math.abs(pancakePrice - uniPrice);
  const buyLow = pancakePrice < uniPrice ? 'PancakeSwap' : 'Uniswap';
  const sellHigh = pancakePrice > uniPrice ? 'PancakeSwap' : 'Uniswap';

  if (spread > 0.5) {
    console.log(`💰 Arbitrage Opportunity! Buy on ${buyLow}, Sell on ${sellHigh}`);
    console.log(`Profit per token: ~$${spread.toFixed(4)}\n`);
    // Later: trigger executeTrade.js here
  } else {
    console.log("No arbitrage yet...\n");
  }
}

setInterval(checkArbitrage, 10 * 1000); // every 10s
