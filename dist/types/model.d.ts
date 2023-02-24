import { PublicKey } from '@solana/web3.js';
export declare class Domain {
    parentName: PublicKey;
    owner: PublicKey;
    expiresAt: number;
    domainName: string;
    domainAccount?: PublicKey;
    nft?: PublicKey;
    metadata?: any;
    isNft: boolean;
    constructor(
        parentName: PublicKey,
        owner: PublicKey,
        expiresAt: number,
        domainName: string,
        isNft: boolean,
        domainAccount?: PublicKey,
        nft?: PublicKey,
        metadata?: any,
    );
}
//# sourceMappingURL=model.d.ts.map
