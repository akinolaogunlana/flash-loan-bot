// webhooks/tradingview.js
const express = require("express");
const router = express.Router();
const { runArbitrageStrategy } = require("../strategies/arbitrage1");

router.post("/webhook", async (req, res) => {
  const alertData = req.body;
  console.log("📡 TradingView Signal Received:", alertData);

  // Optionally validate alertData
  if (alertData && alertData.token && alertData.action === "arbitrage") {
    await runArbitrageStrategy(alertData.token);
    res.sendStatus(200);
  } else {
    res.status(400).send("Invalid Signal");
  }
});

module.exports = router;
