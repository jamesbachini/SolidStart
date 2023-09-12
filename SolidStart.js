const fs = require('fs');
const { exec } = require('child_process');

const version = '𝕊𝕠𝕝𝕚𝕕𝕊𝕥𝕒𝕣𝕥 v0.0.2';

// Please ensure you have NodeJS and Rust installed on your system

// Do not use production keys here, even testnet funds will go missing
const dotEnv = `USER1_PRIVATE_KEY=0x2454a049ee1ea9e2757f7e4e122486a9c7bf28387c79c3d186e935b605312f5e
USER2_PRIVATE_KEY=0x22b0f1b4079ba0fef84a2aaf38733dfd59194a1b52f6a4c0d2e606aedaa2b3c2
ALCHEMY_API_KEY=https://alchemy.com
INFURA_API_KEY=https://www.infura.io
ETHERSCAN_API_KEY=https://etherscan.io
`;

const hardhatConfig = `require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.21", settings: { evmVersion: 'paris'} },
      { version: "0.7.6" },
      { version: "0.6.6" }
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    local: {
      url: 'http://127.0.0.1:8545',
    },
    goerli: {
      url: 'https://eth-goerli.alchemyapi.io/v2/'+process.env.ALCHEMY_API_KEY,
      accounts: [process.env.USER1_PRIVATE_KEY,process.env.USER2_PRIVATE_KEY],
    },
    sepolia: {
      url: 'https://eth-sepolia.alchemyapi.io/v2/'+process.env.ALCHEMY_API_KEY,
      accounts: [process.env.USER1_PRIVATE_KEY,process.env.USER2_PRIVATE_KEY],
    },
    arbitrumsepolia: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: [process.env.USER1_PRIVATE_KEY,process.env.USER2_PRIVATE_KEY],
    },
    mainnet: {
      url: 'https://eth-mainnet.alchemyapi.io/v2/'+process.env.ALCHEMY_API_KEY,
      accounts: [process.env.USER1_PRIVATE_KEY,process.env.USER2_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 100000000
  },
};
`;

const foundryConfig = `[profile.default]
solc-version = "0.8.21"
verbosity = 2
optimizer = true
optimizer_runs = 1000
via_ir = false
libs = ['node_modules', 'lib']
src = 'contracts'
out = 'out'
test = 'test'
cache_path = 'cache_forge'
[profile.default.optimizer_details]
constantOptimizer = true
yul = true`;

const remappings = `ds-test/=lib/forge-std/lib/ds-test/src/
forge-std/=lib/forge-std/src/`;

const gitIgnore = `node_modules
lib
hh.js
.env
cache
artifacts`;

const exampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Example {
    string public test = "hello world";
}`;

const hardhatTest = `const { expect } = require("chai");
describe("Unit Test", function () {
  let contract;
  async function deploy() {
    [user1, user2] = await ethers.getSigners();
    const Example = await ethers.getContractFactory("Example");
    contract = await Example.deploy();
  }
  describe("Deployment", async function () {
    it("Should deploy", async function () {
      await deploy();
      expect(await contract.test()).to.eq('hello world');
    });
  });
});`;

const foundryTest = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Test.sol";
import "contracts/Example.sol";

contract UnitTest is Test {
    Example public example;
    error SomeError(uint256);

    function setUp() public {
        example = new Example();
    }

    function testStateVariable() public {
        assertEq(example.test(), 'hello world');
    }
}`;

const finishUp = () => {
    console.log(`Hardhat and Foundry have been set up\nTry the following commands:\nnpx hardhat test\nforge test`);
}

const logging = (error, stdout, stderr) => {
  if (error) console.error(error);
  if (stderr) console.error(stderr);
  console.log(stdout);
}

const setupFoundry = () => {
    console.log('Setting up Foundry');
    // Can change the command below to "foundryup" if you have it locally which will save time
    exec(`cargo install --git https://github.com/foundry-rs/foundry --profile local forge cast chisel anvil`, (error, stdout, stderr) => {
      logging(error, stdout, stderr);
      exec(`forge install --no-git foundry-rs/forge-std`, (error2, stdout2, stderr2) => {
          logging(error2, stdout2, stderr2);
          finishUp();
      });
    });
}

const writeConfig = () => {
    fs.writeFileSync('.env', dotEnv);
    fs.writeFileSync('.gitignore', gitIgnore);
    fs.writeFileSync('hardhat.config.js', hardhatConfig);
    fs.writeFileSync('contracts/Example.sol', exampleContract);
    fs.writeFileSync('test/0x01-Example.js', hardhatTest);
    fs.writeFileSync('test/0x01-Example.sol', foundryTest);
    fs.writeFileSync('foundry.toml', foundryConfig);
    fs.writeFileSync('remappings.txt', remappings);
    setupFoundry();
}

const createDirectories = () => {
    fs.mkdirSync('contracts');
    fs.mkdirSync('scripts');
    fs.mkdirSync('cache');
    fs.mkdirSync('lib');
    fs.mkdirSync('artifacts');
    fs.mkdirSync('test');
    writeConfig();
}

const init = async () => {
    console.log(version, 'Installing Hardhat/Foundry Boilerplate');
    exec(`npm i hardhat dotenv @nomicfoundation/hardhat-toolbox @openzeppelin/contracts`, (error, stdout, stderr) => {
        logging(error, stdout, stderr);
        createDirectories();
    });
}
init();