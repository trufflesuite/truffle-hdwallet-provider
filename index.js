var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");

function HDWalletProvider(mnemonic, provider_url, address_index) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Mnemonic invalid or undefined")
  }

  this.mnemonic = mnemonic;
  this.hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

  if (address_index == null) {
    address_index = 0;
  }

  this.wallet_hdpath = "m/44'/60'/0'/0/";
  this.wallet = this.hdwallet.derivePath(this.wallet_hdpath + address_index).getWallet();
  this.address = "0x" + this.wallet.getAddress().toString("hex");

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

HDWalletProvider.prototype.getAddress = function() {
  return this.address;
};

module.exports = HDWalletProvider;
