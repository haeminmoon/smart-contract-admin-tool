<template>
  <v-card>
    <div style="text-align:center" class="mt-4 mb-4">
      <h1 align=center>
        {{ title }}
        <v-btn icon color="gray">
          <v-icon style="font-size:25px">settings_applications</v-icon>
        </v-btn>
      </h1>
      <p class="text-muted"> {{ contract_data.address }}</p>
      <p class="text-success" v-if="isAdmin"> your admin</p>
      <p class="text-danger" v-else-if="isAdmin == false"> your not admin</p>
    </div>
    <v-tabs fixed-tabs slider-color="#4caeb3">
      <v-tab
        v-for="title in tabs"
        :key="title"
      >
        {{ title }}
      </v-tab>
<!-- function list - start -->
      <v-tab-item
        v-for="(tab, index) in tabs"
        :key="tab">
        <v-card flat>
          <v-card-actions>
            <v-expansion-panel>
              <v-expansion-panel-content
                v-for="(func,func_index) in contractFunctions[index]"
                :key="func_index"
              >
                <template v-slot:header>
                  <div>{{ func.name }}</div>
                </template>
                <v-card>
                  <v-card-text>
                    <div class="form-group" 
                      v-for="(input,index) in func.inputs"
                      :key="index">
                      <label>{{ input.name }}</label>
                      <v-layout v-if="checkType(input.type) === 'String'">
                        <input type="text" class="form-control mb-2" @keyup="unitDisable[`${func.name}_in_${input.name}`] = null" :placeholder="input.type" v-model="input.value">
                        <v-tooltip bottom
                        v-if="unitDisable[`${func.name}_in_${input.name}`] == null && input.type.includes('bytes')" >
                          <template v-slot:activator="{ on }">
                            <v-btn icon ripple class="text-center">
                              <v-icon 
                                v-on="on"
                                style="font-size:18px"
                                @click="input.value = convertBytesString('from',input.value,`${func.name}_in_${input.name}`)"
                              >sync</v-icon>
                            </v-btn>
                          </template>
                          <span>To Bytes</span>
                        </v-tooltip>
                      </v-layout>
                      <v-layout v-else-if="checkType(input.type) === 'Number'">
                        <input type="number" class="form-control mb-2" @keyup="unitDisable[`${func.name}_in_${input.name}`] = null" :placeholder="input.type" v-model="input.value">
                        <v-tooltip bottom
                        v-if="unitDisable[`${func.name}_in_${input.name}`] == null">
                          <template v-slot:activator="{ on }">
                            <v-btn 
                              icon 
                              ripple 
                              class="text-center"
                              @click="input.value = unitKLAY('to',input.value,`${func.name}_in_${input.name}`)"
                            >
                              <v-icon 
                                v-on="on"
                                style="font-size:18px"
                              >sync</v-icon>
                            </v-btn>
                          </template>
                          <span>To KLAY</span>
                        </v-tooltip>
                       
                      </v-layout>
                      <v-layout v-else-if="checkType(input.type) === 'Bool'" >
                        <select class="form-control mb-2" v-model="input.value">
                          <option>true</option>
                          <option>false</option>
                        </select>
                      </v-layout>
                    </div>

                    <!-- WRITE -->
                    <div class="text-xs-center" v-if="tab=='write'">
                      <v-dialog
                        v-model="func.dialog"
                        width="600"
                      >
                        <template v-slot:activator="{ on }">
                          <v-btn
                            color="red lighten-2"
                            dark
                            v-on="on"
                          >
                            Call
                          </v-btn>
                        </template>

                        <v-card>
                          <v-alert
                            :value="func.error == null && func.success == null"
                            type="warning"
                          >
                            Transmitted transactions are irrevocable.
                          </v-alert>
                          <v-alert
                            :value="func.error != null"
                            type='error'
                          >
                            {{ func.error }}
                          </v-alert>
                          <v-alert
                            :value="func.success != null"
                            type="success"
                          >
                            {{ func.success }}
                          </v-alert>
                          <h1
                            primary-title
                            align="center"
                          >
                            {{ func.name }}
                          </h1>
                          <v-card-text >
                              <fieldset disabled=""
                              v-for="input in func.inputs"
                              :key="input.name">
                                <label class="control-label" for="disabledInput">{{ input.name }}</label>
                                <input class="form-control" type="text" :value="input.value" disabled="">
                              </fieldset>
                          </v-card-text>

                          <v-divider></v-divider>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                              color="primary"
                              flat
                              @click="func.dialog = false; func.success=null; func.error=null"
                              :loading="func.loading"
                            >
                              Cancel
                            </v-btn>
                            <v-btn
                              color="primary"
                              flat
                              @click="writeFunc(func.name)"
                              :loading="func.loading"
                            >
                              Send Transaction
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </div>

                    <!-- READ -->
                    <div class="text-xs-center" v-else-if="tab=='read'">
                      <v-container>
                        <span 
                          v-for="(output,output_index) in func.output"
                          :key="output_index" 
                          class="mb-4" 
                          style="display:block"
                        >
                          {{ output }}

                          <!-- Bytes > String -->
                          <v-tooltip 
                            bottom
                            v-if="func.outputs[output_index].type.includes('bytes') && unitDisable[`${func.name}_out_${output_index}`] == null"
                          >
                            <template v-slot:activator="{ on }">
                              <v-btn icon ripple class="text-center"
                                @click="func.output[output_index] = convertBytesString('to', output,`${func.name}_out_${output_index}`)">
                                <v-icon 
                                  v-on="on"
                                  style="font-size:18px"
                                >sync</v-icon>
                              </v-btn>
                            </template>
                            <span>To String</span>
                          </v-tooltip>
                          <!-- Peb > KLAY -->
                          <v-tooltip 
                            bottom
                            v-if="checkType(func.outputs[output_index].type.replace('[]','')) === 'Number' && unitDisable[`${func.name}_out_${output_index}`] == null"
                          >
                            <template v-slot:activator="{ on }">
                              <v-btn icon ripple class="text-center"
                                @click="func.output[output_index] = unitKLAY('from',output,`${func.name}_out_${output_index}`)">
                                <v-icon 
                                  v-on="on"
                                  style="font-size:18px"
                                >sync</v-icon>
                              </v-btn>
                            </template>
                            <span>From KLAY</span>
                          </v-tooltip>
                        </span>

                      </v-container>

                      <p class="text-danger" v-if="func.error != null">{{ func.error }}</p>
                      <v-btn
                        color="red lighten-2"
                        dark
                        :loading="func.loading"
                        @click="readFunc(func.name)"
                      >
                        Call
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-actions>
        </v-card>
      </v-tab-item>
