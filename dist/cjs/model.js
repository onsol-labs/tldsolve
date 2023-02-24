'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Domain = void 0;
class Domain {
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
exports.Domain = Domain;
//# sourceMappingURL=model.js.map
