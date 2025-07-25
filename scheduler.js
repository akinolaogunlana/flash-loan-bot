// scheduler.js
require("dotenv").config();
const cron = require("node-cron");
const { runArbitrageStrategy } = require("./strategies/arbitrage1");

// Schedule every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running arbitrage strategy scan at", new Date().toLocaleString());
  await runArbitrageStrategy();
});
