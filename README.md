# truffle-hdwallet-provider
HD Wallet-enabled Web3 provider. 
Use it to sign transactions for addresses derived from a 12-word mnemonic, or password protected wallet file, or hardware wallets (Trezor, or Ledger nano).

## Install

```
$ npm install truffle-hdwallet-provider
```

## General Usage

You can use this provider wherever a Web3 provider is needed, not just in Truffle. For Truffle-specific usage, see next section.

```mnemonic use
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "opinion destroy betray ..."; // 12 word mnemonic
var provider = HDWalletProvider.MnemonicProvider(mnemonic, "http://localhost:8545");

Parameters:

- `mnemonic`: `string`. 12 word mnemonic which addresses are created from.
- `provider_uri`: `string`. URI of Ethereum client to send all other non-transaction-related Web3 requests.
- `address_index`: `number`, optional. If specified, will tell the provider to manage the address at the index specified. Defaults to the first address (index `0`).
```

```wallet file use
var HDWalletProvider = require("truffle-hdwallet-provider");

function getWallet(){
    return require('fs').readFileSync("./secrets.json", "utf8").trim();
}

var provider = HDWalletProvider.WalletProvider(getWallet(), "password", 'https://mainnet.infura.io/');

Parameters:

- `wallet data`: `string`. Json object, containing wallet data.
- `password`: `string`. Wallet password
- `provider_uri`: `string`. URI of Ethereum node to send all other non-transaction-related Web3 requests.
```

```trezor use
var HDWalletProvider = require("truffle-hdwallet-provider");
var provider = HDWalletProvider.TrezorProvider("m/44'/1'/0'/0/0", 'https://rinkeby.infura.io/');

Parameters:

- `path`: `string`. Private key derivation path.
- `provider_uri`: `string`. URI of Ethereum node to send all other non-transaction-related Web3 requests.
```

```ledger use
var HDWalletProvider = require("truffle-hdwallet-provider");
var provider = HDWalletProvider.LedgerProvider(4,0,'https://rinkeby.infura.io/');

Parameters:

- `network_id`: `string`. Ethereum network id.
- `address_index`: `number`, optional. If specified, will tell the provider to manage the address at the index specified. Defaults to the first address (index `0`).
- `provider_uri`: `string`. URI of Ethereum node to send all other non-transaction-related Web3 requests.
```

By default, the `HDWalletProvider` will use the first address that's generated from the mnemonic. If you pass in a specific index, it'll use that address instead. Currently, the `HDWalletProvider` manages only one address at a time, but it can be easily upgraded to manage (i.e., "unlock") multiple addresses.

## Truffle Usage Example

You can easily use this within a Truffle configuration. For instance:

truffle.js
```mnemonic
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "opinion destroy betray ...";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
      network_id: 3
    }
  }
};
```
