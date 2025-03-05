// import { Address } from 'node:cluster';
import {
  Account,
  Aptos,
  APTOS_COIN,
  AptosConfig,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import axios from "axios";

// Initialize Aptos config to connect to the testnet
const aptos = new Aptos(
  new AptosConfig({
    fullnode: "https://aptos.testnet.bardock.movementlabs.xyz/v1",
  })
);

// Create user account from private key
const user = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(
    PrivateKey.formatPrivateKey("", PrivateKeyVariants.Ed25519)
  ), // TODO: Fill your private key here.
});

const prompt = require("prompt-sync")();

// List token and address in Aptos
const assets: Record<string, string> = {
  "APTOS": "0x1::aptos_coin::AptosCoin",
  "USDC": "0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7",
  "USDT": "0xc6f5b46ab5307dfe3e565668edcc1461b31cac5a6c2739fba17d9fdde16813a2",
  "WETH": "0xab85cf20d26368dc43b49152a7b4543eb86c6a2d98c30b9b2cfb7b574f364981",
};
// Display the list of tokens
console.log("Token list:");
Object.keys(assets).forEach((key, index) => {
  console.log(`${index + 1}. ${key}`);
});

function getValidChoice(promptMessage: string, maxOption: number): number {
  let choice: number;
  do {
    choice = parseInt(prompt(promptMessage));
  } while (isNaN(choice) || choice < 1 || choice > maxOption);
  return choice;
}

// Formats amount
function decimalAmount(amountDecimal: number, choice: number): string {
  if(choice == 1) {
    return (amountDecimal / 1_00000000).toFixed(8).toString().replace('.', '_');
  }
  return (amountDecimal / 1_000000).toFixed(6).toString().replace('.', '_');
};

// Enter source
let srcChoice = getValidChoice("Select source asset (1, 2, 3, 4): ", 4);
const srcAsset = assets[Object.keys(assets)[srcChoice - 1]];

// Enter destination
let dstChoice = getValidChoice("Select destination asset (1, 2, 3, 4): ", 4);
while (dstChoice === srcChoice) {
  if (dstChoice === srcChoice) {
    console.log("Destination must be different from source. Please choose again.");
  }
  dstChoice = getValidChoice("Select destination asset (1, 2, 3, 4): ", 4);
};
const dstAsset = assets[Object.keys(assets)[dstChoice - 1]];

// Enter transaction amount
let amountInput = parseFloat(prompt("Enter transaction amount: "));
const amount = amountInput * (srcChoice == 1 ? 1_00000000 : 1_000000)

// Get a quote from Mosaic Aggregator API
async function swapTokensOnMosaic() {
  try {
    const mosaicResponse = await axios({
      method: "GET",
      url: "https://testnet.mosaic.ag/bardock/v1/quote",
      params: {
        srcAsset,
        dstAsset,
        amount,
        sender: user.accountAddress.toString(),
        slippage: 5, // 100 = 1%
      },
      headers: {
        "X-API-KEY": '', // TODO: Fill the API key in here.
      },
    });

    // Build the transaction based on the Mosaic response
    const transaction = await aptos.transaction.build.simple({
      sender: user.accountAddress,
      data: {
        function: mosaicResponse.data.data.tx.function,
        typeArguments: mosaicResponse.data.data.tx.typeArguments,
        functionArguments: mosaicResponse.data.data.tx.functionArguments,
      },
    });

    // Sign and submit the transaction
    const pendingTransactionResponse =
      await aptos.transaction.signAndSubmitTransaction({
        signer: user,
        transaction: transaction,
      });

    // Display the result
    console.log(`You have successfully swapped ${decimalAmount(mosaicResponse.data.data.srcAmount, srcChoice)} ${Object.keys(assets)[srcChoice - 1]} to ${decimalAmount(mosaicResponse.data.data.dstAmount, dstChoice)} ${Object.keys(assets)[dstChoice - 1]}`);

    // Output transaction URL to the console
    console.log(
      `Tx = https://explorer.movementnetwork.xyz/txn/${pendingTransactionResponse.hash}?network=bardock+testnet`
    );
  } catch (error) {
    if (error.response) {
      console.error("API Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Request Failed:", error.message);
    }
  }
}


swapTokensOnMosaic();