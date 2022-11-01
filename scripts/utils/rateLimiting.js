/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */

const _rateLimitedSafeChunckSize = 200

function _chunkArray(myArray, chunk_size) {
    var results = [];

    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }

    return results;
}

function _isOdd(num) { return num % 2; }

function _splitAndReturn(totalTokensToCheck) {
    let ids = []
    // Create array of total token IDs
    for (let id = 1; id <= totalTokensToCheck; id++) {
        ids.push(id)
    }

    var chunks = _chunkArray(ids, _rateLimitedSafeChunckSize);

    // Split again in to 2 seperate lists
    const half = Math.ceil(chunks.length / 2);
    const firstHalf = chunks.splice(0, half)
    const secondHalf = chunks.splice(-half)

    return { firstHalf, secondHalf }
}

module.exports = {
    chunkArray: _chunkArray,
    isOdd: _isOdd,
    splitAndReturn: _splitAndReturn
}