const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const config = require('./config');
const ABI = require('./abi').abi;

const provider = new HDWalletProvider(
  config.ROPSTEN_MNEMONIC,
  "https://ropsten.infura.io/" + config.INFURA_ACCESS_TOKEN,
);

const web3 = new Web3(provider);
const contract = new web3.eth.Contract(ABI, config.CONTRACT_ADDRESS, {from: config.ISSUER_ADDRESS});

const balanceOf = (address) => {
  return contract.methods.balanceOf(address).call();
};

const transfer = (to, amount) => {
  const dAmount = amount * 1e18;
  return contract.methods.transfer(to, dAmount).send();
};

module.exports = {balanceOf, transfer};
