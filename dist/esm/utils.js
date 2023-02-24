/**
 * Chunkifys public key arrays into array of arrays based on chunkSize.
 *
 * @export
 * @param {PublicKey[]} arr
 * @param {number} chunkSize
 * @returns {PublicKey[][]}
 */
export function chunkArrayPublicKeys(arr, chunkSize) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}
//# sourceMappingURL=utils.js.map
