import { PublicKey } from "@solana/web3.js";

export class Domain {
  parentName: PublicKey;
  owner: PublicKey;
  expiresAt: number;
  domainName: string;
  domainAccount?: PublicKey;
  nft?: PublicKey;
  metadata?: any;
  isClaimableDomain?: boolean;
  isANSOwner?: boolean;
  isANSDomainAvailable?: boolean;
  isNft: boolean;

  constructor(
    parentName: PublicKey,
    owner: PublicKey,
    expiresAt: number,
    domainName: string,
    isNft: boolean,
    domainAccount?: PublicKey,
    isClaimableDomain?: boolean,
    isANSOwner?: boolean,
    isANSDomainAvailable?: boolean,
    nft?: PublicKey,
    metadata?: any,
  ) {
    this.parentName = parentName;
    this.owner = owner;
    this.expiresAt = expiresAt;
    this.domainName = domainName;
    this.domainAccount = domainAccount;
    this.isClaimableDomain = isClaimableDomain;
    this.isANSOwner = isANSOwner;
    this.isANSDomainAvailable = isANSDomainAvailable;
    this.nft = nft;
    this.metadata = metadata;
    this.isNft = isNft;
  }
}