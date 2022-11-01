
var providers = require('./utils/providers')
var rateLimiting = require('./utils/rateLimiting');
const { calculatePricing } = require("./utils/pricing");
const { checkLiquidityPool } = require("./utils/nftPools");
const { runArrayListsPerProvider } = require("./utils/providers");

async function main() {
    // BAYC
    const checkingContractAddress = "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258";
    const pricingContractAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"
    const abi = require('./abis/otherdeedsAbi.json')
    const contractWAlchemyProvider = await providers.createAlchemyProviderForContract(checkingContractAddress, abi)
    const contractWInfuraProvider = await providers.createInfuraProviderForContract(checkingContractAddress, abi)
    const totalTokensToCheck = 10000

    const contractFunction = "alphaClaimed"

    const { firstHalf, secondHalf } = rateLimiting.splitAndReturn(totalTokensToCheck)

    let finalIdList = []

    console.log('  ')
    console.log(' ----- CONTRACT CLAIM CHECKS ------ ')
    console.log(`About to check for ${totalTokensToCheck} tokens`)
    await Promise.all(
        [
            runArrayListsPerProvider(contractWAlchemyProvider, firstHalf, providers.getProviderEmoji("alchemy"), contractFunction, "boolean"),
            runArrayListsPerProvider(contractWInfuraProvider, secondHalf, providers.getProviderEmoji("infura"), contractFunction, "boolean"),
        ]).then(responses => {
            responses.map(response => {
                finalIdList.push(response)
            })
        });

    
    // TODO: concat, reduce and flat once
    // Update all other scripts too
    const result = [...new Set(finalIdList.flat())];
    const flatFlat = [...new Set(result.flat())];

    await checkLiquidityPool("0xEA47B64e1BFCCb773A0420247C0aa0a3C1D2E5C5", "boredapeyachtclub", "NFTX", flatFlat)

    const pricingResult = await calculatePricing(flatFlat, pricingContractAddress, 0)
    console.log('  ')
    console.log(` ----- ${pricingResult} ------ `)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
