const { runQuery } = require("./utils/query");
var providers = require('./utils/providers')
var rateLimiting = require('./utils/rateLimiting');
const { calculatePricing } = require("./utils/pricing");
const { checkLiquidityPool } = require("./utils/nftPools");

async function main() {
    // Claim NFT Contract
    const checkingContractAddress = "0xc5b52253f5225835cc81c52cdb3d6a22bc3b0c93";
    // Original NFT Contract
    const pricingContractAddress = "0xbCe3781ae7Ca1a5e050Bd9C4c77369867eBc307e"
    const abi = require('./abis/mcgoblinAbi.json')
    const contractWAlchemyProvider = await providers.createAlchemyProviderForContract(checkingContractAddress, abi)
    const contractWInfuraProvider = await providers.createInfuraProviderForContract(checkingContractAddress, abi)
    const totalTokensToCheck = 10000
    const targetPrice = 7
    const contractFunction = "chekfyerupder"
    const useCache = false

    const { firstHalf, secondHalf } = rateLimiting.splitAndReturn(totalTokensToCheck)

    let contractCheckedIdList = []
    let finalList = []


    if (useCache) {
        console.log('  ')
        console.log(' ------ USING CACHE ------ ')
        finalList = require('./cache/goblins.json')
        console.log(`Pulled ${finalList.length} token ids from cache`)
        console.log(finalList)
    }
    else {
        console.log('  ')
        console.log(' ------ CONTRACT CLAIM CHECKS ------ ')
        console.log(`About to check for ${totalTokensToCheck} tokens`)
        await Promise.all(
            [
                runArrayListsPerProvider(contractWAlchemyProvider, firstHalf, providers.getProviderEmoji("alchemy"), contractFunction, "boolean"),
                runArrayListsPerProvider(contractWInfuraProvider, secondHalf, providers.getProviderEmoji("infura"), contractFunction, "boolean"),

            ]).then(responses => {
                responses.map(response => {
                    contractCheckedIdList.push(response)
                })
            });

        const result = [...new Set(contractCheckedIdList.flat())];
        finalList = [...new Set(result.flat())];
    }
    
    await checkLiquidityPool("0xEA23AfF1724fe14c38BE4f4493f456Cac1AFEc0e", "goblintownwtf", "NFTX", finalList)
    
    console.log(' ')
    console.log(`There are a total of ${finalList.length} tokens that match your criteria`)
    const pricingResult = await calculatePricing(finalList, pricingContractAddress, targetPrice)
    console.log('  ')
    console.log(` ----- ${pricingResult} ------ `)
}

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

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
