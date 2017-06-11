var bip39 = require("bip39");
var Wallet = require('ethereumjs-wallet');
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");
var ethUtil = require("ethereumjs-util")

function HDWalletProvider(mnemonic="", provider_url, address_index) {
  if (address_index == null) {
    address_index = 0;
  }

  var hex = new Buffer(mnemonic, "hex");

  if (ethUtil.isValidPrivate(hex)) {
    this.privateKey = hex;
    this.wallet = Wallet.fromPrivateKey(this.privateKey);
  } else {
    this.mnemonic = mnemonic;
    this.wallet_hdpath = "m/44'/60'/0'/0/";
    this.hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
    this.wallet = this.hdwallet.derivePath(this.wallet_hdpath + address_index).getWallet();
  }

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
