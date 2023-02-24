export class Domain {
    constructor(
        parentName,
        owner,
        expiresAt,
        domainName,
        isNft,
        domainAccount,
        nft,
        metadata,
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
//# sourceMappingURL=model.js.map
