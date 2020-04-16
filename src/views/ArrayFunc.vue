<template>
<div>
  <v-alert
    class="mt-0"
    :value="alert.list.message != null"
    :type="alert.list.type"
    >
    {{ alert.list.message }}
  </v-alert>
  <v-card flat>

  <v-toolbar flat color="white">
        <v-toolbar-title>{{ contract.name }} - {{ $route.params.func }}</v-toolbar-title>
        <v-divider
          class="mx-2"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog.edit" max-width="500px">
          <template v-slot:activator="{ on }">
            <input type="file" ref="file" hidden @change="excelUpload($event)" accept=".csv">
            <v-btn color="primary" class="mb-2" @click="$refs.file.click()">EXCEL UPLOAD</v-btn>
            <v-btn color="success" class="mb-2" v-on="on">ADD</v-btn>
            <v-btn color="success" class="mb-2" @click="clear()">CLEAR</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex md12
                    v-for="input in inputs"
                    :key="input.name">
                    <v-text-field v-model="editedItem[input.name]" :placeholder="input.type.replace('[]','')" :label="input.name">{{input.name}}</v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>

    <v-card-actions>
        <v-data-table
          expand
          :headers="headers"
          :items="datas"
          class="elevation-1"
          no-data-text="None data"
          style="width:100%"
        >
          <template v-slot:items="props">
            <td 
              v-for="item in inputs"
              :key="item.name">{{ props.item[item.name] }}</td>
            <td class="justify-center layout px-0">
            <v-icon
              small
              class="mr-2"
              @click="editItem(props.item)"
            >
              edit
            </v-icon>
            <v-icon
              small
              @click="deleteItem(props.item)"
            >
              delete
            </v-icon>
          </td>
          </template>
        </v-data-table>
    </v-card-actions>
    <v-container class="text-center" style="max-width:350px">

      <v-dialog
        v-model="dialog.call"
        width="600"
      >
        <template v-slot:activator="{ on }">
            <v-btn color="#4caeb3" style="color:white" v-on="on" :disabled="datas.length == 0" >CALL</v-btn>
        </template>

        <v-card>
          <v-alert
            value="true"
            :type="alert.call.type"
          >
            {{alert.call.message}}
          </v-alert>
          <h1
            primary-title
            align="center"
          >
            {{ contract.name }} - {{ $route.params.func }}
          </h1>
          <v-card-text >
            <div 
              v-for="input in inputs"
              :key="input.name"
            >
              <v-container
                v-if="checkType(input.type.replace('[]','')) == 'Number'"
              >
                  <label >{{input.name}}</label>
                  <v-radio-group v-model="input.unit" row >
                    <v-radio default label="Default" value="default"></v-radio>
                    <v-radio label="Token Unit" value="token"></v-radio>
                    <v-radio label="Time (YYYY.MM.DD hh:mm)" value="time">
                      <template v-slot:label>
                        <div>Time <small class="success--text">ex) YYYY.MM.DD hh:mm</small></div>
                      </template>
                    </v-radio>
                  </v-radio-group>
              </v-container>
            </div>
          </v-card-text>

          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              flat
              @click="dialog.call = false"
              :loading="loading.cancel"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              flat
              @click="sendTransaction"
              :loading="loading.sendTx"
            >
              Send Transaction
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
     
    </v-container>
  </v-card>
</div>
</template>

