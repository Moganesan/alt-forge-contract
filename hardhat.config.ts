import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition-viem";
import "@nomiclabs/hardhat-waffle";
import dotenv from "dotenv";
dotenv.config();

const SEPOLIA_PRIVATE_KEY: string | undefined =
  process.env.SEPOLIA_ACCOUNT_PRIVATE_KEY;
const config: HardhatUserConfig = {
  networks: {
    polygon: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        "a398e538b2a032cac4f05357080b03acca3b1510e52c65db27f58a89228fb140",
      ],
    },
    sepolia: {
      url: "https://1rpc.io/sepolia",
      accounts: SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : [],
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

export default config;
