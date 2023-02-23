import { getParsedNftAccountsByOwner } from './metaplex/nfts';
import {
    getDomainKey as getSPLDomainKey,
    NameRegistryState,
    getAllDomains as getAllSPLDomains,
    performReverseLookup as performSPLReverseLookup,
    getFavoriteDomain,
} from '@bonfida/spl-name-service';
import {
    findOwnedNameAccountsForUser,
    getDomainKey,
    NameRecordHeader,
    TldParser,
} from '@onsol/tldparser';
import { PublicKey, Connection } from '@solana/web3.js';
import { Domain } from './model';
import {
    findCollectionMint,
    findNameHouse,
    findNameRecord,
    findTldHouse,
} from './pda';
import pLimit from 'p-limit';
import { NftRecord } from './types/nft_record';
import { chunkArrayPublicKeys } from './utils';
import { BN } from 'bn.js';
import { MainDomain } from './types/main_domain';
import { Protocol } from './types/protocol';

export class TldSolve {
    constructor(private readonly connection: Connection) {}

    async getMainDomain(
        userAccount: PublicKey | string,
        protocol: Protocol = Protocol.ANS,
    ): Promise<MainDomain | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        if (protocol === Protocol.SNS) {
            // solana
            const favoriteDomain = await getFavoriteDomain(
                this.connection,
                userAccount,
            );
            return {
                nameAccount: favoriteDomain.domain,
                tld: '.sol',
                domain: favoriteDomain.reverse,
            };
        }
        // ans
        const parser = new TldParser(this.connection);
        const mainDomain = await parser.getMainDomain(userAccount);
        return mainDomain;
    }

    async resolveDomain(
        domain: string,
    ): Promise<NameRecordHeader | NameRegistryState | undefined> {
        const domainSplit = domain.split('.');
        const tldName = domainSplit.at(-1);
        if (tldName === 'sol') {
            // solana
            const { pubkey } = await getSPLDomainKey(domain);
            const { registry } = await NameRegistryState.retrieve(
                this.connection,
                pubkey,
            );
            return registry;
        }
        // ans
        const { pubkey } = await getDomainKey(domain);
        const nameRecordHeader = await NameRecordHeader.fromAccountAddress(
            this.connection,
            pubkey,
        );
        return nameRecordHeader;
    }

    async getOwnerFromDomain(domain: string): Promise<PublicKey | undefined> {
        const domainSplit = domain.split('.');
        const tldName = domainSplit.at(-1);
        if (tldName === 'sol') {
            // solana
            const { pubkey } = await getSPLDomainKey(domain);
            const { registry } = await NameRegistryState.retrieve(
                this.connection,
                pubkey,
            );
            return registry.owner;
        }
        // ans
        const { pubkey } = await getDomainKey(domain);
        const nameRecordHeader = await NameRecordHeader.fromAccountAddress(
            this.connection,
            pubkey,
        );
        return nameRecordHeader?.owner;
    }

    /**
     * retrieves domain data a domain from domain.tld.
     *
     * @param domain full string of domain and tld e.g. "miester.poor"
     */
    async getNameAccountFromDomain(
        domain: string,
    ): Promise<PublicKey | undefined> {
        const domainSplit = domain.split('.');
        if (domainSplit.length > 2) return;
        const tldName = domainSplit.at(-1);

        if (tldName === 'sol') {
            // solana
            const { pubkey } = await getSPLDomainKey(domain);
            return pubkey;
        }
        // ans
        const { pubkey } = await getDomainKey(domain);
        return pubkey;
    }

    async getAllDomainsFromUser(
        userAccount: PublicKey | string,
        protocol: Protocol = Protocol.ANS,
    ): Promise<PublicKey[] | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        switch (protocol) {
            case Protocol.ANS:
                const domainsANS = await findOwnedNameAccountsForUser(
                    this.connection,
                    userAccount,
                    undefined,
                );
                return domainsANS;
            case Protocol.SNS:
                const domainsSPL = await getAllSPLDomains(
                    this.connection,
                    userAccount,
                );
                return domainsSPL;
            default:
                const domainsANSDefault = await findOwnedNameAccountsForUser(
                    this.connection,
                    userAccount,
                    undefined,
                );
                const domainsSNSDefault = await getAllSPLDomains(
                    this.connection,
                    userAccount,
                );
                const allDomains = domainsANSDefault.concat(domainsSNSDefault);
                return allDomains;
        }
    }

    async getAllDomainsFromUserFromTld(
        userAccount: PublicKey | string,
        tld: string,
    ): Promise<PublicKey[] | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        if (tld === 'sol') {
            const domainsSPL = await getAllSPLDomains(
                this.connection,
                userAccount,
            );
            return domainsSPL;
        }
        const parser = new TldParser(this.connection);
        const domainsANS = await parser.getAllUserDomainsFromTld(
            userAccount,
            tld,
        );
        return domainsANS;
    }

    async reverseLookupNameAccountWithKnownParent(
        nameAccount: PublicKey | string,
        parentAccountOwner?: PublicKey | string,
    ): Promise<string | undefined> {
        const parser = new TldParser(this.connection);
        if (parentAccountOwner) {
            const domainName = await parser.reverseLookupNameAccount(
                nameAccount,
                parentAccountOwner,
            );
            return domainName;
        } else {
            if (typeof nameAccount == 'string') {
                nameAccount = new PublicKey(nameAccount);
            }
            const domainName = await performSPLReverseLookup(
                this.connection,
                nameAccount,
            );
            return domainName;
        }
    }

    async reverseLookupNameAccount(
        nameAccount: PublicKey | string,
        protocol: Protocol = Protocol.ANS,
    ): Promise<string | undefined> {
        if (typeof nameAccount == 'string') {
            nameAccount = new PublicKey(nameAccount);
        }
        switch (protocol) {
            case Protocol.ANS:
                const nameRecordHeaderANS =
                    await NameRecordHeader.fromAccountAddress(
                        this.connection,
                        nameAccount,
                    );
                if (!nameRecordHeaderANS) return;
                const tldParser = new TldParser(this.connection);
                const tldFound = await tldParser.getTldFromParentAccount(
                    nameRecordHeaderANS.parentName,
                );
                const [tldHouseKey] = findTldHouse(tldFound);
                const domainNameANS = await tldParser.reverseLookupNameAccount(
                    nameAccount,
                    tldHouseKey,
                );
                return domainNameANS;
            case Protocol.SNS:
                let domainNameSNS = await performSPLReverseLookup(
                    this.connection,
                    nameAccount,
                );
                return domainNameSNS;
            default:
                let domainName: string;
                domainName = await performSPLReverseLookup(
                    this.connection,
                    nameAccount,
                );
                if (domainName) return domainName;
                const nameRecordHeader =
                    await NameRecordHeader.fromAccountAddress(
                        this.connection,
                        nameAccount,
                    );
                if (!nameRecordHeader) return;
                const parser = new TldParser(this.connection);
                const tld = await parser.getTldFromParentAccount(
                    nameRecordHeader.parentName,
                );
                const [tldHouse] = findTldHouse(tld);
                domainName = await parser.reverseLookupNameAccount(
                    nameAccount,
                    tldHouse,
                );
                return domainName;
        }
    }

    async batchResolveANSDomains(
        userAccount: PublicKey | string,
        heliusApiKey?: string,
        tld: 'abc' | 'bonk' | 'poor' = 'abc',
        limitRPS: number = 10,
    ): Promise<Domain[] | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        const [tldHouse] = findTldHouse('.' + tld);
        let accounts: string[] = [];
        const ansDomains = await this.getAllDomainsFromUserFromTld(
            userAccount,
            tld,
        );
        if (!ansDomains) return;
        accounts = ansDomains.map((keys: PublicKey) => keys.toString());
        let nftRecords: NftRecord[] = [];
        let activeNfts = [];
        const limit = pLimit(limitRPS);
        if (heliusApiKey) {
            const [nameHouse] = findNameHouse(tldHouse);
            const [tldCollection] = findCollectionMint(tldHouse);
            const userNfts = await getParsedNftAccountsByOwner(
                this.connection,
                userAccount,
                heliusApiKey,
            );

            activeNfts = userNfts.filter(
                (t: any) =>
                    t?.onChainData?.collection &&
                    t?.onChainData?.collection.verified &&
                    // poor domains verified collection.
                    t?.onChainData?.collection?.key?.toString() ===
                        tldCollection.toString(),
            );

            const nftRecordsSet = new Set<NftRecord>();
            const activeRecordPromises = activeNfts.map((activeAccount: any) =>
                limit(async () => {
                    let domain = activeAccount.offChainData?.name;
                    if (!domain) {
                        domain = activeAccount.onChainData.data.name;
                    }
                    const { pubkey: nameAccount } = await getDomainKey(
                        `${domain}.${tld}`,
                    );
                    const [nftRecordAccount] = findNameRecord(
                        nameAccount,
                        nameHouse,
                    );
                    const nftRecordData = await NftRecord.fromAccountAddress(
                        this.connection,
                        nftRecordAccount,
                    );
                    nftRecordsSet.add(nftRecordData);
                }),
            );

            await Promise.all(activeRecordPromises);
            nftRecords = [...nftRecordsSet.values()];
        }
        let nameAccountsNftRecords: string[] = [];
        if (nftRecords) {
            nameAccountsNftRecords = nftRecords?.map((nftRecord: NftRecord) =>
                nftRecord.nameAccount.toString(),
            );
        }
        // there is a bug that some accounts are not public keys but are strings and are not unique.
        const fetchableAccounts: PublicKey[] = [];
        [...nameAccountsNftRecords, ...accounts].forEach(keys =>
            fetchableAccounts.push(new PublicKey(keys)),
        );
        const chunkedFetchableAccounts: PublicKey[][] = chunkArrayPublicKeys(
            fetchableAccounts,
            100,
        );

        const fetchedAccountDetails: Domain[] = [];
        for (let fetchableAccountsChunked in chunkedFetchableAccounts) {
            const accounts = await this.connection.getMultipleAccountsInfo(
                chunkedFetchableAccounts[fetchableAccountsChunked],
            );
            const promises = accounts.map((account, index) =>
                limit(async () => {
                    if (!account?.data) return;
                    const domainRecord =
                        NameRecordHeader.fromAccountInfo(account);
                    if (!domainRecord) return;
                    const domainName = (
                        await this.reverseLookupNameAccount(
                            chunkedFetchableAccounts[fetchableAccountsChunked][
                                index
                            ],
                        )
                    )?.trim();
                    let nftDetails: any = { isNft: false };
                    try {
                        if (
                            heliusApiKey &&
                            nftRecords.length > 0 &&
                            nftRecords[index]?.nftMintAccount
                        ) {
                            nftDetails = {
                                isNft: true,
                                nft: nftRecords[index].nftMintAccount,
                                metadata: activeNfts[index],
                            };
                        }
                    } catch {}
                    const domainDetails: Domain = {
                        parentName: domainRecord.parentName,
                        owner: domainRecord.owner,
                        expiresAt: domainRecord.expiresAt,
                        domainName: domainName,
                        domainAccount:
                            chunkedFetchableAccounts[fetchableAccountsChunked][
                                index
                            ],
                        ...nftDetails,
                    };
                    fetchedAccountDetails.push(domainDetails);
                }),
            );

            await Promise.all(promises);
        }
        if (fetchedAccountDetails.length > 0) {
            fetchedAccountDetails.sort((a, b) =>
                a.domainName.localeCompare(b.domainName, undefined, {
                    numeric: true,
                    sensitivity: 'base',
                }),
            );
        }

        return fetchedAccountDetails;
    }
}
