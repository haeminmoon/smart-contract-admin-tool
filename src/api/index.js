import { go, take, first, pipe, mapL, map, find } from 'fff-js'
// import { checkUserSession } from '../util/user-session';
import Caver from 'caver-js';
let caver = new Caver(`https://api.baobab.klaytn.net:8651`);

const initNetwork = (network) => caver = new Caver(`https://api.${network}.klaytn.net:8651`)

/*******************************************************
 *              Internal utils for Caver               *
 *******************************************************/

/**
 * @param { String } fnSignature
 */
const fnSpliter = fnSignature => go(fnSignature, str => str.substr(0, str.indexOf('(')));

/**
 * @param { Object } contract
 * @param { String } fnSignature
 * @param { Object } params
 */

const inputGenerator = (contract, fnSignature, params) => go(
  contract._jsonInterface,
  find(obj => obj.name == fnSpliter(fnSignature)),
  fn => fn.inputs,
  map(input => params[input.name])
);

/**
 * @param { Object } contract
 * @param { String } fnSignature
 */
const outputGenerator = (contract, fnSignature) => go(
  contract._jsonInterface,
  find(obj => obj.name == fnSpliter(fnSignature)),
  fn => fn.outputs,
  map(output => output.type)
);

/**
 * @param { Object } contract
 * @param { String } fnSignature
 * @param { Array } params  
 */
const inputContractCallData = (contract, fnSignature, params) => go(
  contract._jsonInterface,
  find(obj => obj.name == fnSpliter(fnSignature)),
  fn => caver.klay.abi.encodeFunctionCall(fn, params)
)

/**
 * @param { Array } result
 * @param { Array } outputTypes
 * @todo Refactoring target
 */
const parseCallResult = (result, outputTypes) => {
  if (outputTypes.length > 1) {
    return outputTypes.map((type, i) => {
      return isBigNumber(type) && UTILS.isBigNumber(result[i])
        ? result[i].toString(10)
        : result[i];
    });
  }

  return isBigNumber(outputTypes[0]) && UTILS.isBigNumber(result)
    ? result.toString(10)
    : result;
};

/**
 * @param { String } type
 * @todo Refactoring target
 */
const isBigNumber = type => {
  switch (type) {
    case 'int':
    case 'int8':
    case 'int16':
    case 'int32':
    case 'int64':
    case 'int128':
    case 'int256':
    case 'uint':
    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'uint128':
    case 'uint256':
      return true;
    default:
      return false;
  }
}

/*******************************************************
 *               Main objects initialize               *
 *******************************************************/

const UTILS = {};
const ACCOUNTS = {};
const KLAY = {};
const CONTRACT = {};


/*******************************************************
 *                  Utils section                      *
 *******************************************************/
/**
 * @description Converts any KLAY value into peb.
 * @param { String | Number | BN } The value  
 * @return { String | BN } converted value
 */
UTILS.toKLAY = val => caver.utils.toPeb(val, "KLAY");

/**
 * @description 
 * @param { String | Number | BN } The value  
 * @return { String | BN } converted value
 */
UTILS.fromKLAY = val => caver.utils.fromPeb(val, "KLAY");

UTILS.fromGPeb = val => caver.utils.fromPeb(val, "Gpeb");

/*
{ '0x18': 'ACCOUNT_CREATION',
  '0x20': 'ACCOUNT_UPDATE',
  '0x21': 'FEE_DELEGATED_ACCOUNT_UPDATE',
  '0x22': 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
  '0x08': 'VALUE_TRANFSER',
  '0x10': 'VALUE_TRANSFER_MEMO',
  '0x09': 'FEE_DELEGATED_VALUE_TRANSFER',
  '0x0a': 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
  '0x11': 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
  '0x12': 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
  '0x28': 'SMART_CONTRACT_DEPLOY',
  '0x29': 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY',
  '0x2a': 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
  '0x30': 'SMART_CONTRACT_EXECUTION',
  '0x31': 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
  '0x32': 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
  '0x38': 'CANCEL',
  '0x39': 'FEE_DELEGATED_CANCEL',
  '0x3a': 'FEE_DELEGATED_CANCEL_WITH_RATIO',
  '0x48': 'CHAIN_DATA_ANCHROING' }
*/
UTILS.txType = type => caver.utils.txTypeToString[type];

UTILS.isBigNumber = val => caver.utils.isBigNumber(val);

UTILS.toChecksumAddress = addr => caver.utils.toChecksumAddress(addr);

UTILS.isContractAccount = addr => caver.klay.isContractAccount(addr);

UTILS.isAddress = addr => caver.utils.isAddress(addr);

UTILS.getGasPrice = caver.klay.getGasPrice();

UTILS.decodeRawTx = rawTransaction => caver.klay.decodeTransaction(rawTransaction)

UTILS.decodeData = (types, hex) => caver.klay.abi.decodeParameters(types,hex)

UTILS.encodeFuncsig = str => caver.klay.abi.encodeFunctionSignature(str)

UTILS.encodeData = (typesArray, parameters) => caver.klay.abi.encodeParameters(typesArray, parameters)

