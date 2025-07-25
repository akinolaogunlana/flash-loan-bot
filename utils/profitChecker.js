const axios = require("axios");

async function get1inchQuote(tokenIn, tokenOut, amount) {
  const url = `https://api.1inch.dev/swap/v5.2/1/quote?src=${tokenIn}&dst=${tokenOut}&amount=${amount}`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
      },
    });

    const toTokenAmount = parseFloat(res.data.toTokenAmount);
    return toTokenAmount;
  } catch (err) {
    console.error("🛑 Error fetching 1inch quote:", err.message);
    return null;
  }
}

async function getCoinGeckoPrice(geckoId) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`;
    const res = await axios.get(url);
    return res.data[geckoId]?.usd || null;
  } catch (err) {
    console.error("🛑 Error fetching CoinGecko price:", err.message);
    return null;
  }
}

async function checkProfit(tokenIn, tokenOut, amount, geckoIdOut) {
  const oneInchQuote = await get1inchQuote(tokenIn, tokenOut, amount);
  const coingeckoPrice = await getCoinGeckoPrice(geckoIdOut);

  if (!oneInchQuote || !coingeckoPrice) {
    console.log("❌ Could not fetch required data.");
    return;
  }

  const amountInUSD = amount / 1e18;
  const oneInchToTokenInUSD = oneInchQuote / 1e18 * coingeckoPrice;
  const profit = oneInchToTokenInUSD - amountInUSD;
  const profitPercent = (profit / amountInUSD) * 100;

  console.log(`💰 Estimated Profit: $${profit.toFixed(4)} (${profitPercent.toFixed(2)}%)`);
}

module.exports = { checkProfit };

// For manual test
if (require.main === module) {
  const tokenIn = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH
  const tokenOut = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
  const amount = 1e18; // 1 ETH
  const geckoIdOut = "dai";

  checkProfit(tokenIn, tokenOut, amount, geckoIdOut);
}
