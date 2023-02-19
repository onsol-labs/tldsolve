import { Connection, PublicKey } from '@solana/web3.js';
import { SPL_TOKEN_PROGRAM_ID } from '../constants';
import axios from 'axios';

const getMetadataDatas = async (
    nftAddresses: string[],
    heliusApiKey: string,
) => {
    const url = `https://api.helius.xyz/v0/tokens/metadata?api-key=${heliusApiKey}`;
    if (nftAddresses.length > 100) {
        const axiosRequests: any[] = [];

        while (nftAddresses.length > 0)
            axiosRequests.push(
                axios.post(url, { mintAccounts: nftAddresses.splice(0, 100) }),
            );

        return await axios.all(axiosRequests).then(responses => {
            const metadata = {
                data: [],
            };
            for (const response of responses) {
                metadata.data = metadata.data.concat(response.data);
            }
            console.log(metadata);
            return metadata;
        });
    } else {
        return await axios.post(url, { mintAccounts: nftAddresses });
    }
};

export const getParsedNftAccountsByOwner = async (
    connection: Connection,
    owner: PublicKey,
    heliusApiKey: string,
) => {
    const { value: splAccounts } =
        await connection.getParsedTokenAccountsByOwner(owner, {
            programId: SPL_TOKEN_PROGRAM_ID,
        });

    const nftAccounts = splAccounts
        .filter(t => {
            const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            const decimals =
                t.account?.data?.parsed?.info?.tokenAmount?.decimals;
            return decimals === 0 && amount >= 1;
        })
        .map(t => {
            const address = t.account?.data?.parsed?.info?.mint;
            return address;
        });

    const ownerNfts = await getMetadataDatas(nftAccounts, heliusApiKey);

    return ownerNfts?.data;
};

export type OnsolTokenType = {
    mintAddress: PublicKey;
    amount: string | number;
};

export const getParsedTokenAccountsByOwner = async (
    owner: PublicKey,
    connection: Connection,
): Promise<OnsolTokenType[]> => {
    const { value: splAccounts } =
        await connection.getParsedTokenAccountsByOwner(owner, {
            programId: SPL_TOKEN_PROGRAM_ID,
        });

    const nftAccounts = splAccounts
        .filter(t => {
            const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            const decimals =
                t.account?.data?.parsed?.info?.tokenAmount?.decimals;
            return decimals === 0 && amount >= 1;
        })
        .map(t => {
            const mintAddress = t.account?.data?.parsed?.info?.mint;
            const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            return { mintAddress, amount };
        });

    return nftAccounts;
};
