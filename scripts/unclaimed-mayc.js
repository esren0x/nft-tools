
var providers = require('./utils/providers')
var rateLimiting = require('./utils/rateLimiting');
const { calculatePricing } = require("./utils/pricing");
const { runArrayListsPerProvider } = require("./utils/providers");
const { checkLiquidityPool } = require("./utils/nftPools");

async function main() {
    // MAYC
    const checkingContractAddress = "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258";
    const pricingContractAddress = "0x60E4d786628Fea6478F785A6d7e704777c86a7c6"
    const abi = require('./abis/otherdeedsAbi.json')
    const contractWAlchemyProvider = await providers.createAlchemyProviderForContract(checkingContractAddress, abi)
    const contractWInfuraProvider = await providers.createInfuraProviderForContract(checkingContractAddress, abi)
    const totalTokensToCheck = 30000
    const targetPrice = 35
    const useCache = false

    const contractFunction = "betaClaimed"

    const { firstHalf, secondHalf } = rateLimiting.splitAndReturn(totalTokensToCheck)

    let contractCheckedIdList = []
    let finalList = []


    if (useCache) {
        console.log('  ')
        console.log(' ------ USING CACHE ------ ')
        finalList = require('./cache/mayc.json')
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

    await checkLiquidityPool("0x94c9cEb2F9741230FAD3a62781b27Cc79a9460d4", "mutant-ape-yacht-club", "NFTX", finalList)

    console.log(' ')
    console.log(`There are a total of ${finalList.length} tokens that match your criteria`)
    const pricingResult = await calculatePricing(finalList, pricingContractAddress, targetPrice)
    console.log('  ')
    console.log(` ----- ${pricingResult} ------ `)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
