// utils/smartProfitChecker.js

const axios = require("axios");

const ONE_INCH_CHAIN_ID = 1; // Ethereum mainnet

const delay = ms => new Promise(res => setTimeout(res, ms));

async function get1inchTokenPrice(tokenAddress) {
  try {
    const url = `https://api.1inch.dev/price/v1.1/${ONE_INCH_CHAIN_ID}?tokens=${tokenAddress}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`
      }
    });
    return parseFloat(res.data[tokenAddress]);
  } catch (err) {
    console.error(`🔴 Failed to fetch 1inch price for ${tokenAddress}:`, err.message);
    return null;
  }
}

async function getCoinGeckoPrice(tokenId) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`;
    const res = await axios.get(url);
    return res.data[tokenId].usd;
  } catch (err) {
    console.error(`🔴 Failed to fetch CoinGecko price for ${tokenId}:`, err.message);
    return null;
  }
}

async function getQuoteAmount(tokenIn, tokenOut, amount) {
  try {
    const url = `https://api.1inch.dev/swap/v5.2/${ONE_INCH_CHAIN_ID}/quote?src=${tokenIn}&dst=${tokenOut}&amount=${amount}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`
      }
    });
    return res.data.toTokenAmount;
  } catch (err) {
    console.error("🔴 Quote API failed:", err.message);
    return null;
  }
}

async function checkSmartProfit({ tokenIn, tokenOut, amount, tokenOutCoingeckoId }) {
  console.log(`🧠 Checking arbitrage for ${tokenIn} -> ${tokenOut}...`);

  const fastPrice = await get1inchTokenPrice(tokenOut);
  if (!fastPrice) return 0;

  const quotedAmount = await getQuoteAmount(tokenIn, tokenOut, amount);
  if (!quotedAmount) return 0;

  const tokenOutPrice = await getCoinGeckoPrice(tokenOutCoingeckoId);
  if (!tokenOutPrice) return 0;

  const receivedUSD = (quotedAmount / 1e18) * tokenOutPrice;
  const inputUSD = (amount / 1e18) * fastPrice;

  const profit = receivedUSD - inputUSD;

  if (profit > 0) {
    console.log(`💰 PROFIT DETECTED: +$${profit.toFixed(4)} | Input: $${inputUSD.toFixed(4)} | Output: $${receivedUSD.toFixed(4)}`);
  } else {
    console.log(`❌ No profit. Input: $${inputUSD.toFixed(4)} | Output: $${receivedUSD.toFixed(4)}`);
  }

  return profit;
}

module.exports = {
  checkSmartProfit
};