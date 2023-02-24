import { Connection, PublicKey } from '@solana/web3.js';
export declare const getParsedNftAccountsByOwner: (
    connection: Connection,
    owner: PublicKey,
    heliusApiKey: string,
) => Promise<any>;
export type OnsolTokenType = {
    mintAddress: PublicKey;
    amount: string | number;
};
export declare const getParsedTokenAccountsByOwner: (
    owner: PublicKey,
    connection: Connection,
) => Promise<OnsolTokenType[]>;
//# sourceMappingURL=nfts.d.ts.map
