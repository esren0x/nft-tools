const { runQuery } = require("./utils/query");
var providers = require('./utils/providers')
var rateLimiting = require('./utils/rateLimiting');
const { calculatePricing } = require("./utils/pricing");
const { checkLiquidityPool } = require("./utils/nftPools");

async function main() {
    // PETS
    const checkingContractAddress = "0x86c10d10eca1fca9daf87a279abccabe0063f247";
    const pricingContractAddress = "0x1a92f7381b9f03921564a437210bb9396471050c"
    const abi = require('./abis/coolpetsAbi.json')
    const contractWAlchemyProvider = await providers.createAlchemyProviderForContract(checkingContractAddress, abi)
    const contractWInfuraProvider = await providers.createInfuraProviderForContract(checkingContractAddress, abi)
    const totalTokensToCheck = 10000
    const targetPrice = 6
    const contractFunction = "ownerOf"
    const useCache = true

    const { firstHalf, secondHalf } = rateLimiting.splitAndReturn(totalTokensToCheck)

    let contractCheckedIdList = []
    let finalList = []


    if (useCache) {
        console.log('  ')
        console.log(' ------ USING CACHE ------ ')
        finalList = require('./cache/cats.json')
        console.log(`Pulled ${finalList.length} token ids from cache`)
        console.log(finalList)
    }
    else {
        console.log('  ')
        console.log(' ------ CONTRACT CLAIM CHECKS ------ ')
        console.log(`About to check for ${totalTokensToCheck} tokens`)
        await Promise.all(
            [
                runArrayListsPerProvider(contractWAlchemyProvider, firstHalf, providers.getProviderEmoji("alchemy"), contractFunction, "owner"),
                runArrayListsPerProvider(contractWInfuraProvider, secondHalf, providers.getProviderEmoji("infura"), contractFunction, "owner"),

            ]).then(responses => {
                responses.map(response => {
                    contractCheckedIdList.push(response)
                })
            });

        const result = [...new Set(contractCheckedIdList.flat())];
        finalList = [...new Set(result.flat())];
    }
    
    await checkLiquidityPool("0x114f1388fAB456c4bA31B1850b244Eedcd024136", "cool-cats-nft", "NFTX", finalList)
    
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
