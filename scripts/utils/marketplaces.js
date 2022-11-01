
const chalk = require('chalk');
require('dotenv').config()



// PUBLIC FUNCTIONS - START

async function generateUrls(marketplaceName, tokenIdArray, contractAddress, onePer) {
    let urls = []

    if (onePer) {
        for (let i = 0; i < tokenIdArray.length; i++) {
            urls.push(_getMarketPlaceUrlSpecifics(marketplaceName, contractAddress, tokenIdArray[i]))
        }

        console.log(`Created ${tokenIdArray.length} sepeate URL strings for ${marketplaceName} as its one per.`)

    }
    else {
        const pagination = await _generateQueryPaginationStrings(marketplaceName, tokenIdArray)
        for (let index = 0; index < pagination.length; index++) {
            urls.push(_getMarketPlaceUrlSpecifics(marketplaceName, contractAddress, pagination[index]))
        }
    }

    return urls
}

async function getPricing(urlList, marketplaceName, targetPrice) {
    let failedUrls = []
    let prices = []
    for (let index = 0; index < urlList.length; index++) {
        try {
            if (marketplaceName === "opensea") {
                const results = await _fetchOpenSea(urlList[index])
                const formattedResponse = _formatResultsOpensea(results, targetPrice)
                
                if (formattedResponse.length > 0) {
                    prices.push(formattedResponse)
                }
                await new Promise(r => setTimeout(r, 3000));
            }

            if (marketplaceName === "openseav2") {
                const results = await _fetchOpenSea(urlList[index])
                const formattedResponse = _formatResultsOpensea(results, targetPrice)
                
                if (formattedResponse.length > 0) {
                    prices.push(formattedResponse)
                }
                await new Promise(r => setTimeout(r, 3000));
            }

            if (marketplaceName === "x2y2") {
                const results = await _fetchX2Y2(urlList[index])
                const formattedResponse = _formatResultsX2Y2(results, targetPrice)
                
                if (formattedResponse.length > 0) {
                    prices.push(formattedResponse)
                }

                await new Promise(r => setTimeout(r, 3000));
            }

            if (marketplaceName === "looksrare") {
                const results = await _fetchLookRare(urlList[index])
                const formattedResponse = _formatResultsLooksRare(results, targetPrice)
                
                if (formattedResponse.length > 0) {
                    prices.push(formattedResponse)
                }

                await new Promise(r => setTimeout(r, 1100));
            }
        } catch (error) {
            failedUrls.push(urlList[index])
            await new Promise(r => setTimeout(r, 15000));
        }
    }

    console.log(`----- MARKETPLACE ${marketplaceName} FINISHED with ${prices.length} listings found -----`)
}

// PUBLIC FUNCTIONS - END


// PRIVATE FUNCTIONS - START

async function _generateQueryPaginationStrings(marketplaceName, tokenIdArray) {
    const paginatedTokenIdsArray = []
    const marketplaceSpecifics = _getMarketPlacePaginationSpecifics(marketplaceName)
    const pageCount = tokenIdArray.length / marketplaceSpecifics.tokensPerUrl;
    for (let index = 1; index < pageCount; index++) {
        const page = _paginate(tokenIdArray, marketplaceSpecifics.tokensPerUrl, index);
        const tokenIdPage = _generateUrlFriendlyQueryStringParams(page, marketplaceSpecifics);
        paginatedTokenIdsArray.push(tokenIdPage)
    }

    console.log(`Created ${paginatedTokenIdsArray.length} sepeate URL strings for ${marketplaceName}`)
    return paginatedTokenIdsArray
}

function _writePrice(targetPrice, result) {
    if (result.price <= targetPrice) {
        console.log(chalk.green(JSON.stringify(result)))
    }
}

function _formatResultsX2Y2(results, targetPrice) {
    let formattedResults = []
    try {
        if (results.data) {
            results.data.forEach((asset) => {
                const price = _getEthValue(asset.price)
                const tokenId = asset.nft.token_id
                const result = { price, tokenId, marketplace: "x2y2", url: `https://x2y2.io/eth/${asset.nft.token}/${asset.nft.token_id}` }
                _writePrice(targetPrice, result)
                formattedResults.push(result)
            })
        }

    } catch (error) {
        console.log(error)
        const result = { price: 00000, token: asset.nft.token_id }
        formattedResults.push(result)
        return result;
    }

    return formattedResults
}

function _formatResultsOpensea(results, targetPrice) {
    let formattedResults = []
    try {
        if (results.orders) {

            results.orders.forEach((response) => {
                // console.log(response.protocol_data.offer)
                const price = _getEthValue(response.current_price)
                // const tokenId = response.asset.token_id
                const tokenId = response.maker_asset_bundle.assets[0].token_id
                const contractAddress = response.maker_asset_bundle.assets[0].asset_contract.address
                const result = { price, tokenId, marketplace: "opensea", url: `https://opensea.io/assets/${contractAddress}/${tokenId}` }
                _writePrice(targetPrice, result)
                formattedResults.push(result)
            })
        }

    } catch (error) {
        console.log(error)
        const result = { price: 00000, token: asset.nft.token_id }
        formattedResults.push(result)
        return result;
    }

    return formattedResults
}

