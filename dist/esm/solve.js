var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
import { getParsedNftAccountsByOwner } from './metaplex/nfts';
import {
    getDomainKey as getSPLDomainKey,
    NameRegistryState,
    getAllDomains as getAllSNSDomains,
    performReverseLookup as performSNSReverseLookup,
    getFavoriteDomain,
} from '@bonfida/spl-name-service';
import {
    findOwnedNameAccountsForUser,
    getDomainKey,
    NameRecordHeader,
    TldParser,
} from '@onsol/tldparser';
import { PublicKey } from '@solana/web3.js';
import {
    findCollectionMint,
    findNameHouse,
    findNameRecord,
    findTldHouse,
} from './pda';
import pLimit from 'p-limit';
import { NftRecord } from './types/nft_record';
import { chunkArrayPublicKeys } from './utils';
import { Protocol } from './types/protocol';
/**
 * TldSolve, solves for ans and sns domains.
 */
export class TldSolve {
    /**
     * Creates an instance of TldSolve.
     *
     * @constructor
     * @param {Connection} connection
     */
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * retrieves userAccount main domain or favorite domain in sns.
     *
     * @async
     * @param {(PublicKey | string)} userAccount of interest.
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<MainDomain | undefined>)}
     */
    getMainDomain(userAccount, protocol = Protocol.ANS) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userAccount == 'string') {
                userAccount = new PublicKey(userAccount);
            }
            if (protocol === Protocol.SNS) {
                // sns
                const favoriteDomain = yield getFavoriteDomain(
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
            const mainDomain = yield parser.getMainDomain(userAccount);
            return mainDomain;
        });
    }
    /**
     * resolves any domain name.
     *
     * @async
     * @param {string} domain to be resolved.
     * @returns {(Promise<NameRecordHeader | NameRegistryState | undefined>)}
     */
    resolveDomain(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const domainSplit = domain.split('.');
            const tldName = domainSplit.at(-1);
            if (tldName === 'sol') {
                // sns
                const { pubkey } = yield getSPLDomainKey(domain);
                const { registry } = yield NameRegistryState.retrieve(
                    this.connection,
                    pubkey,
                );
                return registry;
            }
            // ans
            const { pubkey } = yield getDomainKey(domain);
            const nameRecordHeader = yield NameRecordHeader.fromAccountAddress(
                this.connection,
                pubkey,
            );
            return nameRecordHeader;
        });
    }
    /**
     * retrieve owner from a domain.
     *
     * @async
     * @param {string} domain to retrieve owner of.
     * @returns {(Promise<PublicKey | undefined>)}
     */
    getOwnerFromDomain(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const domainSplit = domain.split('.');
            const tldName = domainSplit.at(-1);
            if (tldName === 'sol') {
                // sns
                const { pubkey } = yield getSPLDomainKey(domain);
                const { registry } = yield NameRegistryState.retrieve(
                    this.connection,
                    pubkey,
                );
                return registry.owner;
            }
            // ans
            const { pubkey } = yield getDomainKey(domain);
            const nameRecordHeader = yield NameRecordHeader.fromAccountAddress(
                this.connection,
                pubkey,
            );
            return nameRecordHeader === null || nameRecordHeader === void 0
                ? void 0
                : nameRecordHeader.owner;
        });
    }
    /**
     * retrieves nameAccount publickey from domain name.
     *
     * @async
     * @param {string} domain to retrieve name account.
     * @returns {(Promise<PublicKey | undefined>)}
     */
    getNameAccountFromDomain(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const domainSplit = domain.split('.');
            if (domainSplit.length > 2) return;
            const tldName = domainSplit.at(-1);
            if (tldName === 'sol') {
                // solana
                const { pubkey } = yield getSPLDomainKey(domain);
                return pubkey;
            }
            // ans
            const { pubkey } = yield getDomainKey(domain);
            return pubkey;
        });
    }
    /**
     * retrieve all domains from user based on protocol.
     *
     * @async
     * @param {(PublicKey | string)} userAccount to be looked for.
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<PublicKey[] | undefined>)}
     */
    getAllDomainsFromUser(userAccount, protocol = Protocol.ANS) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userAccount == 'string') {
                userAccount = new PublicKey(userAccount);
            }
            switch (protocol) {
                case Protocol.ANS:
                    const domainsANS = yield findOwnedNameAccountsForUser(
                        this.connection,
                        userAccount,
                        undefined,
                    );
                    return domainsANS;
                case Protocol.SNS:
                    const domainsSNS = yield getAllSNSDomains(
                        this.connection,
                        userAccount,
                    );
                    return domainsSNS;
                default:
                    // retrieves from both ans and sns.
                    const domainsANSDefault =
                        yield findOwnedNameAccountsForUser(
                            this.connection,
                            userAccount,
                            undefined,
                        );
                    const domainsSNSDefault = yield getAllSNSDomains(
                        this.connection,
                        userAccount,
                    );
                    const allDomains =
                        domainsANSDefault.concat(domainsSNSDefault);
                    return allDomains;
            }
        });
    }
    /**
     * retrieve all domains from user based on tld (e.g. abc, sol, bonk, etc.).
     *
     * @async
     * @param {(PublicKey | string)} userAccount to be looked for.
     * @param {string} tld without the dot.
     * @returns {(Promise<PublicKey[] | undefined>)}
     */
    getAllDomainsFromUserFromTld(userAccount, tld) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userAccount == 'string') {
                userAccount = new PublicKey(userAccount);
            }
            if (tld === 'sol') {
                const domainsSPL = yield getAllSNSDomains(
                    this.connection,
                    userAccount,
                );
                return domainsSPL;
            }
            const parser = new TldParser(this.connection);
            const domainsANS = yield parser.getAllUserDomainsFromTld(
                userAccount,
                tld,
            );
            return domainsANS;
        });
    }
    /**
     * reverse lookup for nameAccount public key, to retrieve domain name.
     * works for both ANS and SNS.
     *
     * @async
     * @param {(PublicKey | string)} nameAccount domain publickey
     * @param {?(PublicKey | string)} [parentAccountOwner] parentAccount is the nameclass for the reverse lookup account. leave empty for SNS.
     * @returns {(Promise<string | undefined>)}
     */
    reverseLookupNameAccountWithKnownParent(nameAccount, parentAccountOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = new TldParser(this.connection);
            if (parentAccountOwner) {
                const domainName = yield parser.reverseLookupNameAccount(
                    nameAccount,
                    parentAccountOwner,
                );
                return domainName;
            } else {
                if (typeof nameAccount == 'string') {
                    nameAccount = new PublicKey(nameAccount);
                }
                const domainName = yield performSNSReverseLookup(
                    this.connection,
                    nameAccount,
                );
                return domainName;
            }
        });
    }
    /**
     * reverse lookup for nameAccount public key, to retrieve domain name.
     * based on protocol.
     *
     * @async
     * @param {(PublicKey | string)} nameAccount
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<string | undefined>)}
     */
    reverseLookupNameAccount(nameAccount, protocol = Protocol.ANS) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof nameAccount == 'string') {
                nameAccount = new PublicKey(nameAccount);
            }
            switch (protocol) {
                case Protocol.ANS:
                    const nameRecordHeaderANS =
                        yield NameRecordHeader.fromAccountAddress(
                            this.connection,
                            nameAccount,
                        );
                    if (!nameRecordHeaderANS) return;
                    const tldParser = new TldParser(this.connection);
                    const tldFound = yield tldParser.getTldFromParentAccount(
                        nameRecordHeaderANS.parentName,
                    );
                    const [tldHouseKey] = findTldHouse(tldFound);
                    const domainNameANS =
                        yield tldParser.reverseLookupNameAccount(
                            nameAccount,
                            tldHouseKey,
                        );
                    return domainNameANS;
                case Protocol.SNS:
                    let domainNameSNS = yield performSNSReverseLookup(
                        this.connection,
                        nameAccount,
                    );
                    return domainNameSNS;
                default:
                    let domainName;
                    domainName = yield performSNSReverseLookup(
                        this.connection,
                        nameAccount,
                    );
                    if (domainName) return domainName;
                    const nameRecordHeader =
                        yield NameRecordHeader.fromAccountAddress(
                            this.connection,
                            nameAccount,
                        );
                    if (!nameRecordHeader) return;
                    const parser = new TldParser(this.connection);
                    const tld = yield parser.getTldFromParentAccount(
                        nameRecordHeader.parentName,
                    );
                    const [tldHouse] = findTldHouse(tld);
                    domainName = yield parser.reverseLookupNameAccount(
                        nameAccount,
                        tldHouse,
                    );
                    return domainName;
            }
        });
    }
    /**
     * Batch resolve any ANS domains held by the userAccount
     *
     * @async
     * @param {(PublicKey | string)} userAccount domain owner
     * @param {?string} [heliusApiKey] optional helius api key.
     * @param {('abc' | 'bonk' | 'poor')} [tld='abc']
     * @param {number} [limitRPS=10] limits depend on your rpc connection rps limit/3.
     * @returns {(Promise<Domain[] | undefined>)}
     */
    batchResolveANSDomains(
        userAccount,
        heliusApiKey,
        tld = 'abc',
        limitRPS = 10,
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userAccount == 'string') {
                userAccount = new PublicKey(userAccount);
            }
            const [tldHouse] = findTldHouse('.' + tld);
            let accounts = [];
            const ansDomains = yield this.getAllDomainsFromUserFromTld(
                userAccount,
                tld,
            );
            if (!ansDomains) return;
            accounts = ansDomains.map(keys => keys.toString());
            let nftRecords = [];
            let activeNfts = [];
            const limit = pLimit(limitRPS);
            if (heliusApiKey) {
                const [nameHouse] = findNameHouse(tldHouse);
                const [tldCollection] = findCollectionMint(tldHouse);
                const userNfts = yield getParsedNftAccountsByOwner(
                    this.connection,
                    userAccount,
                    heliusApiKey,
                );
                activeNfts = userNfts.filter(t => {
                    var _a, _b, _c, _d, _e;
                    return (
                        ((_a =
                            t === null || t === void 0
                                ? void 0
                                : t.onChainData) === null || _a === void 0
                            ? void 0
                            : _a.collection) &&
                        ((_b =
                            t === null || t === void 0
                                ? void 0
                                : t.onChainData) === null || _b === void 0
                            ? void 0
                            : _b.collection.verified) &&
                        // domains verified collection.
                        ((_e =
                            (_d =
                                (_c =
                                    t === null || t === void 0
                                        ? void 0
                                        : t.onChainData) === null ||
                                _c === void 0
                                    ? void 0
                                    : _c.collection) === null || _d === void 0
                                ? void 0
                                : _d.key) === null || _e === void 0
                            ? void 0
                            : _e.toString()) === tldCollection.toString()
                    );
                });
                const nftRecordsSet = new Set();
                const activeRecordPromises = activeNfts.map(activeAccount =>
                    limit(() =>
                        __awaiter(this, void 0, void 0, function* () {
                            var _a;
                            let domain =
                                (_a = activeAccount.offChainData) === null ||
                                _a === void 0
                                    ? void 0
                                    : _a.name;
                            if (!domain) {
                                domain = activeAccount.onChainData.data.name;
                            }
                            const { pubkey: nameAccount } = yield getDomainKey(
                                `${domain}.${tld}`,
                            );
                            const [nftRecordAccount] = findNameRecord(
                                nameAccount,
                                nameHouse,
                            );
                            const nftRecordData =
                                yield NftRecord.fromAccountAddress(
                                    this.connection,
                                    nftRecordAccount,
                                );
                            nftRecordsSet.add(nftRecordData);
                        }),
                    ),
                );
                yield Promise.all(activeRecordPromises);
                nftRecords = [...nftRecordsSet.values()];
            }
            let nameAccountsNftRecords = [];
            if (nftRecords) {
                nameAccountsNftRecords =
                    nftRecords === null || nftRecords === void 0
                        ? void 0
                        : nftRecords.map(nftRecord =>
                              nftRecord.nameAccount.toString(),
                          );
            }
            const fetchableAccounts = [];
            [...nameAccountsNftRecords, ...accounts].forEach(keys =>
                fetchableAccounts.push(new PublicKey(keys)),
            );
            const chunkedFetchableAccounts = chunkArrayPublicKeys(
                fetchableAccounts,
                100,
            );
            const fetchedAccountDetails = [];
            for (let fetchableAccountsChunked in chunkedFetchableAccounts) {
                const accounts = yield this.connection.getMultipleAccountsInfo(
                    chunkedFetchableAccounts[fetchableAccountsChunked],
                );
                const promises = accounts.map((account, index) =>
                    limit(() =>
                        __awaiter(this, void 0, void 0, function* () {
                            var _b, _c;
                            if (
                                !(account === null || account === void 0
                                    ? void 0
                                    : account.data)
                            )
                                return;
                            const domainRecord =
                                NameRecordHeader.fromAccountInfo(account);
                            if (!domainRecord) return;
                            const domainName =
                                (_b = yield this.reverseLookupNameAccount(
                                    chunkedFetchableAccounts[
                                        fetchableAccountsChunked
                                    ][index],
                                )) === null || _b === void 0
                                    ? void 0
                                    : _b.trim();
                            let nftDetails = { isNft: false };
                            try {
                                if (
                                    heliusApiKey &&
                                    nftRecords.length > 0 &&
                                    ((_c = nftRecords[index]) === null ||
                                    _c === void 0
                                        ? void 0
                                        : _c.nftMintAccount)
                                ) {
                                    nftDetails = {
                                        isNft: true,
                                        nft: nftRecords[index].nftMintAccount,
                                        metadata: activeNfts[index],
                                    };
                                }
                            } catch (_d) {}
                            const domainDetails = Object.assign(
                                {
                                    parentName: domainRecord.parentName,
                                    owner: domainRecord.owner,
                                    expiresAt: domainRecord.expiresAt,
                                    domainName: domainName,
                                    domainAccount:
                                        chunkedFetchableAccounts[
                                            fetchableAccountsChunked
                                        ][index],
                                },
                                nftDetails,
                            );
                            fetchedAccountDetails.push(domainDetails);
                        }),
                    ),
                );
                yield Promise.all(promises);
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
        });
    }
}
//# sourceMappingURL=solve.js.map
