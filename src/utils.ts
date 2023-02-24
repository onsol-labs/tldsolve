import { PublicKey } from '@solana/web3.js';

/**
 * Chunkifys public key arrays into array of arrays based on chunkSize.
 *
 * @export
 * @param {PublicKey[]} arr
 * @param {number} chunkSize
 * @returns {PublicKey[][]}
 */
export function chunkArrayPublicKeys(
    arr: PublicKey[],
    chunkSize: number,
): PublicKey[][] {
    const chunks: PublicKey[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}
