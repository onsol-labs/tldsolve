'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getParsedTokenAccountsByOwner = exports.getParsedNftAccountsByOwner =
    void 0;
const constants_1 = require('../constants');
const axios_1 = __importDefault(require('axios'));
const getMetadataDatas = (nftAddresses, heliusApiKey) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const url = `https://api.helius.xyz/v0/tokens/metadata?api-key=${heliusApiKey}`;
        if (nftAddresses.length > 100) {
            const axiosRequests = [];
            while (nftAddresses.length > 0)
                axiosRequests.push(
                    axios_1.default.post(url, {
                        mintAccounts: nftAddresses.splice(0, 100),
                    }),
                );
            return yield axios_1.default.all(axiosRequests).then(responses => {
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
            return yield axios_1.default.post(url, {
                mintAccounts: nftAddresses,
            });
        }
    });
const getParsedNftAccountsByOwner = (connection, owner, heliusApiKey) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const { value: splAccounts } =
            yield connection.getParsedTokenAccountsByOwner(owner, {
                programId: constants_1.SPL_TOKEN_PROGRAM_ID,
            });
        const nftAccounts = splAccounts
            .filter(t => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const amount =
                    (_e =
                        (_d =
                            (_c =
                                (_b =
                                    (_a = t.account) === null || _a === void 0
                                        ? void 0
                                        : _a.data) === null || _b === void 0
                                    ? void 0
                                    : _b.parsed) === null || _c === void 0
                                ? void 0
                                : _c.info) === null || _d === void 0
                            ? void 0
                            : _d.tokenAmount) === null || _e === void 0
                        ? void 0
                        : _e.uiAmount;
                const decimals =
                    (_k =
                        (_j =
                            (_h =
                                (_g =
                                    (_f = t.account) === null || _f === void 0
                                        ? void 0
                                        : _f.data) === null || _g === void 0
                                    ? void 0
                                    : _g.parsed) === null || _h === void 0
                                ? void 0
                                : _h.info) === null || _j === void 0
                            ? void 0
                            : _j.tokenAmount) === null || _k === void 0
                        ? void 0
                        : _k.decimals;
                return decimals === 0 && amount >= 1;
            })
            .map(t => {
                var _a, _b, _c, _d;
                const address =
                    (_d =
                        (_c =
                            (_b =
                                (_a = t.account) === null || _a === void 0
                                    ? void 0
                                    : _a.data) === null || _b === void 0
                                ? void 0
                                : _b.parsed) === null || _c === void 0
                            ? void 0
                            : _c.info) === null || _d === void 0
                        ? void 0
                        : _d.mint;
                return address;
            });
        const ownerNfts = yield getMetadataDatas(nftAccounts, heliusApiKey);
        return ownerNfts === null || ownerNfts === void 0
            ? void 0
            : ownerNfts.data;
    });
exports.getParsedNftAccountsByOwner = getParsedNftAccountsByOwner;
const getParsedTokenAccountsByOwner = (owner, connection) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const { value: splAccounts } =
            yield connection.getParsedTokenAccountsByOwner(owner, {
                programId: constants_1.SPL_TOKEN_PROGRAM_ID,
            });
        const nftAccounts = splAccounts
            .filter(t => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const amount =
                    (_e =
                        (_d =
                            (_c =
                                (_b =
                                    (_a = t.account) === null || _a === void 0
                                        ? void 0
                                        : _a.data) === null || _b === void 0
                                    ? void 0
                                    : _b.parsed) === null || _c === void 0
                                ? void 0
                                : _c.info) === null || _d === void 0
                            ? void 0
                            : _d.tokenAmount) === null || _e === void 0
                        ? void 0
                        : _e.uiAmount;
                const decimals =
                    (_k =
                        (_j =
                            (_h =
                                (_g =
                                    (_f = t.account) === null || _f === void 0
                                        ? void 0
                                        : _f.data) === null || _g === void 0
                                    ? void 0
                                    : _g.parsed) === null || _h === void 0
                                ? void 0
                                : _h.info) === null || _j === void 0
                            ? void 0
                            : _j.tokenAmount) === null || _k === void 0
                        ? void 0
                        : _k.decimals;
                return decimals === 0 && amount >= 1;
            })
            .map(t => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                const mintAddress =
                    (_d =
                        (_c =
                            (_b =
                                (_a = t.account) === null || _a === void 0
                                    ? void 0
                                    : _a.data) === null || _b === void 0
                                ? void 0
                                : _b.parsed) === null || _c === void 0
                            ? void 0
                            : _c.info) === null || _d === void 0
                        ? void 0
                        : _d.mint;
                const amount =
                    (_j =
                        (_h =
                            (_g =
                                (_f =
                                    (_e = t.account) === null || _e === void 0
                                        ? void 0
                                        : _e.data) === null || _f === void 0
                                    ? void 0
                                    : _f.parsed) === null || _g === void 0
                                ? void 0
                                : _g.info) === null || _h === void 0
                            ? void 0
                            : _h.tokenAmount) === null || _j === void 0
                        ? void 0
                        : _j.uiAmount;
                return { mintAddress, amount };
            });
        return nftAccounts;
    });
exports.getParsedTokenAccountsByOwner = getParsedTokenAccountsByOwner;
//# sourceMappingURL=nfts.js.map
