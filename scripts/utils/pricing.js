const { getPricing, generateUrls } = require('./marketplaces');
const { shuffle } = require('./random');

const sdk = require('api')('@opensea/v1.0#3dk6y1hl2r2ogee');

async function calculatePricing(tokenIds, contractAddress, targetPrice) {
    console.log('  ')
    console.log(' ----- PRICING ------ ')
    console.log(`About to check pricing of ${tokenIds.length} tokenIds`)
    const shuffledTokenIds = shuffle(tokenIds) // Just to start at different point each time.
    const paginatedTokenQueryStringsOpensea = await generateUrls("opensea", shuffledTokenIds, contractAddress)
    const paginatedTokenQueryStringsX2Y2 = await generateUrls("x2y2", shuffledTokenIds, contractAddress)
    const paginatedTokenQueryStringsLooksRare = await generateUrls("looksrare", shuffledTokenIds, contractAddress, true)
    await Promise.all(
        [
            getPricing(paginatedTokenQueryStringsOpensea, "opensea", targetPrice),
            getPricing(paginatedTokenQueryStringsX2Y2, "x2y2", targetPrice),
            getPricing(paginatedTokenQueryStringsLooksRare, "looksrare", targetPrice),
        ]);

    return `COMPLETED`
}

module.exports = {
    calculatePricing: calculatePricing,
}