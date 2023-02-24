import { NameRegistryState } from '@bonfida/spl-name-service';
import { NameRecordHeader } from '@onsol/tldparser';
import { PublicKey, Connection } from '@solana/web3.js';
import { Domain } from './model';
import { MainDomain } from './types/main_domain';
import { Protocol } from './types/protocol';
/**
 * TldSolve, solves for ans and sns domains.
 */
export declare class TldSolve {
    private readonly connection;
    /**
     * Creates an instance of TldSolve.
     *
     * @constructor
     * @param {Connection} connection
     */
    constructor(connection: Connection);
    /**
     * retrieves userAccount main domain or favorite domain in sns.
     *
     * @async
     * @param {(PublicKey | string)} userAccount of interest.
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<MainDomain | undefined>)}
     */
    getMainDomain(
        userAccount: PublicKey | string,
        protocol?: Protocol,
    ): Promise<MainDomain | undefined>;
    /**
     * resolves any domain name.
     *
     * @async
     * @param {string} domain to be resolved.
     * @returns {(Promise<NameRecordHeader | NameRegistryState | undefined>)}
     */
    resolveDomain(
        domain: string,
    ): Promise<NameRecordHeader | NameRegistryState | undefined>;
    /**
     * retrieve owner from a domain.
     *
     * @async
     * @param {string} domain to retrieve owner of.
     * @returns {(Promise<PublicKey | undefined>)}
     */
    getOwnerFromDomain(domain: string): Promise<PublicKey | undefined>;
    /**
     * retrieves nameAccount publickey from domain name.
     *
     * @async
     * @param {string} domain to retrieve name account.
     * @returns {(Promise<PublicKey | undefined>)}
     */
    getNameAccountFromDomain(domain: string): Promise<PublicKey | undefined>;
    /**
     * retrieve all domains from user based on protocol.
     *
     * @async
     * @param {(PublicKey | string)} userAccount to be looked for.
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<PublicKey[] | undefined>)}
     */
    getAllDomainsFromUser(
        userAccount: PublicKey | string,
        protocol?: Protocol,
    ): Promise<PublicKey[] | undefined>;
    /**
     * retrieve all domains from user based on tld (e.g. abc, sol, bonk, etc.).
     *
     * @async
     * @param {(PublicKey | string)} userAccount to be looked for.
     * @param {string} tld without the dot.
     * @returns {(Promise<PublicKey[] | undefined>)}
     */
    getAllDomainsFromUserFromTld(
        userAccount: PublicKey | string,
        tld: string,
    ): Promise<PublicKey[] | undefined>;
    /**
     * reverse lookup for nameAccount public key, to retrieve domain name.
     * works for both ANS and SNS.
     *
     * @async
     * @param {(PublicKey | string)} nameAccount domain publickey
     * @param {?(PublicKey | string)} [parentAccountOwner] parentAccount is the nameclass for the reverse lookup account. leave empty for SNS.
     * @returns {(Promise<string | undefined>)}
     */
    reverseLookupNameAccountWithKnownParent(
        nameAccount: PublicKey | string,
        parentAccountOwner?: PublicKey | string,
    ): Promise<string | undefined>;
    /**
     * reverse lookup for nameAccount public key, to retrieve domain name.
     * based on protocol.
     *
     * @async
     * @param {(PublicKey | string)} nameAccount
     * @param {Protocol} [protocol=Protocol.ANS]
     * @returns {(Promise<string | undefined>)}
     */
    reverseLookupNameAccount(
        nameAccount: PublicKey | string,
        protocol?: Protocol,
    ): Promise<string | undefined>;
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
        userAccount: PublicKey | string,
        heliusApiKey?: string,
        tld?: 'abc' | 'bonk' | 'poor',
        limitRPS?: number,
    ): Promise<Domain[] | undefined>;
}
//# sourceMappingURL=solve.d.ts.map
