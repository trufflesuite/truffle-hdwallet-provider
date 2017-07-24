var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var WalletSubprovider = require('./wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");

function HDWalletProvider(mnemonic, provider_url, address_index=0, num_addresses=1) {
  this.mnemonic = mnemonic;
  this.hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
  this.wallet_hdpath = "m/44'/60'/0'/0/";
  this.wallets = [];
  this.addresses = {};

  for (let i = 0; i < num_addresses; i++){
    this.getAddress(i + address_index);
  }

  this.engine = new ProviderEngine();
  this.engine.addProvider(new WalletSubprovider(this.wallets, {}));
  this.engine.addProvider(new FiltersSubprovider());
  this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
  this.engine.start(); // Required by the provider engine.
};

HDWalletProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments);
};

HDWalletProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments);
};

// returns the address of the given address_index, first checking the cache
HDWalletProvider.prototype.getAddress = function(idx) {
  if (!(idx in Object.keys(this.addresses))) { 
    let wallet = this.hdwallet.derivePath(this.wallet_hdpath + idx).getWallet();
    this.wallets.push(wallet);
    this.addresses[idx] = wallet.getAddressString()
  }
  return this.addresses[idx];
}

// returns the addresses cache
HDWalletProvider.prototype.getAddresses = function() {
  return Object.values(this.addresses);
}

module.exports = HDWalletProvider;