<script>
  import { go, log, first, filter, filterL, take, takeAll, map, find } from 'fff-js';
  import { mapState } from "vuex"
  import { checkType } from "../utils/contractFilter"
  import { contractWrite } from "../utils/transactionCall";
  import { setTimeout } from 'timers';
  import { ethers } from 'ethers';
  import { ACCOUNTS, UTILS } from "../api";

  export default {
    data () {
      return {
        dialog:{
          edit: false,
          call: false
        },
        loading:{
          sendTx: false,
          cancel : false,
        },
        alert: {
          call:{
            type: "warning",
            message: "Transmitted transactions are irrevocable."
          },
          list:{
            type: "success",
            message: null
          }
        },
        headers: [],
        datas: [],
        contract: {},
        inputs: [],
        editedIndex: -1,
        editedItem : {},
        defaultItem : {},
         ...mapState(["selectNetwork", "contracts", "access_key"])
      }
    },
    methods:{
      checkType,
      init(){
        this.clear()
        let contractName = this.$route.params.name;
        let funcName = this.$route.params.func;

        this.headers = go(
            this.contracts()[this.selectNetwork()],
            find(contracts => contracts.name === contractName),
            contract => {
              this.contract = contract
              return contract.abi
            },
            find(funcs => funcs.name === funcName),
            func => {
              this.inputs = func.inputs
              return func.inputs
            },
            map(inputs => {
              this.defaultItem[inputs.name] = ""
              return {
                text : `${inputs.name} (${inputs.type.replace("[]","")})`,
                  align: 'left',
                  value: inputs.name
              }
            })
        )
        this.editedItem = this.deleteItem
      },

      excelUpload (event) {
        let excel = event.target.files[0];

        let reader = new FileReader();
        reader.readAsText(excel,"euc-kr");
        reader.onload = (e) => {
          let data = go(
            e.target.result,
            str => str.split(/\r\n|\n/),
            map(str => str.split(",")),
            filter(_ => _ != '')
          )

          let header = data[0];

          //������ �ʼ� Ű���� ����
          let essentialHeader = go(
            this.inputs,
            map(obj => obj.name),
            filter(str => go(
                header,
                filter(hStr => hStr === str),
                _ => _.length != 0
              )
            )
          )
          //Ű���� ������ ��� ����
          if(essentialHeader.length != this.inputs.length){
            this.setAlert('list', 'error', 'A file that does not have sufficient key value.');
            this.$refs.file.value = '';
            this.datas = [];
            return false;
          }

          //�ʼ��� �ƴ� Ű���� ����
          let deleteKey = go(
            header,
            filter(str => go(
                essentialHeader,
                filter(check => check === str),
                _ => _.length == 0
              )
            )
          )

          //�ʼ� Ű���� ���� �����Ѱ�� ����
          let params = go(
            data,
            filterL(arr => arr != header), //header ���͸�
            takeAll,
            map(arr => {
              let obj = {};
              header.forEach((name, i) => {
                obj[name] = arr[i]
              })

              //�ʼ��� �ƴ� Ű�� ����
              return go(
                  deleteKey,
                  map(key => delete obj[key]),
                  _ => obj,
                )
            })
          )

          //�� üũ 
          let check = go(
            params,
            filter(obj => go(
                essentialHeader,
                filter(name => obj[name] === ""),
                _ => _.length != 0
              )
            ),
            _ => _.length == 0 ? true : false
          )
          if(!check){
            this.setAlert('list', 'error', 'Contains empty data.');
            this.$refs.file.value = '';
            this.datas = [];
            return false;
          }
          
          this.datas = params;
        }
        this.$refs.file.value = ''
      },

      async sendTransaction() {
        this.loading.sendTx = true;
        this.loading.cancel = true;

        //unit ���õǾ����� üũ
        let unitCheck = go(
          this.inputs,
          filter(obj => this.checkType(obj.type.replace("[]",""))==='Number'),
          filter(obj => obj.unit == null),
          arr => arr.length == 0
        )
        if(!unitCheck){
          this.setAlert('call', 'error', "Select number unit.");
          this.loading.sendTx = false;
          this.loading.cancel = false;
          return false;
        }

        try{
          let contract = go(
            this.contracts()[this.selectNetwork()],
            find(obj => obj.name === this.$route.params.name)
          )

          let types = go(
            this.inputs,
            map(input => input.type)
          )

          let functionSig = `${this.$route.params.func}(${types.join(",")})`
          
          let paramObj = {};
          this.inputs.forEach(inputObj => {
            paramObj[inputObj.name] = [];
            this.datas.forEach(data => {
              if (inputObj.unit == "token") {
                paramObj[inputObj.name].push(UTILS.toKLAY(data[inputObj.name]))
              } else if (inputObj.unit == "time") {
                if (isNaN(Date.parse(data[inputObj.name]))) {
                  throw({message:"The time pattern does not match."})
                }
                paramObj[inputObj.name].push(Date.parse(data[inputObj.name])/1000)
              } else if (inputObj.type.replace(/[0-9]/g, "").replace("[]","") === "bytes") {
                paramObj[inputObj.name].push(ethers.utils.formatBytes32String(data[inputObj.name]))
              } else paramObj[inputObj.name].push(data[inputObj.name])
            })
          })
          
          ACCOUNTS.connect(this.access_key()) 
          await go(
            contractWrite(
              contract.abi,
              contract.address,
              ACCOUNTS.access(this.access_key()),
              functionSig,
              paramObj
            ),
            tx => {
              this.setAlert('list', 'success', tx.transactionHash);
              log(tx)
              this.datas = [];
            }
          ) 
        }catch(e){
          e.message = e.message.replace("Returned error: ","")
          e.message = e.message.substring(0,e.message.indexOf("(") === -1 ? e.message.length : e.message.indexOf("("))
          e.message = e.message.substring(0,e.message.indexOf("{") === -1 ? e.message.length : e.message.indexOf("{"))
          this.setAlert('list', 'error', e.message);
          log(e.message)
        }finally{
          this.loading.sendTx = false;
          this.loading.cancel = false;
          this.dialog.call = false;
          ACCOUNTS.disconnect(ACCOUNTS.access(this.access_key()).address)
        }
      },

      setAlert(key, type, message) {
        this.alert[key].type = type;
        this.alert[key].message = message;
        setTimeout(()=>{
          this.alert[key].message = key === 'call' ? 'Transmitted transactions are irrevocable.' : null;
        },8000);
      },

      editItem (item) {
        this.editedIndex = this.datas.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog.edit = true
      },

      deleteItem (item) {
        const index = this.datas.indexOf(item)
        confirm('Are you sure you want to delete this item?') && this.datas.splice(index, 1)
      },

      close () {
        this.dialog.edit = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },

      save () {
        this.editedIndex > -1 ?
          Object.assign(this.datas[this.editedIndex], this.editedItem)
          : this.datas.push(this.editedItem)
        this.close()
      },

      clear() {
        this.datas = [];
      }
    },
    created(){
        this.init();
    },
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'ADD Data' : 'Edit Data'
      }
    },
    watch: {
      '$route' (to, from) {
        this.init();
      },
      dialog (val) {
        val || this.close()
      }
    }
  }
</script>