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
import { findTldHouse } from './pda';
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
     * resolves any domain name to its raw state.
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
            const parser = new TldParser(this.connection);
            const owner = yield parser.getOwnerFromDomainTld(domain);
            return owner;
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
}
//# sourceMappingURL=solve.js.map