/*******************************************************
 *                  Accounts section                   *
 *******************************************************/

/**
 * @description Get account object using private key
 * @param { String } privateKey  
 * @return { Object } Account object
 */
ACCOUNTS.access = privateKey => caver.klay.accounts.privateKeyToAccount(privateKey);

/**
 * @description Connect account to wallet
 * @param { Object } account  
 * @return { Object } Signed account object
 */
ACCOUNTS.connect = privateKey => caver.klay.accounts.wallet.add(privateKey);

ACCOUNTS.disconnect = account => caver.klay.accounts.wallet.remove(account);

/**
 * @description Create signed account
 * @param { Object } account
 * @param_mock
 *  {
 *    address: 0x... ,
 *    private_key: 0x... 
 *  }...
 * @return { Object } Signer
 */
ACCOUNTS.createSigner = pipe(ACCOUNTS.access, ACCOUNTS.connect);

/**
 * @description Create signed accounts map
 * @param { Array } accounts
 * @param_mock [
 *  {
 *    address: 0x... ,
 *    private_key: 0x... 
 *  }...
 * ]
 * @return { Map } Signed accounts map
 */
ACCOUNTS.createSignedMap = accounts => go(
  new Map(),
  tap(
    signerMap => go(
      accounts,
      mapC(account => signerMap.set(
        account.address, 
        ACCOUNTS.createSigner(account.private_key)
      ))
    )
  )
);

ACCOUNTS.decrypt = (json, pwd) => caver.klay.accounts.decrypt(json,pwd)

/**
 * @description Get fee payer's address
 * @param { Array } accounts
 * @param_mock [
 *  {
 *    address: 0x... ,
 *    private_key: 0x... 
 *  }...
 * ]
 * @return { String } fee payer's address
 */
ACCOUNTS.getFeePayer = pipe(mapL(a => a.address), take(1), first);

ACCOUNTS.get = caver.klay.accounts.wallet;

ACCOUNTS.signTx = (option, privateKey) => caver.klay.accounts.signTransaction(option, privateKey);


/*******************************************************
 *         Klay section (Transaction, BlockInfo)       *
 *******************************************************/

KLAY.getBalance = address => caver.klay.getBalance(address);

/**
 * @description Get address nonce
 * @param { String } address
 * @return { Number } nonce
 */
KLAY.getNonce = address => caver.klay.getTransactionCount(address, 'pending');

/**
* @description rawTransaction
* @param { String } rawTransaction
* @param { Ojbect } signer
* @return { Object } Receipt
*/
KLAY.sendRawTxFeeDelegated = (rawTx, signer) => caver.klay.sendTransaction({ senderRawTransaction : rawTx, feePayer: signer.address });

KLAY.sendTransaction = (option) => caver.klay.sendTransaction(option)

/*******************************************************
 *                  Contract section                   *
 *******************************************************/

/**
 * @description Get contract instance
 * @param { Object } abi 
 * @param { String } address 
 * @return { Object } Contract's instance object
 */
CONTRACT.get = (abi, address) => new caver.klay.Contract(abi, address);

/**
 * @description Write
 * @param { Object } signer 
 * @param { Object } contract 
 * @param { String } fnSignature 
 * @param { Object } params 
 * @return { Object } receipt
 */
CONTRACT.write = (signer, contract, fnSignature, params) => go(
  inputGenerator(contract, fnSignature, params),
  async inputs => contract.methods[fnSignature](...inputs).send(
    { 
      from: signer.address, 
      gasPrice: '25000000000', 
      gas: 20000000, 
      nonce: await KLAY.getNonce(signer.address)
    }
  )
);

/**
 * @description Write fee delegate
 * @param { Object } signer 
 * @param { Object } payer  
 * @param { Object } contract
 * @param { String } fnSignature 
 * @param { Obejct } params 
 * @return { Object } receipt
 */
CONTRACT.write_feeDelegate = (signer, feePayer, contract, fnSignature, params) => go(
  inputGenerator(contract, fnSignature, params),
  paramArr => inputContractCallData(contract, fnSignature, paramArr),
  async data => go(
    {
      from: signer.address,
      to : contract._address,
      data: data,
      gasPrice: '25000000000', 
      gas: 20000000,
      value: 0,
      nonce: await KLAY.getNonce(signer.address),
      type: UTILS.txType('0x31')
    },
    async option => await ACCOUNTS.signTx(option, signer.privateKey),
    async signData => await KLAY.sendRawTxFeeDelegated(signData.rawTransaction, feePayer)
  )
);

/**
 * @description Read
 * @param { Object } contract 
 * @param { String } fnSignature 
 * @param { Object } params 
 * @return { Object } Call result
 */
CONTRACT.read = (contract, fnSignature, params) => go(
  inputGenerator(contract, fnSignature, params),
  inputs => contract.methods[fnSignature](...inputs).call(),
  res => parseCallResult(res, outputGenerator(contract, fnSignature))
);


export {
  initNetwork, CONTRACT, ACCOUNTS, UTILS, KLAY
}