function _formatResultsOpenseaV2(results, targetPrice) {
    let formattedResults = []
    try {
        if (results.orders) {

            results.orders.forEach((response) => {
                console.log(response)
                const price = _getEthValue(response.current_price)
                const tokenId = response.assets.token_id
                const result = { price, tokenId, marketplace: "opensea", url: `https://opensea.io/assets/${response.asset.asset_contract.address}/${tokenId}` }
                _writePrice(targetPrice, result)
                formattedResults.push(result)
            })
        }

    } catch (error) {
        console.log(error)
        const result = { price: 00000, token: asset.nft.token_id }
        formattedResults.push(result)
        return result;
    }

    return formattedResults
}

function _formatResultsLooksRare(results, targetPrice) {
    let formattedResults = []
    try {
        if (results.data && results.data.length) {
            for (let index = 0; index < results.data.length; index++) {
                if (results.data[index].status === "VALID") {
                    const response = results.data[index]
                    const price = _getEthValue(response.price)
                    const tokenId = response.tokenId
                    const result = { price, tokenId, marketplace: "looksrare", url: `https://looksrare.org/collections/${response.collectionAddress}/${response.tokenId}` }
                    _writePrice(targetPrice, result)
                    formattedResults.push(result)
                }
            }
        }

    } catch (error) {
        console.log(error)
        const response = results.data[0]
        const result = { price: 00000, token: response.tokenId }
        formattedResults.push(result)
        return result;
    }

    return formattedResults

}

async function _fetchOpenSea(url) {
    const options = {
        mode: 'no-cors',
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json',
            'X-API-KEY': process.env.OS_KEY
        }
    }

    const result = await fetch(url, options).then((res) => res.json())
    return result
}

async function _fetchX2Y2(url) {
    const options = {
        mode: 'no-cors',
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json',
            'X-API-KEY': process.env.X2Y2_KEY
        }
    }

    const result = await fetch(url, options).then((res) => res.json()).catch((err) => console.error(err));
    return result
}

async function _fetchLookRare(url) {
    const options = {
        mode: 'no-cors',
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': ' application/json',
        }
    }

    const result = await fetch(url, options).then((res) => res.json()).catch((err) => console.error(err));
    return result
}

function _generateUrlFriendlyQueryStringParams(page, marketplaceSpecifics) {
    const { marketplace, seperator, prefix } = marketplaceSpecifics
    if (marketplace === "opensea") {
        return page.map((tokenId) => `${seperator}${tokenId}`).join("");
    }
    if (marketplace === "x2y2") {
        const query = prefix + page[0]

        const tokensSeperated = page.splice(1).map((tokenId) => `${seperator}${tokenId}`).join("");
        return query + tokensSeperated
    }


}

function _getMarketPlaceUrlSpecifics(marketplace, contractAddress, tokenPage) {
    const formattedMarketplace = marketplace.toLowerCase()
    if (formattedMarketplace === "opensea") {
        // return `https://api.opensea.io/wyvern/v1/orders?asset_contract_address=${contractAddress}&bundled=false&include_bundled=false&${tokenPage}&side=1&sale_kind=0&limit=50&offset=0&order_by=created_date&order_direction=desc`
        return `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${contractAddress}&limit=25&${tokenPage}`
    }
    // if (formattedMarketplace === "openseav2") {
    //     return `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${contractAddress}&limit=25&${tokenPage}`
    // }
    if (formattedMarketplace === "x2y2") {
        return `https://api.x2y2.org/api/orders?status=open&contract=${contractAddress}${tokenPage}`
    }

    if (formattedMarketplace === 'looksrare') {
        return `https://api.looksrare.org/api/v1/orders?isOrderAsk=true&collection=${contractAddress}&tokenId=${tokenPage}&status[]=VALID`
    }

    throw `Marketplace ${marketplace} is not defined, please configure it first`;
}

function _getMarketPlacePaginationSpecifics(marketplace) {
    const formattedMarketplace = marketplace.toLowerCase()
    if (formattedMarketplace === "opensea") {
        return {
            marketplace: "opensea",
            prefix: "",
            seperator: '&token_ids=',
            tokensPerUrl: 25
        }
    }
    if (formattedMarketplace === "openseaV2") {
        return {
            marketplace: "openseav2",
            prefix: "",
            seperator: '&token_ids=',
            tokensPerUrl: 25
        }
    }
    if (formattedMarketplace === "x2y2") {
        return {
            marketplace: "x2y2",
            prefix: "&token_ids=",
            seperator: ',',
            tokensPerUrl: 15
        }
    }

    if (formattedMarketplace === "looksrare") {
        return {
            marketplace: "looksrare",
            prefix: "",
            seperator: '',
            tokensPerUrl: 1
        }
    }

    throw `Marketplace ${marketplace} is not defined, please configure it first`;
}

function _paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

const weiToEth = 1000000000000000000;
function _getEthValue(wei) {
    return wei / weiToEth;
}

// PRIVATE FUNCTIONS - END

module.exports = {
    getPricing: getPricing,
    generateUrls: generateUrls
}