<!-- function list - end -->
    </v-tabs>
  </v-card>
</template>

<script>
  import { mapState } from "vuex"
  import { ethers } from 'ethers'
  import { go, tap, log, filterL, takeAll, find, filter, map } from 'fff-js'
  import { readFunction, writeFunction, checkType } from "../utils/contractFilter"
  import { contractWrite, contractRead } from "../utils/transactionCall";
  import { CONTRACT, ACCOUNTS, UTILS } from "../api";

  export default {
    data() {
      return {
        title: null,
        isAdmin: null,
        contract_data: null,
        contractFunctions: [],
        tabs : ["read", "write"],
        unitDisable : {},
        ...mapState(["selectNetwork", "contracts", "access_key"])
      }
    },
    methods: {
      unitKLAY(type, val, name){
        this.$set(this.unitDisable, name, true);

        if (type === 'to') {
          return (typeof val === 'object') 
            ? go(val, map(num => UTILS.toKLAY(num))) 
            : UTILS.toKLAY(val)
        } else if (type => type === 'from') {
          return (typeof val === 'object')
            ? go(val, map(num => UTILS.fromKLAY(num))) 
            : UTILS.fromKLAY(val)
        } else {
          return 0
        }
      },

      convertBytesString(type, val, name){
        this.$set(this.unitDisable, name, true);

        if (type === 'to') {
          return (typeof val == 'object') 
            ? go(val, map(byte => ethers.utils.parseBytes32String(byte))) 
            : ethers.utils.parseBytes32String(val)
        } else if (type === "from") {
          return (typeof val == 'object') 
            ? go(val, map(byte => ethers.utils.formatBytes32String(byte))) 
            : ethers.utils.formatBytes32String(val)
        }

      },

      initContract () {
        this.title = this.$route.params.name;
        this.contract_data = go(
          this.contracts()[this.selectNetwork()],
          find(v => v.name === this.title)
        );
        let functions = [];
        functions.push(readFunction(this.contract_data.abi));
        functions.push(writeFunction(this.contract_data.abi));
        this.contractFunctions = functions;

        go(
          functions[0],
          filter(obj => obj.name === "isAdmin"),
          arr => (arr.length == 0) 
            ? this.isAdmin = null 
            : go(
                contractRead(
                  this.contract_data.abi, 
                  this.contract_data.address, 
                  "isAdmin(address)", 
                  { account: ACCOUNTS.access(this.access_key()).address }),
                output => output ? this.isAdmin = true : this.isAdmin = false
              ) 
        )
      },

      printMessage(index1, index2, success, error, output){
        this.$set(this.contractFunctions[index1][index2], 'output', []);
        this.$set(this.contractFunctions[index1][index2], 'success', success);
        this.$set(this.contractFunctions[index1][index2], 'error', error);

        if(output != null){
          this.contractFunctions[index1][index2].outputs.length > 1 && typeof output === 'object'
          ? this.contractFunctions[index1][index2].output.push(...output)
            : this.contractFunctions[index1][index2].output.push(output)
        }
        setTimeout(() => {
          this.contractFunctions[index1][index2].success = null
          this.contractFunctions[index1][index2].error = null
        }, 5000)
      },

      async writeFunc(funcName){
        let index = this.indexFilter(1, funcName)
        this.$set(this.contractFunctions[1][index], 'loading', true);
        let callData = this.callDataFactory(1, funcName);

        ACCOUNTS.connect(this.access_key())
        try{
          if(callData.nomal)
            await go(
              contractWrite(
                this.contract_data.abi,
                this.contract_data.address,
                ACCOUNTS.access(this.access_key()),
                callData.functionSig,
                callData.paramObj
              ),
              tx => {
                this.printMessage(1, index, tx.transactionHash, null, null);
                log(`\n\n[${funcName}]`)
                log(tx)
              }
            ) 
          else{
            this.printMessage(1, index, null, "Input parameter.", null);
          }
        }catch(e){
          e.message = e.message.replace("Returned error: ","")
          e.message = e.message.substring(0,e.message.indexOf("(") === -1 ? e.message.length : e.message.indexOf("("))
          e.message = e.message.substring(0,e.message.indexOf("{") === -1 ? e.message.length : e.message.indexOf("{"))
          this.printMessage(1, index, null, e.message, null);
        }finally{
          ACCOUNTS.disconnect(ACCOUNTS.access(this.access_key()).address)
          this.contractFunctions[1][index].loading  = false
        }
      },

      async readFunc(funcName){
        this.unitDisable = {};
        let index = this.indexFilter(0, funcName)
        this.$set(this.contractFunctions[0][index], 'loading', true);
        let callData = this.callDataFactory(0, funcName);

        try{
          callData.nomal ? await go(
              contractRead(
                this.contract_data.abi, 
                this.contract_data.address, 
                callData.functionSig, 
                callData.paramObj),
              output => {
                this.printMessage(0, index, null, null, output)
                log(output)
              }
            )
            : this.printMessage(0, index, null, "Input parameter.", null);
        }catch(e){
          this.printMessage(0, index, null, e.message, null);
          e.message = e.message.substring(0,e.message.indexOf("(") === -1 ? e.message : e.message.indexOf("("))
        }finally{
          this.contractFunctions[0][index].loading  = false
        }
      },

      callDataFactory(index, funcName){
        let inputs = go(
          this.contractFunctions[index],
          find(obj => obj.name === funcName),
          ({ inputs }) => inputs
        )

        let functionSig = go(
          inputs,
          map(obj => obj.type),
          types => `${funcName}(${types.join(",")})`
        )

        let paramObj = {};
        let params = go(
          inputs,
          map(obj => {
            if (obj.type.includes("[]")) {
              let paramValue = obj.value.replace("[","").replace("]","").split(",")

              if (obj.type.includes('bool')) {
                paramValue = go(
                  paramValue,
                  map(str => str === 'true' ? true : false)
                )
              } else if (obj.type.includes('bytes')) {
                paramValue = go(
                  paramValue,
                  map(str => {
                    const size = Number(obj.type.replace(/[a-z]/g, "").replace("[]","")) * 2 + 2;
                    return go(
                      ethers.utils.formatBytes32String(str),
                      str => str.substring(0, size)
                    )
                  })
                )
              } 
              paramObj[obj.name] = paramValue
            } else if (obj.type === 'bool') {
              paramObj[obj.name] = (obj.value === 'true') ? true : false
            } else if (obj.type.includes('bytes')) {
              const size = Number(obj.type.replace(/[a-z]/g, "")) * 2 + 2;
              paramObj[obj.name] = go(
                ethers.utils.formatBytes32String(obj.value), 
                str => str.substring(0,size)
              )
            } else {
              paramObj[obj.name] = obj.value
            }
            return obj.value
          }),
          filter(val => val != undefined && val != '')
        )

        return {
            functionSig, 
            paramObj, 
            nomal: (params.length === inputs.length)
          }
      },
      
      indexFilter(index, funcName){
        return go(
          this.contractFunctions[index],
          map(e => e.name === funcName),
          arr => arr.indexOf(true)
        )
      },

      checkType
    },
    created(){
      this.initContract()
    },
    watch: {
      '$route' (to, from) {
        this.initContract()
      }
    }
  }
</script>

<style>
  #title-div{
    padding:20px;
    text-align: center
  }
  .v-card{
    padding:2%
  }
</style>