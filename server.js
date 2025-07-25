// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const tradingViewWebhook = require("./webhooks/tradingview");

const app = express();
app.use(bodyParser.json());
app.use("/tradingview", tradingViewWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
