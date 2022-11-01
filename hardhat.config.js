// small flavor garment injury warm earn mail grief assist over welcome flat


require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "mainnet",
  networks: {
    hardhat: {
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${PROCESS.ENV.ALCHEMY_API_KEY_GOERLI}`,
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${PROCESS.ENV.ALCHEMY_API_KEY}`,
      accounts: [`${PROCESS.ENV.PRIVATE_KEY}`]
    }
  },
  solidity: "0.8.4",
};
