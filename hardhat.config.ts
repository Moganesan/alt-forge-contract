import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  networks: {
    polygon: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        "a398e538b2a032cac4f05357080b03acca3b1510e52c65db27f58a89228fb140",
      ],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
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
