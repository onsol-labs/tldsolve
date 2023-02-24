# TLD Solve

Solana Multi Name Service Protocol Solver.

currently integrated:

1. All ANS domains.
2. SNS domain.
3. More to come.

## Examples:

the example below is a replica of the tests in `tests` folder

```js
// constants
const RPC_URL = '';
const owner = new PublicKey('owner pubkey');
const domain = 'miester.abc';

// initialize
const connection = new Connection(RPC_URL);
const solver = new TldSolve(connection);

// retrieves userAccount main domain or favorite domain in sns.
const mainDomain = await solver.getMainDomain(owner);
// { nameAccount: "9YzfCEHb62bQ47snUyjkxhC9Eb6y7CSodK3m8CKWstjV", tld: ".abc", domain: "miester" }
// or
// { nameAccount: "ErBfMkE1YJiqG1wxBr6TAG15WrTtcrWS3pZbEKKFRmUr", tld: ".sol", domain: "miester" }

// resolves any domain name to its raw state.
const nameRecordState = await solver.resolveDomain(domain);
// returns a NameRecordHeader state.

// retrieve owner of a particular domain
const owner = await solver.getOwnerFromDomain(domain);
// returns a owner pubkey

// retrieve nameAccount of domain
const nameAccount = await solver.getNameAccountFromDomain(domain);
// returns a nameAccount pubkey

// list of name account pubkeys owned by user (add protocol as a second argument for a specific protocol)
// Protocol.ANS | Protocol.SNS | Protocol.ALL
const ownerDomains = await solver.getAllDomainsFromUser(owner);
// returns a list of name accounts pubkeys

// list of name account pubkeys owned by user for a specific tld.
// works with any ANS and SNS domains.
// (no dot needed)
const ownerDomains = await solver.getAllDomainsFromUserFromTld(owner, tld);
// returns a list of name accounts pubkeys

// reverse lookup for nameAccount public key, to retrieve domain name.
// works for both ANS and SNS.
// known parentAccount in most cases is the TldHouse Account. leave empty for SNS.
const [AbcTldHouse] = findTldHouse('.abc');
const domain = await solver.reverseLookupNameAccountWithKnownParent(
    nameAccount,
    AbcTldHouse,
);
// domain name

// reverse lookup for nameAccount public key, based on Protocol.
// Protocol.ANS | Protocol.SNS | Protocol.ALL
const domain = await solver.reverseLookupNameAccount(nameAccount);
// domain name
```

## Active ANS Tlds

```
TLD     => parentAccountKey
.bonk   => 2j6gC6MMrnw4JJpAKR5FyyUFdxxvdZdG2sg4FrqfyWi5
.poor   => 8err4ThuTiZo9LbozHAvMrzXUmyPWj9urnMo38vC6FdQ
.abc    => 3pSeaEVTcKLkXPCpZHDpHUMWAogYFZgKSiVtyvqcgo8a
```

# Contribute

1. fork repo, make a new branch.
2. install dependencies `yarn`
3. add changes. please comment your code as much as you can.
4. follow the code style of the project, including indentation.
5. add tests in tests/ folder and do `yarn test`
6. add or change the documentation as needed.
7. do a PR.
