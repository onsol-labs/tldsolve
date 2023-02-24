'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.COLLECTION_PREFIX =
    exports.NFT_RECORD_PREFIX =
    exports.NAME_HOUSE_PREFIX =
    exports.TLD_HOUSE_PREFIX =
    exports.NAME_HOUSE_PROGRAM_ID =
    exports.SPL_TOKEN_PROGRAM_ID =
    exports.TOKEN_METADATA_PROGRAM_ID =
        void 0;
const web3_js_1 = require('@solana/web3.js');
exports.TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);
exports.SPL_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
exports.NAME_HOUSE_PROGRAM_ID = new web3_js_1.PublicKey(
    'NH3uX6FtVE2fNREAioP7hm5RaozotZxeL6khU1EHx51',
);
exports.TLD_HOUSE_PREFIX = 'tld_house';
exports.NAME_HOUSE_PREFIX = 'name_house';
exports.NFT_RECORD_PREFIX = 'nft_record';
exports.COLLECTION_PREFIX = 'name_collection';
//# sourceMappingURL=constants.js.map
