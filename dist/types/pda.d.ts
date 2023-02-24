import { PublicKey } from '@solana/web3.js';
export declare function findTldHouse(tldString: string): [PublicKey, number];
export declare function findNameHouse(tldHouse: PublicKey): [PublicKey, number];
export declare function findNameRecord(
    nameAccount: PublicKey,
    nameHouseAccount: PublicKey,
): [PublicKey, number];
export declare function findCollectionMint(
    tldHouse: PublicKey,
): [PublicKey, number];
//# sourceMappingURL=pda.d.ts.map
