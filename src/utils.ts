import {PublicKey} from '@solana/web3.js';

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
