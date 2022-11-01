const hre = require("hardhat");
const { runQuery } = require("./query");
require('dotenv').config()
const ethers = hre.ethers;

const privateKey = process.env.PRIVATE_KEY

async function runArrayListsPerProvider(contractWithProvider, chunks, provider, contractFunction, claimType) {
    console.log(`Running a list for ${provider}`)
    const idArray = []
    let result
    for (var i = 0; i < chunks.length; i++) {
        result = await runQuery(contractWithProvider, chunks[i], provider, contractFunction, claimType)
        idArray.push(result)
    }

    return idArray
}

async function _createAlchemyProviderForContract(contractAddress, abi) {
    const provider = await new ethers.providers.AlchemyProvider(null, process.env.ALCHEMY_KEY)
    console.log(`Alchemy: ${provider.apiKey}`)
    var wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(contractAddress, abi, wallet)
}

async function _createEtherscanProviderForContract(contractAddress, abi) {
    const provider = await new ethers.providers.EtherscanProvider(null, process.env.ALCHEMY_KEY)
    console.log(`Etherscan: ${provider.apiKey}`)
    var wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(contractAddress, abi, wallet)
}

async function _createInfuraProviderForContract(contractAddress, abi) {
    const provider = await new ethers.providers.InfuraProvider(null, process.env.INFURA_KEY)
    console.log(`Infura: ${provider.apiKey}`)
    var wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(contractAddress, abi, wallet)
}




function _getProviderEmoji(provider) {
    if (provider === "infura"){
        return "🦊"
    }
    if(provider === "alchemy") {
        return "👻"
    }

    throw `Provider ${provider} is not defined, please configure it first`;
}

module.exports = {
    createAlchemyProviderForContract: _createAlchemyProviderForContract,
    createInfuraProviderForContract: _createInfuraProviderForContract,
    createEtherscanProviderForContract:_createEtherscanProviderForContract,
    getProviderEmoji: _getProviderEmoji,
    runArrayListsPerProvider:runArrayListsPerProvider
}

