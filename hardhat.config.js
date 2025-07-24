require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
