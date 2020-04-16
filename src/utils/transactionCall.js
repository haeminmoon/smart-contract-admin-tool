import { go, log } from 'fff-js'
import { CONTRACT, ACCOUNTS, UTILS, KLAY } from "../api";

const contractWrite = (abi, address, privateKey, functionSig, params) => 
    go(
        CONTRACT.get(abi, address),
        contract => CONTRACT.write(
            privateKey,
            contract,
            functionSig, 
            params)
    )

const contractRead = (abi, address, functionSig, params) => 
    go(
        CONTRACT.get(abi, address),
        contract => CONTRACT.read(contract, functionSig, params)
    ) 

const sendKLAY = (from, to, value) => 
    KLAY.sendTransaction({
        type: 'VALUE_TRANSFER',
        from,
        to,
        value : UTILS.toKLAY(value),
        gas: 25000
    })
    

export { contractWrite, contractRead, sendKLAY }