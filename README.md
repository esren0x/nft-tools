# NFT Tools

This project has been put together for use cases I have required when trading NFTs. 
It is a quick way for me to find arbitrage oppertunities within NFT collections and their secondary claims, if they are token based.

As more and more of these examples have come to light, I have moved some of the parts in to utilities and made it easier to create the script to work on other collections.

## Todo

* Testing suite
* Record run-through video

## Examples I used it for
* Cool cats, claiming Cool pets
* Bored Apes, claiming Kennel
* GoblinTown, claiming burgers
* Mutant Apes, claiming Otherside land
* Doodles, claiming doodinators

## Arbitrage oppertunity

If a Cool Cat has a floor price of 3 ETH and a Cool Pet has a floor price of 1 ETH
Then I could be looking for Cool Cats in the range upto 3.5 ETH for example. Then I could buy the Cat, claim it and then sell it again at floor, then sell the Pet. 

Many people do not carry out their claim for various reasons, so I was trying to find those.
Once I check the various token Ids I also check various marketplaces for the item listed in my target price.

* OpenSea
* Liquidity staking pools
* LooksRare
* X2Y2

## Process

1. Fill out basic details for a collection, contract address, checking functiontoken range e.g. 10k collection
2. Each token ID is then split up and ran against seperate API keys to avoid rate limiting (my limitation not one that should exist)
3. Checks if that token ID has make a claim 
4. End up with a list of ALL unclaimed token IDS
5. Go to various marketplaces to see if the token is listed for sale and matches my targed price range


## Run

1. Copy .ENV-sample, rename to .ENV, fill out the various keys required
2. I use both an Infura and an Alchemy API key in order avoid rate limiting (I need to revisit this)
3. Then in each of the script files below, check the specifics e.g. target price and run

Try running some of the following tasks:

```
npx hardhat run scripts/unclaimed-pets.js
npx hardhat run scripts/unclaimed-bayc.js
npx hardhat run scripts/unclaimed-mayc.js
npx hardhat run scripts/unclaimed-mcgoblin.js
npx hardhat run scripts/unclaimed-doodle.js

```

4. If you want to set the cache (previously saved IDs) you can do that by setting it to true or false in the script file

![](./img/working.png)