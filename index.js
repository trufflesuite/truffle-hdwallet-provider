const FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js')
const HookedSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js')
const Web3 = require('web3')
const Transaction = require('ethereumjs-tx')
const ProviderEngine = require('web3-provider-engine')
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js')
const ethereumjsWallet = require('ethereumjs-wallet')

function HDWalletProvider (privateKeys, providerUrl) {

  this.wallets = {};
  this.addresses = [];
  
  // from https://github.com/trufflesuite/truffle-hdwallet-provider/pull/25/commits
  for (let key of privateKeys) {
    var wallet = ethereumjsWallet.fromPrivateKey(new Buffer(key, "hex"));
    var addr = '0x' + wallet.getAddress().toString('hex');
    this.addresses.push(addr);
    this.wallets[addr] = wallet;
  }
  
  const tmpAccounts = this.addresses;
  const tmpWallets = this.wallets;

  this.engine = new ProviderEngine()
  this.engine.addProvider(
    new HookedSubprovider({
      getAccounts: function (cb) {
        cb(null, tmpAccounts)
      },
      getPrivateKey: function (address, cb) {
        if (!tmpWallets[address]) {
          return cb('Account not found')
        } else {
          cb(null, tmpWallets[address].getPrivateKey().toString('hex'))
        }
      },
      signTransaction: function (txParams, cb) {
        let pkey
        if (tmpWallets[txParams.from]) {
          pkey = tmpWallets[txParams.from].getPrivateKey()
        } else {
          cb('Account not found')
        }
        var tx = new Transaction(txParams)
        tx.sign(pkey)
        var rawTx = '0x' + tx.serialize().toString('hex')
        cb(null, rawTx)
      }
    })
  )
  this.engine.addProvider(new FiltersSubprovider())
  this.engine.addProvider(
    new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl))
  )
  this.engine.start() // Required by the provider engine.
}

HDWalletProvider.prototype.sendAsync = function () {
  this.engine.sendAsync.apply(this.engine, arguments)
}

HDWalletProvider.prototype.send = function () {
  return this.engine.send.apply(this.engine, arguments)
}

// returns the address of the given address_index, first checking the cache
HDWalletProvider.prototype.getAddress = function (idx) {
  console.log('getting addresses', this.addresses[0], idx)
  if (!idx) {
    return this.addresses[0]
  } else {
    return this.addresses[idx]
  }
}

// returns the addresses cache
HDWalletProvider.prototype.getAddresses = function () {
  return this.addresses
}

module.exports = HDWalletProvider
