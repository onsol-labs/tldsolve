import { Protocol } from '../src/types/protocol';
import { TldSolve } from '../src/solve';
import { Connection, PublicKey } from '@solana/web3.js';
import { findTldHouse } from '../src/pda';

const RPC_URL = '';
const HELIUS_API = '';
const connection = new Connection(RPC_URL);
const owner = new PublicKey('2EGGxj2qbNAJNgLCPKca8sxZYetyTjnoRspTPjzN2D67');

describe('tldSolve tests', () => {
    it('should perform retrieval of all ans user domains', async () => {
      const solver = new TldSolve(connection);
      // ANS Domains
      const allDomains = await solver.getAllDomainsFromUser(owner);
      // console.log("ANSDomains: ", allDomains?.length)
      expect(allDomains).toHaveLength(20);
    });
    it('should perform retrieval of all sol user domains', async () => {
      const solver = new TldSolve(connection);
      const allDomains = await solver.getAllDomainsFromUser(owner, Protocol.SNS);
      // console.log("SPLDomains: ", allDomains?.length)
      expect(allDomains).toHaveLength(15);
    });
    it('should perform retrieval of all user domains', async () => {
      const solver = new TldSolve(connection);
      const allDomains = await solver.getAllDomainsFromUser(owner, Protocol.ALL);
      // console.log("AllDomains: ", allDomains?.length)
      expect(allDomains).toHaveLength(35);
    });
    it('should perform retrieval of ans main domain', async () => {
      const solver = new TldSolve(connection);
      const mainDomain = await solver.getMainDomain(owner);
      // console.log("mainDomain: ", mainDomain)
      expect(mainDomain?.domain).toStrictEqual(expect.stringContaining('miester'));
    });
    it('should perform retrieval of sns main domain', async () => {
      const solver = new TldSolve(connection);
      const mainDomain = await solver.getMainDomain(owner, Protocol.SNS);
      // console.log("mainDomain: ", mainDomain)
      expect(mainDomain?.domain).toStrictEqual(expect.stringContaining('miester'));
    });
    it('should perform retrieval of NameRecordHeader of miester.abc', async () => {
      const solver = new TldSolve(connection);
      const resolvedDomain = await solver.resolveDomain('miester.abc');
      // console.log("resolvedDomain: ", resolvedDomain)
      expect(resolvedDomain?.owner?.toBase58()).toStrictEqual(expect.stringContaining(owner.toBase58()));
    });
    it('should perform retrieval of NameRecordHeader of miester.sol', async () => {
      const solver = new TldSolve(connection);
      const resolvedDomain = await solver.resolveDomain('miester.sol');
      // console.log("resolvedDomain: ", resolvedDomain)
      expect(resolvedDomain?.owner?.toBase58()).toStrictEqual(expect.stringContaining(owner.toBase58()));
    });
    it('should perform retrieval of owner of miester.abc', async () => {
      const solver = new TldSolve(connection);
      const domainOwner = await solver.getOwnerFromDomain('miester.abc');
      // console.log("owner: ", owner?.toBase58())
      expect(domainOwner?.toBase58()).toStrictEqual(expect.stringContaining(owner.toBase58()));

    });
    it('should perform retrieval of owner of miester.sol', async () => {
      const solver = new TldSolve(connection);
      const domainOwner = await solver.getOwnerFromDomain('miester.sol');
      // console.log("owner: ", owner?.toBase58())
      expect(domainOwner?.toBase58()).toStrictEqual(expect.stringContaining(owner.toBase58()));
    });
    it('should perform retrieval of nameAccount of miester.abc', async () => {
      const solver = new TldSolve(connection);
      const nameAccount = await solver.getNameAccountFromDomain('miester.abc');
      // console.log("nameAccount: ", nameAccount?.toBase58())
      const miesterDotAbc = new PublicKey("9YzfCEHb62bQ47snUyjkxhC9Eb6y7CSodK3m8CKWstjV");
      expect(nameAccount?.toBase58()).toStrictEqual(expect.stringContaining(miesterDotAbc.toBase58()));
    });
    it('should perform retrieval of nameAccount of miester.sol', async () => {
      const solver = new TldSolve(connection);
      const nameAccount = await solver.getNameAccountFromDomain('miester.sol');
      // console.log("nameAccount: ", nameAccount?.toBase58())
      const miesterDotSol = new PublicKey("ErBfMkE1YJiqG1wxBr6TAG15WrTtcrWS3pZbEKKFRmUr");
      expect(nameAccount?.toBase58()).toStrictEqual(expect.stringContaining(miesterDotSol.toBase58()));
    });
    it('should perform retrieval of allAbcDomains owner in abc', async () => {
      const solver = new TldSolve(connection);
      const allAbcDomains = await solver.getAllDomainsFromUserFromTld(owner, 'abc');
      // console.log("allAbcDomains: ", allAbcDomains?.length)
      expect(allAbcDomains).toHaveLength(17);
    });
    it('should perform retrieval of allSNSDomains owner in sol', async () => {
      const solver = new TldSolve(connection);
      const allSNSDomains = await solver.getAllDomainsFromUserFromTld(owner, 'sol');
      // console.log("allSNSDomains: ", allSNSDomains?.length)
      expect(allSNSDomains).toHaveLength(15);
    });
    it('should perform retrieval of domain name from ANS nameAccount and parent account', async () => {
      const solver = new TldSolve(connection);
      const miesterDotAbc = new PublicKey("9YzfCEHb62bQ47snUyjkxhC9Eb6y7CSodK3m8CKWstjV");
      const [AbcTldHouse] = findTldHouse(".abc");
      const domain = await solver.reverseLookupNameAccountWithKnownParent(miesterDotAbc, AbcTldHouse);
      // console.log("domain: ", domain)
      expect(domain).toStrictEqual(expect.stringContaining('miester'));
    });
    it('should perform retrieval of domain name from SNS nameAccount', async () => {
      const solver = new TldSolve(connection);
      const miesterDotSol = new PublicKey("ErBfMkE1YJiqG1wxBr6TAG15WrTtcrWS3pZbEKKFRmUr");
      const domain = await solver.reverseLookupNameAccountWithKnownParent(miesterDotSol);
      // console.log("domain: ", domain)
      expect(domain).toStrictEqual(expect.stringContaining('miester'));
    });
    it('should perform retrieval of domain name from ANS nameAccount', async () => {
      const solver = new TldSolve(connection);
      const miesterDotAbc = new PublicKey("9YzfCEHb62bQ47snUyjkxhC9Eb6y7CSodK3m8CKWstjV");
      const domain = await solver.reverseLookupNameAccount(miesterDotAbc);
      // console.log("domain: ", domain)
      expect(domain).toStrictEqual(expect.stringContaining('miester'));
    });
    it('should perform retrieval of domain name from SNS nameAccount', async () => {
      const solver = new TldSolve(connection);
      const miesterDotSol = new PublicKey("ErBfMkE1YJiqG1wxBr6TAG15WrTtcrWS3pZbEKKFRmUr");
      const domain = await solver.reverseLookupNameAccount(miesterDotSol, Protocol.SNS);
      // console.log("domain: ", domain)
      expect(domain).toStrictEqual(expect.stringContaining('miester'));
    });
    it('should perform retrieval of batch resolving abc domains and abc nfts', async () => {
        const solver = new TldSolve(connection);
        const domains = await solver.batchResolveANSDomains(owner, HELIUS_API);
        // console.log("domains: ", domains)
        expect(domains).toHaveLength(17);
    });
});
