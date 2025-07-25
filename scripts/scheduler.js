require("dotenv").config();
const cron = require("node-cron");
const runArbitrage = require("./runArbitrage");

// Schedule the job to run every minute
cron.schedule("* * * * *", async () => {
  console.log(`\n[${new Date().toISOString()}] Running arbitrage scan...`);
  try {
    await runArbitrage();
  } catch (err) {
    console.error("Error running arbitrage:", err.message);
  }
});
