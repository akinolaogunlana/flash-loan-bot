// utils/profitChecker.js
const axios = require("axios");

async function checkProfit(tokenIn, tokenOut, amount) {
  const url = `https://api.1inch.dev/swap/v5.2/1/quote?src=${tokenIn}&dst=${tokenOut}&amount=${amount}`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}` // if needed
      }
    });
    const profit = res.data.toTokenAmount - amount;
    return profit;
  } catch (err) {
    console.error("🛑 Error checking profit:", err.message);
    return 0;
  }
}

module.exports = { checkProfit };
