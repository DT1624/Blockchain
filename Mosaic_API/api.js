"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { Address } from 'node:cluster';
var ts_sdk_1 = require("@aptos-labs/ts-sdk");
var axios_1 = require("axios");
// Initialize Aptos config to connect to the testnet
var aptos = new ts_sdk_1.Aptos(new ts_sdk_1.AptosConfig({
    fullnode: "https://aptos.testnet.bardock.movementlabs.xyz/v1",
}));
// Create user account from private key
var user = ts_sdk_1.Account.fromPrivateKey({
    privateKey: new ts_sdk_1.Ed25519PrivateKey(ts_sdk_1.PrivateKey.formatPrivateKey("", ts_sdk_1.PrivateKeyVariants.Ed25519)), // TODO: Fill your private key here.
});
var prompt = require("prompt-sync")();
// List token and address in Aptos
var assets = {
    "APTOS": "0x1::aptos_coin::AptosCoin",
    "USDC": "0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7",
    "USDT": "0xc6f5b46ab5307dfe3e565668edcc1461b31cac5a6c2739fba17d9fdde16813a2",
    "WETH": "0xab85cf20d26368dc43b49152a7b4543eb86c6a2d98c30b9b2cfb7b574f364981",
};
// Display the list of tokens
console.log("Token list:");
Object.keys(assets).forEach(function (key, index) {
    console.log("".concat(index + 1, ". ").concat(key));
});
function getValidChoice(promptMessage, maxOption) {
    var choice;
    do {
        choice = parseInt(prompt(promptMessage));
    } while (isNaN(choice) || choice < 1 || choice > maxOption);
    return choice;
}
// Formats amount
function decimalAmount(amountDecimal, choice) {
    if (choice == 1) {
        return (amountDecimal / 100000000).toFixed(8).toString().replace('.', '_');
    }
    return (amountDecimal / 1000000).toFixed(6).toString().replace('.', '_');
}
;
// Enter source
var srcChoice = getValidChoice("Select source asset (1, 2, 3, 4): ", 4);
var srcAsset = assets[Object.keys(assets)[srcChoice - 1]];
// Enter destination
var dstChoice = getValidChoice("Select destination asset (1, 2, 3, 4): ", 4);
while (dstChoice === srcChoice) {
    if (dstChoice === srcChoice) {
        console.log("Destination must be different from source. Please choose again.");
    }
    dstChoice = getValidChoice("Select destination asset (1, 2, 3, 4): ", 4);
}
;
var dstAsset = assets[Object.keys(assets)[dstChoice - 1]];
// Enter transaction amount
var amountInput = parseFloat(prompt("Enter transaction amount: "));
var amount = amountInput * (srcChoice == 1 ? 100000000 : 1000000);
// Get a quote from Mosaic Aggregator API
function swapTokensOnMosaic() {
    return __awaiter(this, void 0, void 0, function () {
        var mosaicResponse, transaction, pendingTransactionResponse, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, axios_1.default)({
                            method: "GET",
                            url: "https://testnet.mosaic.ag/bardock/v1/quote",
                            params: {
                                srcAsset: srcAsset,
                                dstAsset: dstAsset,
                                amount: amount,
                                sender: user.accountAddress.toString(),
                                slippage: 5, // 100 = 1%
                            },
                            headers: {
                                "X-API-KEY": '', // TODO: Fill the API key in here.
                            },
                        })];
                case 1:
                    mosaicResponse = _a.sent();
                    return [4 /*yield*/, aptos.transaction.build.simple({
                            sender: user.accountAddress,
                            data: {
                                function: mosaicResponse.data.data.tx.function,
                                typeArguments: mosaicResponse.data.data.tx.typeArguments,
                                functionArguments: mosaicResponse.data.data.tx.functionArguments,
                            },
                        })];
                case 2:
                    transaction = _a.sent();
                    return [4 /*yield*/, aptos.transaction.signAndSubmitTransaction({
                            signer: user,
                            transaction: transaction,
                        })];
                case 3:
                    pendingTransactionResponse = _a.sent();
                    // Display the result
                    console.log("You have successfully swapped ".concat(decimalAmount(mosaicResponse.data.data.srcAmount, srcChoice), " ").concat(Object.keys(assets)[srcChoice - 1], " to ").concat(decimalAmount(mosaicResponse.data.data.dstAmount, dstChoice), " ").concat(Object.keys(assets)[dstChoice - 1]));
                    // Output transaction URL to the console
                    console.log("Tx = https://explorer.movementnetwork.xyz/txn/".concat(pendingTransactionResponse.hash, "?network=bardock+testnet"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    if (error_1.response) {
                        console.error("API Error:", JSON.stringify(error_1.response.data, null, 2));
                    }
                    else {
                        console.error("Request Failed:", error_1.message);
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
swapTokensOnMosaic();
