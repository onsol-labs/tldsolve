'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
exports.TldSolve = void 0;
const spl_name_service_1 = require('@bonfida/spl-name-service');
const tldparser_1 = require('@onsol/tldparser');
const web3_js_1 = require('@solana/web3.js');
const pda_1 = require('./pda');
const protocol_1 = require('./types/protocol');
/**
 * TldSolve, solves for ans and sns domains.
 */
class TldSolve {
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
    getMainDomain(userAccount, protocol = protocol_1.Protocol.ANS) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userAccount == 'string') {
                userAccount = new web3_js_1.PublicKey(userAccount);
            }
            if (protocol === protocol_1.Protocol.SNS) {
                // sns
                const favoriteDomain = yield (0,
                spl_name_service_1.getFavoriteDomain)(
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
            const parser = new tldparser_1.TldParser(this.connection);
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
                const { pubkey } = yield (0, spl_name_service_1.getDomainKey)(
                    domain,
                );
                const { registry } =
                    yield spl_name_service_1.NameRegistryState.retrieve(
                        this.connection,
                        pubkey,
                    );
                return registry;
            }
            // ans
            const { pubkey } = yield (0, tldparser_1.getDomainKey)(domain);
            const nameRecordHeader =
                yield tldparser_1.NameRecordHeader.fromAccountAddress(
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
                const { pubkey } = yield (0, spl_name_service_1.getDomainKey)(
                    domain,
                );
                const { registry } =
                    yield spl_name_service_1.NameRegistryState.retrieve(
                        this.connection,
                        pubkey,
                    );
                return registry.owner;
            }
            // ans
            const parser = new tldparser_1.TldParser(this.connection);
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
                const { pubkey } = yield (0, spl_name_service_1.getDomainKey)(
                    domain,
                );
                return pubkey;
            }
            // ans
            const { pubkey } = yield (0, tldparser_1.getDomainKey)(domain);
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
    getAllDomainsFromUser(userAccount, protocol = protocol_1.Protocol.ANS) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof userAccount == 'string') {
                userAccount = new web3_js_1.PublicKey(userAccount);
            }
            switch (protocol) {
                case protocol_1.Protocol.ANS:
                    const domainsANS = yield (0,
                    tldparser_1.findOwnedNameAccountsForUser)(
                        this.connection,
                        userAccount,
                        undefined,
                    );
                    return domainsANS;
                case protocol_1.Protocol.SNS:
                    const domainsSNS = yield (0,
                    spl_name_service_1.getAllDomains)(
                        this.connection,
                        userAccount,
                    );
                    return domainsSNS;
                default:
                    // retrieves from both ans and sns.
                    const domainsANSDefault = yield (0,
                    tldparser_1.findOwnedNameAccountsForUser)(
                        this.connection,
                        userAccount,
                        undefined,
                    );
                    const domainsSNSDefault = yield (0,
                    spl_name_service_1.getAllDomains)(
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
                userAccount = new web3_js_1.PublicKey(userAccount);
            }
            if (tld === 'sol') {
                const domainsSPL = yield (0, spl_name_service_1.getAllDomains)(
                    this.connection,
                    userAccount,
                );
                return domainsSPL;
            }
            const parser = new tldparser_1.TldParser(this.connection);
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
            const parser = new tldparser_1.TldParser(this.connection);
            if (parentAccountOwner) {
                const domainName = yield parser.reverseLookupNameAccount(
                    nameAccount,
                    parentAccountOwner,
                );
                return domainName;
            } else {
                if (typeof nameAccount == 'string') {
                    nameAccount = new web3_js_1.PublicKey(nameAccount);
                }
                const domainName = yield (0,
                spl_name_service_1.performReverseLookup)(
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
    reverseLookupNameAccount(nameAccount, protocol = protocol_1.Protocol.ANS) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof nameAccount == 'string') {
                nameAccount = new web3_js_1.PublicKey(nameAccount);
            }
            switch (protocol) {
                case protocol_1.Protocol.ANS:
                    const nameRecordHeaderANS =
                        yield tldparser_1.NameRecordHeader.fromAccountAddress(
                            this.connection,
                            nameAccount,
                        );
                    if (!nameRecordHeaderANS) return;
                    const tldParser = new tldparser_1.TldParser(
                        this.connection,
                    );
                    const tldFound = yield tldParser.getTldFromParentAccount(
                        nameRecordHeaderANS.parentName,
                    );
                    const [tldHouseKey] = (0, pda_1.findTldHouse)(tldFound);
                    const domainNameANS =
                        yield tldParser.reverseLookupNameAccount(
                            nameAccount,
                            tldHouseKey,
                        );
                    return domainNameANS;
                case protocol_1.Protocol.SNS:
                    let domainNameSNS = yield (0,
                    spl_name_service_1.performReverseLookup)(
                        this.connection,
                        nameAccount,
                    );
                    return domainNameSNS;
                default:
                    let domainName;
                    domainName = yield (0,
                    spl_name_service_1.performReverseLookup)(
                        this.connection,
                        nameAccount,
                    );
                    if (domainName) return domainName;
                    const nameRecordHeader =
                        yield tldparser_1.NameRecordHeader.fromAccountAddress(
                            this.connection,
                            nameAccount,
                        );
                    if (!nameRecordHeader) return;
                    const parser = new tldparser_1.TldParser(this.connection);
                    const tld = yield parser.getTldFromParentAccount(
                        nameRecordHeader.parentName,
                    );
                    const [tldHouse] = (0, pda_1.findTldHouse)(tld);
                    domainName = yield parser.reverseLookupNameAccount(
                        nameAccount,
                        tldHouse,
                    );
                    return domainName;
            }
        });
    }
}
exports.TldSolve = TldSolve;
//# sourceMappingURL=solve.js.map
