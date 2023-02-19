import {
    getDomainKey as getSPLDomainKey,
    NameRegistryState,
    getAllDomains as getAllSPLDomains,
    performReverseLookup as performSPLReverseLookup,
} from '@bonfida/spl-name-service';
import {
    findOwnedNameAccountsForUser,
    getDomainKey,
    NameRecordHeader,
    TldParser,
} from '@onsol/tldparser';
import {PublicKey, Connection} from '@solana/web3.js';
import {Domain} from './model';
import {findTldHouse} from './pda';

export class TldSolve {
    constructor(private readonly connection: Connection) {}

    async resolveDomain(
        domain: string,
    ): Promise<NameRecordHeader | NameRegistryState | undefined> {
        const domainSplit = domain.split('.');
        const tldName = domainSplit.at(-1);
        if (tldName === '.sol') {
            // solana
            const {pubkey} = await getSPLDomainKey(domain);
            const {registry} = await NameRegistryState.retrieve(
                this.connection,
                pubkey,
            );
            return registry;
        }
        // ans
        const {pubkey} = await getDomainKey(domain);
        const nameRecordHeader = await NameRecordHeader.fromAccountAddress(
            this.connection,
            pubkey,
        );
        return nameRecordHeader;
    }

    async getOwnerFromDomain(domain: string): Promise<PublicKey | undefined> {
        const domainSplit = domain.split('.');
        const tldName = domainSplit.at(-1);
        if (tldName === '.sol') {
            // solana
            const {pubkey} = await getSPLDomainKey(domain);
            const {registry} = await NameRegistryState.retrieve(
                this.connection,
                pubkey,
            );
            return registry.owner;
        }
        // ans
        const {pubkey} = await getDomainKey(domain);
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
            const {pubkey} = await getSPLDomainKey(domain);
            return pubkey;
        }
        // ans
        const {pubkey} = await getDomainKey(domain);
        return pubkey;
    }

    async getAllDomainsFromUser(
        userAccount: PublicKey | string,
        domainType: 'ANS' | 'SOL' | 'ANY',
    ): Promise<PublicKey[] | undefined> {
        if (typeof userAccount == 'string') {
            userAccount = new PublicKey(userAccount);
        }
        if (domainType === 'ANS') {
            const domainsANS = await findOwnedNameAccountsForUser(
                this.connection,
                userAccount,
                undefined,
            );
            return domainsANS;
        } else if (domainType === 'SOL') {
            const domainsSPL = await getAllSPLDomains(
                this.connection,
                userAccount,
            );
            return domainsSPL;
        }
        const domainsANS = await findOwnedNameAccountsForUser(
            this.connection,
            userAccount,
            undefined,
        );
        const domainsSPL = await getAllSPLDomains(this.connection, userAccount);
        const allDomains = domainsANS.concat(domainsSPL);
        return allDomains;
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
        parentAccountOwner: PublicKey | string,
    ): Promise<string | undefined> {
        const parser = new TldParser(this.connection);
        const domainName = await parser.reverseLookupNameAccount(
            nameAccount,
            parentAccountOwner,
        );
        if (!domainName) {
            if (typeof nameAccount == 'string') {
                nameAccount = new PublicKey(nameAccount);
            }
            const domainName = await performSPLReverseLookup(
                this.connection,
                nameAccount,
            );
            return domainName;
        }
        return domainName;
    }

    async reverseLookupNameAccount(
        nameAccount: PublicKey | string,
    ): Promise<string | undefined> {
        if (typeof nameAccount == 'string') {
            nameAccount = new PublicKey(nameAccount);
        }
        const nameRecordHeader = await NameRecordHeader.fromAccountAddress(
            this.connection,
            nameAccount,
        );
        if (!nameRecordHeader) return;
        const parser = new TldParser(this.connection);
        const tld = await parser.getTldFromParentAccount(
            nameRecordHeader.parentName,
        );
        const [tldHouse] = findTldHouse('.' + tld);
        const domainName = await parser.reverseLookupNameAccount(
            nameAccount,
            tldHouse,
        );
        if (!domainName) {
            if (typeof nameAccount == 'string') {
                nameAccount = new PublicKey(nameAccount);
            }
            const domainName = await performSPLReverseLookup(
                this.connection,
                nameAccount,
            );
            return domainName;
        }
        return domainName;
    }

    // async batchResolveAllDomains(
    //   userAccount: PublicKey | string,
    //   domainType: 'ANS' | 'SOL' | 'ANY',
    //   limitRPS: number = 10
    // ): Promise<Domain[] | undefined> {
    //   if (typeof userAccount == 'string') {
    //     userAccount = new PublicKey(userAccount);
    //   }
    //   let accounts: string[] = [];
    //   if (domainType === 'ANS' || domainType === 'ANY') {
    //     const ansDomains = (
    //       await this.getAllDomainsFromUser(userAccount, 'ANY')
    //     );
    //     if (domainType === 'ANS') {
    //       if (!ansDomains) return;
    //       accounts = ansDomains.map((keys: PublicKey) => keys.toString());
    //     }
    //   }
    // }
}
