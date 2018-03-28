# truffle-hdwallet-provider
HD Wallet-enabled Web3 provider. Use it to sign transactions for addresses derived from an array of private keys.

## Install

```
$ git clone https://github.com/kirillsurkov/truffle-hdwallet-provider
```

## General Usage

You can use this provider wherever a Web3 provider is needed, not just in Truffle. For Truffle-specific usage, see next section.

```javascript
const HDWalletProvider = require("truffle-hdwallet-provider");
const keys = ["ce2eab51c7c428...", "46c36f1970dcf37ec..."]; // private keys
let provider = new HDWalletProvider(keys, "http://localhost:8545");
```

Parameters:

- `keys`: `array`. Array of private keys.
- `provider_uri`: `string`. URI of Ethereum client to send all other non-transaction-related Web3 requests.

## Truffle Usage

You can easily use this within a Truffle configuration. For instance:

truffle.js
```javascript
const HDWalletProvider = require("truffle-hdwallet-provider");

const keys = ["ce2eab51c7c428...", "46c36f1970dcf37ec..."];

module.exports = {
  networks: {
    ropsten: {
      provider: new HDWalletProvider(keys, "https://ropsten.infura.io/"),
      network_id: 3
    }
  },
  network: "ropsten"
};
```
