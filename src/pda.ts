import {TLD_HOUSE_PROGRAM_ID} from '@onsol/tldparser';
import {PublicKey} from '@solana/web3.js';
import {
    NAME_HOUSE_PREFIX,
    NFT_RECORD_PREFIX,
    TLD_HOUSE_PREFIX,
    NAME_HOUSE_PROGRAM_ID,
    COLLECTION_PREFIX,
} from './constants';

export function findTldHouse(tldString: string) {
    tldString = tldString.toLowerCase();
    return PublicKey.findProgramAddressSync(
        [Buffer.from(TLD_HOUSE_PREFIX), Buffer.from(tldString)],
        TLD_HOUSE_PROGRAM_ID,
    );
}

export function findNameHouse(tldHouse: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(NAME_HOUSE_PREFIX), tldHouse.toBuffer()],
        NAME_HOUSE_PROGRAM_ID,
    );
}

export function findNameRecord(
    nameAccount: PublicKey,
    nameHouseAccount: PublicKey,
) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(NFT_RECORD_PREFIX),
            nameHouseAccount.toBuffer(),
            nameAccount.toBuffer(),
        ],
        NAME_HOUSE_PROGRAM_ID,
    );
}

export function findCollectionMint(tldHouse: PublicKey) {
  return PublicKey.findProgramAddressSync(
      [Buffer.from(COLLECTION_PREFIX), tldHouse.toBuffer()],
      NAME_HOUSE_PROGRAM_ID,
  );
}