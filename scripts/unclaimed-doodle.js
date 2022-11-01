const { runQuery } = require("./utils/query");
var providers = require('./utils/providers')
var rateLimiting = require('./utils/rateLimiting');
const { calculatePricing } = require("./utils/pricing");
const { checkLiquidityPool } = require("./utils/nftPools");

async function main() {
    // PETS
    const checkingContractAddress = "0x466cfcd0525189b573e794f554b8a751279213ac";
    const pricingContractAddress = "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"
    const abi = require('./abis/doodinatorAbi.json')
    const contractWAlchemyProvider = await providers.createAlchemyProviderForContract(checkingContractAddress, abi)
    const contractWInfuraProvider = await providers.createInfuraProviderForContract(checkingContractAddress, abi)
    const totalTokensToCheck = 10000
    const targetPrice = 17
    const contractFunction = "isClaimed"
    const useCache = false

    const { firstHalf, secondHalf } = rateLimiting.splitAndReturn(totalTokensToCheck)

    let contractCheckedIdList = []
    let finalList = []


    if (useCache) {
        console.log('  ')
        console.log(' ------ USING CACHE ------ ')
        finalList = require('./cache/doodles.json')
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
    
    await checkLiquidityPool("0x2F131C4DAd4Be81683ABb966b4DE05a549144443", "doodles-official", "NFTX", finalList)
    
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
