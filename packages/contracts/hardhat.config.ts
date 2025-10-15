import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatVerify, hardhatKeystore],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("ARBITRUM_SEPOLIA_INFURA_API_URL"),
      accounts: [configVariable("ARBITRUM_SEPOLIA_PRIVATE_KEY")],
      chainId: 421614,
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_V2_API_KEY"),
    },
  },
  chainDescriptors: {
    421614: {
      name: "ArbitrumSepolia",
      blockExplorers: {
        etherscan: {
          name: "ArbiscanSepolia",
          url: "https://sepolia.arbiscan.io",
          apiUrl: "https://api-sepolia.arbiscan.io/api",
        },
      },
    },
  },
};

export default config;
