//   /**
//    * Batch resolve ANS domains held by the userAccount
//    *
//    * @async
//    * @param {(PublicKey | string)} userAccount domain owner
//    * @param {?string} [heliusApiKey] optional helius api key.
//    * @param {('abc' | 'bonk' | 'poor')} [tld='abc']
//    * @param {number} [limitRPS=10] limits depend on your rpc connection rps limit/3.
//    * @returns {(Promise<Domain[] | undefined>)}
//    */
//    async batchResolveANSDomains(
//     userAccount: PublicKey | string,
//     heliusApiKey?: string,
//     tld: 'abc' | 'bonk' | 'poor' = 'abc',
//     limitRPS: number = 10,
// ): Promise<Domain[] | undefined> {
//     if (typeof userAccount == 'string') {
//         userAccount = new PublicKey(userAccount);
//     }
//     const [tldHouse] = findTldHouse('.' + tld);
//     let accounts: string[] = [];
//     const ansDomains = await this.getAllDomainsFromUserFromTld(
//         userAccount,
//         tld,
//     );
//     if (!ansDomains) return;
//     accounts = ansDomains.map((keys: PublicKey) => keys.toString());
//     let nftRecords: NftRecord[] = [];
//     let activeNfts = [];
//     const limit = pLimit(limitRPS);
//     if (heliusApiKey) {
//         const [nameHouse] = findNameHouse(tldHouse);
//         const [tldCollection] = findCollectionMint(tldHouse);
//         const userNfts = await getParsedNftAccountsByOwner(
//             this.connection,
//             userAccount,
//             heliusApiKey,
//         );

//         activeNfts = userNfts.filter(
//             (t: any) =>
//                 t?.onChainData?.collection &&
//                 t?.onChainData?.collection.verified &&
//                 // domains verified collection.
//                 t?.onChainData?.collection?.key?.toString() ===
//                     tldCollection.toString(),
//         );

//         const nftRecordsSet = new Set<NftRecord>();
//         const activeRecordPromises = activeNfts.map((activeAccount: any) =>
//             limit(async () => {
//                 let domain = activeAccount.offChainData?.name;
//                 if (!domain) {
//                     domain = activeAccount.onChainData.data.name;
//                 }
//                 const { pubkey: nameAccount } = await getDomainKey(
//                     `${domain}.${tld}`,
//                 );
//                 const [nftRecordAccount] = findNameRecord(
//                     nameAccount,
//                     nameHouse,
//                 );
//                 const nftRecordData = await NftRecord.fromAccountAddress(
//                     this.connection,
//                     nftRecordAccount,
//                 );
//                 nftRecordsSet.add(nftRecordData);
//             }),
//         );

//         await Promise.all(activeRecordPromises);
//         nftRecords = [...nftRecordsSet.values()];
//     }
//     let nameAccountsNftRecords: string[] = [];
//     if (nftRecords) {
//         nameAccountsNftRecords = nftRecords?.map((nftRecord: NftRecord) =>
//             nftRecord.nameAccount.toString(),
//         );
//     }
//     const fetchableAccounts: PublicKey[] = [];
//     [...nameAccountsNftRecords, ...accounts].forEach(keys =>
//         fetchableAccounts.push(new PublicKey(keys)),
//     );
//     const chunkedFetchableAccounts: PublicKey[][] = chunkArrayPublicKeys(
//         fetchableAccounts,
//         100,
//     );

//     const fetchedAccountDetails: Domain[] = [];
//     for (let fetchableAccountsChunked in chunkedFetchableAccounts) {
//         const accounts = await this.connection.getMultipleAccountsInfo(
//             chunkedFetchableAccounts[fetchableAccountsChunked],
//         );
//         const promises = accounts.map((account, index) =>
//             limit(async () => {
//                 if (!account?.data) return;
//                 const domainRecord =
//                     NameRecordHeader.fromAccountInfo(account);
//                 if (!domainRecord) return;
//                 const domainName = (
//                     await this.reverseLookupNameAccount(
//                         chunkedFetchableAccounts[fetchableAccountsChunked][
//                             index
//                         ],
//                     )
//                 )?.trim();
//                 let nftDetails: any = { isNft: false };
//                 try {
//                     if (
//                         heliusApiKey &&
//                         nftRecords.length > 0 &&
//                         nftRecords[index]?.nftMintAccount
//                     ) {
//                         nftDetails = {
//                             isNft: true,
//                             nft: nftRecords[index].nftMintAccount,
//                             metadata: activeNfts[index],
//                         };
//                     }
//                 } catch {}
//                 const domainDetails: Domain = {
//                     parentName: domainRecord.parentName,
//                     owner: domainRecord.owner,
//                     expiresAt: domainRecord.expiresAt,
//                     domainName: domainName,
//                     domainAccount:
//                         chunkedFetchableAccounts[fetchableAccountsChunked][
//                             index
//                         ],
//                     ...nftDetails,
//                 };
//                 fetchedAccountDetails.push(domainDetails);
//             }),
//         );

//         await Promise.all(promises);
//     }
//     if (fetchedAccountDetails.length > 0) {
//         fetchedAccountDetails.sort((a, b) =>
//             a.domainName.localeCompare(b.domainName, undefined, {
//                 numeric: true,
//                 sensitivity: 'base',
//             }),
//         );
//     }

//     return fetchedAccountDetails;
// }
