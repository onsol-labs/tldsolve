'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.findCollectionMint =
    exports.findNameRecord =
    exports.findNameHouse =
    exports.findTldHouse =
        void 0;
const tldparser_1 = require('@onsol/tldparser');
const web3_js_1 = require('@solana/web3.js');
const constants_1 = require('./constants');
function findTldHouse(tldString) {
    tldString = tldString.toLowerCase();
    return web3_js_1.PublicKey.findProgramAddressSync(
        [Buffer.from(constants_1.TLD_HOUSE_PREFIX), Buffer.from(tldString)],
        tldparser_1.TLD_HOUSE_PROGRAM_ID,
    );
}
exports.findTldHouse = findTldHouse;
function findNameHouse(tldHouse) {
    return web3_js_1.PublicKey.findProgramAddressSync(
        [Buffer.from(constants_1.NAME_HOUSE_PREFIX), tldHouse.toBuffer()],
        constants_1.NAME_HOUSE_PROGRAM_ID,
    );
}
exports.findNameHouse = findNameHouse;
function findNameRecord(nameAccount, nameHouseAccount) {
    return web3_js_1.PublicKey.findProgramAddressSync(
        [
            Buffer.from(constants_1.NFT_RECORD_PREFIX),
            nameHouseAccount.toBuffer(),
            nameAccount.toBuffer(),
        ],
        constants_1.NAME_HOUSE_PROGRAM_ID,
    );
}
exports.findNameRecord = findNameRecord;
function findCollectionMint(tldHouse) {
    return web3_js_1.PublicKey.findProgramAddressSync(
        [Buffer.from(constants_1.COLLECTION_PREFIX), tldHouse.toBuffer()],
        constants_1.NAME_HOUSE_PROGRAM_ID,
    );
}
exports.findCollectionMint = findCollectionMint;
//# sourceMappingURL=pda.js.map
