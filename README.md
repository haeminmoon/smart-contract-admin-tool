# smart-contract-admin-tool
Administration App for smart contract decentralized environment

## Installing dependencies

```

# Install vue-cli
npm install -g @vue/cli

```


## **Network Setting**

./config/initData.js
```javascript
const networks = ["cypress", "baobab"]
```  
    
    
.  
## **Token Setting**

./config/initData.js
```javascript
const tokens = {
    cypress:[
      {symbol:"", address: "", decimals: 18, balance: 0}
    ],
    baobab:[
      {symbol:"", address: "", decimals: 18, balance: 0}
    ]
  }
```
tokens.key === network Name

**Essential** init balance = 0    

.  

## **Contract Setting**
append ABI file to
./config/abi/networkName/abiName.json


> The inside of the abi file should be as follows
```javascript
{address: "0x00000000000", abi:[]}
```
.  

./config/initData.js
```javascript
const contractName = {
  networkName: ["abiName"]
}
```


## **Array Function Setting**
./config/initData.js
> Set only if all inputs are array
```javascript
const arrayFunc = {
  contractName : ["functionName"],
  contractName : ["functionName"]
}
```
.  


## Running app

1. Clone sub-project to your local 
2. npm run serve
