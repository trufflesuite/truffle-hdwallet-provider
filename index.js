var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");

function HDWalletProvider(mnemonic, provider_url, address_index) {
  this.mnemonic = mnemonic;
  this.hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

  if (address_index == null) {
    address_index = 0;
  }

  this.wallet_hdpath = "m/44'/60'/0'/0/";
  this.wallets = [];
  this.addresses = [];
  for (i = 0; i < 10; i++){
    this.wallets.push(this.hdwallet.derivePath(this.wallet_hdpath + i).getWallet());
    this.addresses.push("0x" + this.wallets[i].getAddress().toString("hex"));
  }
  this.wallet = this.wallets[0];
  this.addresses = this.addresses[0];
  this.engine = new ProviderEngine();
  this.engine.addProvider(new WalletSubprovider(this.wallet, {}));
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

HDWalletProvider.prototype.getAddress = function(address_index) {
  if (address_index == null) {
    address_index = 0;
  return this.addresses[address_index];
  }
}

HDWalletProvider.prototype.getAddresses = function() {
  return this.addresses;
}

module.exports = HDWalletProvider;
