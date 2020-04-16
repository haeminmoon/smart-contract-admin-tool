import { go } from 'fff-js'

const initialSetting = "baobab"

const networks = ["cypress", "baobab"]

const tokens = {
    cypress:[
      {symbol:"SPIN", address: "0x472fac08cf4836bee54343edfb49023746b27933", decimals: 18, balance: 0}
    ],
    baobab:[
      {symbol:"SPIN", address: "0xd0e5ca14f494b230440aa613e89a8c7691a79fc4", decimals: 18, balance: 0},
      {symbol:"SPIN Airdrop_Crowdsale", address: "0xfad898570e641f0b7a914c4e0f63d234c59764e5", decimals: 18, balance: 0}
    ]
  }

const contractName = {
  baobab: [
    "[Dev] SpinToken", "[Dev] AuthStorage", "[Dev] SpinAirdrop", "[Dev] SpinCrowdsale",
    "[Dev] Campaign", "[Dev] Event_Proxy", "[Dev] Product_Proxy", "[Dev] ReferralLedger_Proxy", "[Dev] RevenueLedger", "[Dev] RewardLedger_Proxy",
    "[Dev] Campaign_Proxy", "[Dev] Event", "[Dev] Product", "[Dev] ReferralLedger", "[Dev] RevenueLedger_Proxy", "[Dev] RewardLedger",
    "[Staging] SpinToken", "[Staging] AuthStorage", "[Staging] SpinAirdrop", "[Staging] SpinCrowdsale",
    "[Staging] Campaign", "[Staging] Event_Proxy", "[Staging] Product_Proxy", "[Staging] ReferralLedger_Proxy", "[Staging] RevenueLedger", "[Staging] RewardLedger_Proxy",
    "[Staging] Campaign_Proxy", "[Staging] Event", "[Staging] Product", "[Staging] ReferralLedger", "[Staging] RevenueLedger_Proxy", "[Staging] RewardLedger",
    
  ],
  cypress: [
    "SpinToken", "AuthStorage",
    "Campaign", "Event", "Product", "ReferralLedger", "RevenueLedger", "RewardLedger",
    "Campaign_Proxy", "Event_Proxy", "Product_Proxy", "ReferralLedger_Proxy", "RevenueLedger_Proxy", "RewardLedger_Proxy"
  ]
}

const arrayFunc = {
  SpinCrowdsale : ["lock"],
  SpinAirdrop : ["bulkAirdrop"]
}

// ---------------------------

let contracts = {}

networks.forEach(network => {
  contracts[network] = [];
  contractName[network].forEach(name => {
    go(
      require(`./abi/${network}/${name}.json`),
      data => 
        contracts[network].push({name, address: data.address, abi: data.abi, arrayFunc : arrayFunc[name]})
    );
  })
})

export { initialSetting, networks, tokens, contracts }