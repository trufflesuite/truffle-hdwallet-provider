var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var Wallet = require('ethereumjs-wallet');
var ProviderEngine = require("web3-provider-engine");
var TrezorSubprovider = require("@daonomic/trezor-wallet-provider");
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");

var Web3 = require("web3");

function TrezorProvider(path, provider_url) {
  
  this.engine = new ProviderEngine();
  this.engine.addProvider(new TrezorSubprovider(path);
  this.engine.addProvider(new FiltersSubprovider());
  this.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
  this.engine.start();

};

function WalletProvider(wallet, password, provider_url, address_index) {

  if (address_index == null) {
    address_index = 0;
  }

  this.wallet = Wallet.fromV3(wallet, password, true);
  this.address = "0x" + this.wallet.getAddress().toString("hex");

  this.engine = new ProviderEngine();
  this.engine.addProvider(new WalletSubprovider(this.wallet, {}));
  this.engine.addProvider(new FiltersSubprovider());
  this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
  this.engine.start(); // Required by the provider engine.
};

function MnemonicProvider(mnemonic, provider_url, address_index=0, num_addresses=1) {
  this.mnemonic = mnemonic;
  this.hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
  this.wallet_hdpath = "m/44'/60'/0'/0/";
  this.wallets = {};
  this.addresses = [];

  for (let i = address_index; i < address_index + num_addresses; i++){
    var wallet = this.hdwallet.derivePath(this.wallet_hdpath + i).getWallet();
    var addr = '0x' + wallet.getAddress().toString('hex');
    this.addresses.push(addr);
    this.wallets[addr] = wallet;
  }

  const tmp_accounts = this.addresses;
  const tmp_wallets = this.wallets;

  this.engine = new ProviderEngine();
  this.engine.addProvider(new HookedSubprovider({
    getAccounts: function(cb) { cb(null, tmp_accounts) },
    getPrivateKey: function(address, cb) {
      if (!tmp_wallets[address]) { return cb('Account not found'); }
      else { cb(null, tmp_wallets[address].getPrivateKey().toString('hex')); }
    },
    signTransaction: function(txParams, cb) {
      let pkey;
      if (tmp_wallets[txParams.from]) { pkey = tmp_wallets[txParams.from].getPrivateKey(); }
      else { cb('Account not found'); }
      var tx = new Transaction(txParams);
      tx.sign(pkey);
      var rawTx = '0x' + tx.serialize().toString('hex');
      cb(null, rawTx);
    }
  }));
  this.engine.addProvider(new FiltersSubprovider());
  this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
  this.engine.start(); // Required by the provider engine.
};

WalletProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments);
};

WalletProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments);
};

WalletProvider.prototype.getAddress = function() {
  return this.address;
};

MnemonicProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments);
};

MnemonicProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments);
};

MnemonicProvider.prototype.getAddress = function() {
  return this.address;
};

module.exports = WalletProvider,MnemonicProvider,TrezorProvider;
