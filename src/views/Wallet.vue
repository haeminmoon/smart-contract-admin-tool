<template>
  <v-layout justify-center fill-height>
      <v-container
        fluid
        grid-list-md
        fill-height
      >
        <v-layout row wrap fill-height justify-center>

          <!-- Balance -->
          <v-flex xs4 text-xs-center fill-height>
            <v-card height="100%">
              <v-list two-line subheader>
                <v-list-tile @click="clickCoin({symbol: 'KLAY',address: null})">
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <b class="mr-2">KLAY</b>
                      <v-icon style="font-size:20px;color:#4caeb3" v-if="selectCoin.symbol === 'KLAY'">star_rate</v-icon>
                    </v-list-tile-title>
                    <v-list-tile-sub-title>{{ balance }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>

                <v-divider></v-divider>
            
                <v-subheader class="mb-3">ERC20 Tokens</v-subheader>
                <v-list-tile
                  v-for="(token, index) in tokens()[selectNetwork()]"
                  :key="index"
                  @click="clickCoin(token)"
                >
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <b class="mr-2">{{ token.symbol }}</b>
                      <v-icon style="font-size:20px;color:#4caeb3" v-if="selectCoin.symbol === token.symbol">star_rate</v-icon>
                    </v-list-tile-title>
                    <v-list-tile-sub-title>{{ token.balance }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon ripple>
                          <v-icon color="grey lighten-1" v-on="on">info</v-icon>
                        </v-btn>
                      </template>
                      <span>Symbol : {{ token.symbol }}</span> <br>
                      <span>Address : {{ token.address }}</span> <br>
                      <span>Decimals : {{ token.decimals }}</span>
                    </v-tooltip>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>

              <v-card-actions>
                <div class="text-xs-center">
                    <v-dialog
                      v-model="token_dialog"
                      width="500"
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn
                              absolute
                              dark
                              fab
                              bottom
                              right
                              small
                              color="#4caeb3"
                              class="mb-5"
                              v-on="on"
                            >
                            <v-icon>add</v-icon>
                          </v-btn>
                      </template>

                      <v-card>
                        <v-alert
                          :value="error.token != null"
                          type="error"
                        >
                          {{error.token}}
                        </v-alert>
                        <v-card-title>
                          INSERT TOKEN
                        </v-card-title>
                        <v-card-text>

                          <v-text-field
                            label="Symbol"
                            color="#4caeb3"
                            v-model="inputs.symbol"
                            required
                            class="mb-4 "
                          ></v-text-field>

                          <v-text-field
                            label="Contract Address"
                            color="#4caeb3"
                            v-model="inputs.tokenAddress"
                            :rules="rules.tokenAddress"
                            class="mb-4 "
                          ></v-text-field>

                          <v-text-field
                            label="Decimals"
                            placeholder="18"
                            color="#4caeb3"
                            readonly
                            class="mb-4 "
                          ></v-text-field>

                         </v-card-text>
                        <v-divider></v-divider>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            color="#4caeb3"
                            flat
                            @click="token_dialog = false"
                          >
                            CANCEL
                          </v-btn>
                          <v-btn
                            color="#4caeb3"
                            flat
                            @click="addToken"
                          >
                            ADD
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </div>
              </v-card-actions>
            </v-card>
          </v-flex>
          
          <!-- Send -->
          <v-flex xs7 fill-height>
            <v-alert
              :value="alert.message !== null"
              :type="alert.state"
            >
              {{alert.message}}
            </v-alert>
            <v-card height="100%" style="padding:8%">
              <v-card-actions>
                <v-layout row wrap style="display:block">
      
                  <v-text-field
                    label="From Address"
                    :placeholder="getAddress()"
                    color="#4caeb3"
                    readonly
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    label="To Address"
                    placeholder="0x0000000..."
                    color="#4caeb3"
                    v-model="inputs.toAddress"
                    :rules="rules.toAddress"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    label="Amount"
                    placeholder="00.00"
                    color="#4caeb3"
                    :suffix="selectCoin.symbol"
                    type="number"
                    v-model="inputs.sendAmount"
                    :rules="rules.amount"
                    class="mb-3"
                  ></v-text-field>

                  <span style="color:#858585;font-size:12px">Transction Fee</span>
                  <h4 align="right" v-if="selectCoin.symbol === 'KLAY'">
                    {{ inputs.sendAmount == "" ? 0 : inputs.sendAmount }} 
                    <span class="ml-3" style="font-size:16px">{{ selectCoin.symbol }}</span>
                    &nbsp + &nbsp  {{ gasFee * 25000 }} 
                    <span class="ml-3" style="font-size:16px">KLAY</span></h4>
                  <div style="border:1px solid #cccccc; background-color:#f1f1f1; padding:6%">
                    <div></div>
                    <div class="gasGuide">
                      <span class="gasGuide_title">Gas Price</span>
                      <span class="gasGuide_content"> {{ gasFee }} KLAY</span>
                    </div>
                    <div class="gasGuide" v-if="selectCoin.symbol === 'KLAY'">
                      <span class="gasGuide_title">Gas Limit</span>
                      <span class="gasGuide_content">25,000</span>
                    </div>
                  </div>
                </v-layout>
              </v-card-actions>
              <v-btn :loading="loading" color="#4caeb3" :disabled="send_disabled" class="mt-5" style="color:white" block @click="sendTransaction">Send Transaction</v-btn>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
  </v-layout>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<script>
  import { mapState, mapMutations } from "vuex"
  import { CONTRACT, ACCOUNTS, UTILS, KLAY } from "../api";
  import { contractWrite, contractRead, sendKLAY } from "../utils/transactionCall";
  import { setInterval, clearInterval, setTimeout } from 'timers';
  import { go, log, map, takeAll } from 'fff-js'
  
  const TokenAbi = require('../../config/TokenAbi.json')

export default {
  name: 'Wallet',
  data() {
    return {
      ...mapState(["access_key","tokens","selectNetwork"]),
      interval: null,
      token_dialog: false,
      loading: false,
      balance: 0,
      send_disabled: true,
      inputs:{
        toAddress: "",
        sendAmount: "",
        symbol: "",
        tokenAddress: ""
      },
      rules : {
        tokenAddress : [
          v => this.addressCheck('tokenAddress')
        ],
        toAddress : [
          v => this.addressCheck('toAddress')
        ],
        amount : [
          v => this.numberCheck()
        ]
      },
      error:{
        token: null
      },
      alert: {
        message: null,
        state: "success"
      },
      gasFee : 0,
      selectCoin : {
        symbol: "KLAY",
        address: null
      }
    }
  },
  methods : {
    ...mapMutations(["pushToken"]),
    getAddress(){
      return UTILS.toChecksumAddress(ACCOUNTS.access(this.access_key()).address)
    },
    removeInput(){
      this.inputs.symbol = "";
      this.inputs.tokenAddress = "";
      this.inputs.sendAmount = "";
      this.inputs.toAddress = "";
      this.error = {
        amount : null
      }
      this.token_dialog = false;
      this.sendDataCheck();
    },
    setAlert(state, message){
      this.alert.state=state
      this.alert.message = message
      setTimeout(()=>{
        this.alert.message = null;
      },5000)
    },
    async initWallet(){
      go(
        this.getAddress(),
        KLAY.getBalance,
        UTILS.fromKLAY,
        amt => this.balance = amt
      )

      let address = this.getAddress();
      go(
        this.tokens()[this.selectNetwork()],
        map(obj => {
          return go(
            contractRead(TokenAbi, obj.address, "balanceOf(address)", {who: address}),
            UTILS.fromKLAY,
            balance => {
              obj.balance = balance
              return obj;
            }
          )
        }),
        takeAll,
        objs => this.tokens()[this.selectNetwork()] = objs
      )

      this.gasFee = await this.calcGas()
    },
    addressCheck(key){
      this.sendDataCheck()
      return UTILS.isAddress(this.inputs[key]) || this.inputs[key] === "" ? true : "Invalid Address"
    },
    numberCheck(){
      this.sendDataCheck()
      return this.balanceCheck();
    },
    balanceCheck(){
      try{
        if(Number(this.inputs.sendAmount) == 0 && this.inputs.sendAmount != ""){
          return "Cannot send zero"
        }
        let result = this.selectCoin.symbol === "KLAY" ?
          (Number(this.inputs.sendAmount) + Number(this.gasFee)) <= Number(this.balance) ? 
            null 
            : "That's more than the balance you have."
          : Number(this.inputs.sendAmount) <= Number(this.selectCoin.balance) &&
            Number(this.balance) >= Number(this.gasFee) ? 
            null 
            : "That's more than the balance you have."
        return result == null ? true : "That's more than the balance you have."
      }catch(e){
        return e.message
      }
    },
    calcGas(){
      return go(
        UTILS.getGasPrice,
        UTILS.fromKLAY
      )
    },
    clickCoin(coin){
      this.selectCoin = coin;
      this.removeInput();
    },
    sendDataCheck(){
      if(UTILS.isAddress(this.inputs["toAddress"]) 
        && this.balanceCheck() == true)
      {
          this.send_disabled = false
          return true;
      }else{
        this.send_disabled = true;
        return false
      }
    },
    async sendTransaction(){
      this.loading = true;
      if(!this.sendDataCheck()) return false;
      ACCOUNTS.connect(this.access_key())

      try{
        this.selectCoin.symbol === "KLAY" ?
          await go(
            sendKLAY(
              this.getAddress(),
              this.inputs.toAddress,
              this.inputs.sendAmount
            ),
            tx => {
              this.setAlert("success", `[TxHash] ${tx.transactionHash}`)
              this.removeInput()
              log(tx)
            }
          ) 
          : await go(
            contractWrite(
              TokenAbi, 
              this.selectCoin.address, 
              ACCOUNTS.access(this.access_key()),
              "transfer(address,uint256)",
              {to: this.inputs.toAddress, value: UTILS.toKLAY(this.inputs.sendAmount)}
            ),
            tx => {
              this.setAlert("success", `TxHash : ${tx.transactionHash}`)
              this.removeInput()
              log(tx)
            }
          ) 
      }catch(e){
        e.message = e.message.replace("Returned error: ","")
        e.message = e.message.substring(0,e.message.indexOf("(") === -1 ? e.message.length : e.message.indexOf("("))
        e.message = e.message.substring(0,e.message.indexOf("{") === -1 ? e.message.length : e.message.indexOf("{"))
        this.setAlert("error", e.message)
      }finally{
        ACCOUNTS.disconnect(this.getAddress())
        this.loading = false;
      }
    },
    addToken(){
      if(!UTILS.isAddress(this.inputs["tokenAddress"]) || this.inputs.symbol === ""){
        this.error.token = "Input value abnormal"
      }else{
        //balanceOf ȣ���غ���~ ��Ʈ��ũ�� �ٸ��ų� ��Ʈ��Ʈ�� �ƴϰų�
        contractRead(TokenAbi, this.inputs.tokenAddress, "balanceOf(address)", {who:this.getAddress()})
          .then(_ => {
            const paramObj = {
              network : this.selectNetwork(),
              symbol : this.inputs.symbol,
              address : this.inputs.tokenAddress,
              decimals : this.inputs.decimals
            }
            this.pushToken(paramObj);
            this.removeInput()
          })
          .catch(e => {
            this.error.token = "Please check the contract address or network."
          })
      }
      setTimeout(() => {
        this.error.token = null
      }, 5000)
    }
  },
  mounted(){
    this.interval = setInterval(() => {
      this.initWallet()
    },1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  }
}
</script>

<style>
.gasGuide{
  color:gray;
  display: block;
}
.gasGuide_content{
  float: right;
}
</style>
