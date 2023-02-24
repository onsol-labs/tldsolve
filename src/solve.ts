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
import { PublicKey, Connection } from '@solana/web3.js';
import { findTldHouse } from './pda';
import { MainDomain } from './types/main_domain';
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
    constructor(private readonly connection: Connection) {}

    /**
     * retrieves userAccount main domain or favorite domain in sns.
     *
     * @async
     * @param {(PublicKey | string)} userAccount of interest.
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<MainDomain | undefined>)}
     */
    async getMainDomain(
        userAccount: PublicKey | string,
        protocol: Protocol = Protocol.ANS,
    ): Promise<MainDomain | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        if (protocol === Protocol.SNS) {
            // sns
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

    /**
     * resolves any domain name to its raw state.
     *
     * @async
     * @param {string} domain to be resolved.
     * @returns {(Promise<NameRecordHeader | NameRegistryState | undefined>)}
     */
    async resolveDomain(
        domain: string,
    ): Promise<NameRecordHeader | NameRegistryState | undefined> {
        const domainSplit = domain.split('.');
        const tldName = domainSplit.at(-1);
        if (tldName === 'sol') {
            // sns
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

    /**
     * retrieve owner from a domain.
     *
     * @async
     * @param {string} domain to retrieve owner of.
     * @returns {(Promise<PublicKey | undefined>)}
     */
    async getOwnerFromDomain(domain: string): Promise<PublicKey | undefined> {
        const domainSplit = domain.split('.');
        const tldName = domainSplit.at(-1);
        if (tldName === 'sol') {
            // sns
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
     * retrieves nameAccount publickey from domain name.
     *
     * @async
     * @param {string} domain to retrieve name account.
     * @returns {(Promise<PublicKey | undefined>)}
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

    /**
     * retrieve all domains from user based on protocol.
     *
     * @async
     * @param {(PublicKey | string)} userAccount to be looked for.
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<PublicKey[] | undefined>)}
     */
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
                const domainsSNS = await getAllSNSDomains(
                    this.connection,
                    userAccount,
                );
                return domainsSNS;
            default:
                // retrieves from both ans and sns.
                const domainsANSDefault = await findOwnedNameAccountsForUser(
                    this.connection,
                    userAccount,
                    undefined,
                );
                const domainsSNSDefault = await getAllSNSDomains(
                    this.connection,
                    userAccount,
                );
                const allDomains = domainsANSDefault.concat(domainsSNSDefault);
                return allDomains;
        }
    }

    /**
     * retrieve all domains from user based on tld (e.g. abc, sol, bonk, etc.).
     *
     * @async
     * @param {(PublicKey | string)} userAccount to be looked for.
     * @param {string} tld without the dot.
     * @returns {(Promise<PublicKey[] | undefined>)}
     */
    async getAllDomainsFromUserFromTld(
        userAccount: PublicKey | string,
        tld: string,
    ): Promise<PublicKey[] | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        if (tld === 'sol') {
            const domainsSPL = await getAllSNSDomains(
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

    /**
     * reverse lookup for nameAccount public key, to retrieve domain name.
     * works for both ANS and SNS.
     *
     * @async
     * @param {(PublicKey | string)} nameAccount domain publickey
     * @param {?(PublicKey | string)} [parentAccountOwner] parentAccount is the nameclass for the reverse lookup account. leave empty for SNS.
     * @returns {(Promise<string | undefined>)}
     */
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
            const domainName = await performSNSReverseLookup(
                this.connection,
                nameAccount,
            );
            return domainName;
        }
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
                let domainNameSNS = await performSNSReverseLookup(
                    this.connection,
                    nameAccount,
                );
                return domainNameSNS;
            default:
                let domainName: string;
                domainName = await performSNSReverseLookup(
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
}
