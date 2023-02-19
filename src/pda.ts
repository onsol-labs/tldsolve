import {TLD_HOUSE_PROGRAM_ID} from '@onsol/tldparser';
import {PublicKey} from '@solana/web3.js';
import {TLD_HOUSE_PREFIX} from './constants';

export function findTldHouse(tldString: string) {
    tldString = tldString.toLowerCase();
    return PublicKey.findProgramAddressSync(
        [Buffer.from(TLD_HOUSE_PREFIX), Buffer.from(tldString)],
        TLD_HOUSE_PROGRAM_ID,
    );
}
