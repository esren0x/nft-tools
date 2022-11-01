

const _conditions = ["call_exception", "etimedout"];
var _initialFailed = [];
var _failedIds = [];

const weiToEth = 1000000000000000000;
function _getEthValue(wei) {
    return wei / weiToEth;
}


async function runQuery(contractWithProvider, idArray, provider, contractFunction, claimType) {
    let idList = []
    await Promise.all(idArray.map(async (id) => {

        if (claimType === "boolean") {
            try {
                const result = await contractWithProvider[contractFunction](id);
                if (!result) {
                    process.stdout.write(`${id},`);
                    idList.push(id)
                }
            } catch (error) {
                const errorString = error.toString().toLowerCase();
                if (_conditions.some(el => errorString.includes(el))) {
                    _initialFailed.push(`🚨 ${provider} - ${id}`);
                    _failedIds.push(id);
                    await new Promise(r => setTimeout(r, 6000));
                } else {
                    throw error;
                }
            }
        }
        if (claimType === "owner") {
            try {
                try {
                    await contractWithProvider[contractFunction](id);
                } catch (error) {
                    if (error && error.code === 'CALL_EXCEPTION') {
                        process.stdout.write(`${id},`);
                        idList.push(id)
                    }
                }
            } catch (error) {
                const errorString = error.toString().toLowerCase();
                if (_conditions.some(el => errorString.includes(el))) {
                    _initialFailed.push(`🚨 ${provider} - ${id}`);
                    _failedIds.push(id);
                    await new Promise(r => setTimeout(r, 6000));
                } else {
                    throw error;
                }
            }
        }
        if (claimType === "ipc") {

            // 2018 Mint: #0001 - #2604 (2604 IPCs)
            // 2019 Mint: #2605 - #2809 (205 IPCs)
            // 2020 Mint: #2810 - #2817 (8 IPCs)
            // 2021 Mint: #2818 - #2827 (10 IPCs)
            // 2022 Mint: #2828 - #12000 (9173 IPCs)


            try {
                const result = await contractWithProvider[contractFunction](id);
                if (result && result[0] < 10000) {
                    console.log(`ID ${id} - ${result[0]} - https://myipc.io/${id}`)
                    // process.stdout.write(`${id},`);
                    idList.push(id)
                }
                // console.log(`ID ${id} - ${result[0]}`)
            } catch (error) {
                const errorString = error.toString().toLowerCase();
                if (_conditions.some(el => errorString.includes(el))) {
                    _initialFailed.push(`🚨 ${provider} - ${id}`);
                    _failedIds.push(id);
                    await new Promise(r => setTimeout(r, 6000));
                } else {
                    throw error;
                }
            }
        }

    }));

    await new Promise(r => setTimeout(r, 6000));
    return idList

}

module.exports = {
    runQuery: runQuery,
}
