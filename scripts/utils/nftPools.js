
const sdk = require('api')('@opensea/v1.0#5zrwe3ql2r2e6mn');
require('dotenv').config()

async function checkLiquidityPool(owner, collectionSlug, poolName, unclaimedTokenArray) {
    console.log('  ')
    console.log(` ----- ${poolName} Liquidity Pool check ------ `)
    const liquidityPool = await _getTokenListFromLiquidityPool(owner, collectionSlug)
    const found = unclaimedTokenArray.some(r => liquidityPool.includes(r))
    const foundIds = unclaimedTokenArray.filter(x => !liquidityPool.includes(x))
    console.log('  ')
    console.log(`Found ${liquidityPool.length} NFTs in the pool`)
    console.log('  ')
    console.log( `Does liquidity pool include any unclaimed NFTS? ${found}` )
    if(found) {
        console.log(foundIds)
    }
}

async function _getTokenListFromLiquidityPool(owner, collectionSlug) {

    const results = await sdk['getting-assets']({
        owner,
        collection_slug: collectionSlug,
        order_direction: 'desc',
        limit: '50',
        include_orders: 'false',
        'X-API-KEY': process.env.OS_KEY
    })

    const formattedResponse = _formatOSLiquidityPoolResponse(results)
    return formattedResponse
}

function _formatOSLiquidityPoolResponse(response) {
    let responseFormatted = []

    if (response && response.assets) {
        for (var i = 0; i < response.assets.length; i++) {
            responseFormatted.push(response.assets[i].token_id)
        }
    }

    return responseFormatted
}


module.exports = {
    checkLiquidityPool: checkLiquidityPool,
}