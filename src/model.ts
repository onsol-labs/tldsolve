import { PublicKey } from '@solana/web3.js';

export class Domain {
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
    ) {
        this.parentName = parentName;
        this.owner = owner;
        this.expiresAt = expiresAt;
        this.domainName = domainName;
        this.domainAccount = domainAccount;
        this.nft = nft;
        this.metadata = metadata;
        this.isNft = isNft;
    }
}
