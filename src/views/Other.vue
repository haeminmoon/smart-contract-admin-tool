<template>
<div>
    <v-layout class="mt-5">
        <!-- Temporary Contract Add  -->
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-alert
                    :value="error_message !== null"
                    type="error"
                    >
                    {{ error_message}}
                </v-alert>
                <div class="form-group">
                    <h1 align="center">Temporary Contract</h1>
                    <div class="mb-4">
                        <label class="col-form-label" for="inputDefault">Contract Name</label>
                        <input type="text" class="form-control mb-4" :class="invalid.name" placeholder="SampleContract" v-model="inputs.name" @keyup='nomalCheck()'>
                    </div>

                    <div class="mb-4">
                        <label class="col-form-label" for="inputDefault">Contract Address</label>
                        <input type="text" class="form-control" :class="invalid.address" placeholder="0x00000..." v-model="inputs.address" @keyup='isCA()'>
                        <div class="invalid-feedback">{{ address_message }}</div>
                    </div>

                    <label>Network</label>
                    <select class="form-control mb-4"
                        @change='nomalCheck()'
                        v-model="inputs.network"
                        >
                        <option
                            v-for="(network, index) in networks()"
                            :key="index">
                            {{ network }}
                        </option>
                    </select>

                    <label for="exampleInputFile">ABI File input</label>
                    <input type="file" class="form-control-file" aria-describedby="fileHelp" accept="application/json" ref="abiInput" @change="readFile($event)">
                    <small class="form-text text-muted">Register Contract abi file.</small>
                    <p class="text-danger" style="font-size:12px">{{ file_error }}</p>
                
                    <v-btn class="mt-5" :loading="loading" block color="#4caeb3" style="color:white" :disabled="!nomal" @click="insert()">Insert Contract</v-btn>
                </div>
            </v-card>
        </v-flex>
    </v-layout>

    <!-- UTILS -->
    <v-layout class="mt-5 mb-10" style="margin-bottom:100px">
        <v-flex xs12 sm10 offset-sm1>
            <v-card>
                <v-alert
                    :value="error_message !== null"
                    type="error"
                    >
                    {{ error_message}}
                </v-alert>
                <div class="form-group">
                    <h1 align="center">Utils</h1>

                    <!-- Decode rawTransaction -->
                     <v-card
                        class="mx-auto mb-5 mt-4"
                    >
                        <div class="overline mb-4">
                            <v-chip
                                class="ma-1"
                                color="red"
                                text-color="white"
                                small
                                >
                                Decode
                            </v-chip>
                            rawTransaction
                        </div>
                        <v-text-field
                            v-model="decode.rawTx"
                            hint="ex) 0x892731273eewqeqw..."
                            label="RawTransaction"
                            @keyup.enter="decodeRaw()"
                            color="#4caeb2"
                        ></v-text-field>
                        <v-btn class="mb-5" :disabled="!decode.rawTx" @click="decodeRaw()" block color="#4caeb3" style="color:white">
                            Convert <v-icon style="font-size:18px">sync</v-icon>
                        </v-btn>
                     </v-card>

                    <!-- Decode input data -->
                    <v-card
                        class="mx-auto mb-5"
                    >
                        <div class="overline mb-4">
                            <v-chip
                                class="ma-1"
                                color="red"
                                text-color="white"
                                small
                                >
                                Decode
                            </v-chip>
                            Data hex
                        </div>
                        <v-text-field
                            v-model="decode.data.types"
                            hint="ex) string,address,uint256[]"
                            label="Param types"
                            color="#4caeb2"
                            @keyup.enter="decodeData()"
                        ></v-text-field>
                        <v-text-field
                            v-model="decode.data.hex"
                            hint="ex) 0xd293123213129edasd9..."
                            label="Data hex"
                            color="#4caeb2"
                            @keyup.enter="decodeData()"
                        ></v-text-field>
                        <v-checkbox v-model="decode.data.funcsig" class="mx-2" color="#4caeb2" label="Does hex include funcsig?"></v-checkbox>
                        <v-btn class="mb-5" :disabled="!decode.data.hex" @click="decodeData()" block color="#4caeb3" style="color:white">
                            Convert <v-icon style="font-size:18px">sync</v-icon>
                        </v-btn>
                    </v-card>

                    <!-- Encode Funcsig -->
                    <v-card
                        class="mx-auto mb-5"
                        outlined
                    >
                        <div class="overline mb-4">
                            <v-chip
                                class="ma-1"
                                color="primary"
                                text-color="white"
                                small
                                >
                                Encode
                            </v-chip>
                            Function Signature
                        </div>
                        <v-text-field
                            v-model="encode.funcsig"
                            hint="ex) funcName(string,address)"
                            label="Function name (param types)"
                            color="#4caeb2"
                            @keyup.enter="encodeFuncsig()"
                        ></v-text-field>
                        <v-btn class="mb-5" :disabled="!encode.funcsig" @click="encodeFuncsig()" block color="#4caeb3" style="color:white">
                            Convert <v-icon style="font-size:18px">sync</v-icon>
                        </v-btn>
                    </v-card>

                    <!-- Encode Params -->
                    <v-card
                        class="mx-auto mb-5"
                        outlined
                    >
                        <div class="overline mb-4">
                            <v-chip
                                class="ma-1"
                                color="primary"
                                text-color="white"
                                small
                                >
                                Encode
                            </v-chip>
                            Data hex
                        </div>

                        <v-layout 
                            wrap 
                            align-center
                            v-for="(item,index) in encode.data"
                            :key="index"
                        >
                            <v-flex xs12 sm3 d-flex>
                                <v-select
                                    :items="types"
                                    label="Type"
                                    v-model="encode.data[index].type"
                                    color="#4caeb2"
                                ></v-select>
                            </v-flex>
                            <v-flex xs12 sm2 d-flex>
                                <v-checkbox v-model="encode.data[index].array" color="#4caeb2" class="mx-2" label="to Array"></v-checkbox>
                            </v-flex>
                            <v-flex xs12 sm6 d-flex>
                                <v-text-field
                                    v-model="encode.data[index].value"
                                    hint=""
                                    label="value"
                                    color="#4caeb2"
                                    @keyup.enter="encodeFuncsig()"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm1>
                                <v-btn flat icon color="red" @click="removeData(index)">
                                <v-icon>remove</v-icon>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                        <v-btn block flat  class="mb-3" @click="addData()" color="success">
                            <v-icon>add</v-icon>
                        </v-btn>
                        <v-btn class="mb-5" :disabled="encode.data.length==0" @click="encodeData()" block color="#4caeb3" style="color:white">
                            Convert <v-icon style="font-size:18px">sync</v-icon>
                        </v-btn>
                    </v-card>

                    <v-snackbar
                        v-model="showConsole"
                        class="mb-2"
                        color="success"
                        :multi-line="true"
                    >
                    result to developer console
                    </v-snackbar>

                </div>
            </v-card>
        </v-flex>
    </v-layout>
</div>
</template>

<script>
    import { mapState, mapActions } from "vuex"
    import { go, log, map, filter } from 'fff-js'
    import { ACCOUNTS, UTILS } from "../api"; 

export default {
    name: "Others",
    data() {
        return{
            nomal: false,
            loading: false,
            showConsole: false,
            types:["string","address","bool"],
            inputs : {
                name: "",
                address: "",
                address: "",
                network: "",
                abi: ""
            },
            encode: {
                rawTx:"",
                data: [],
                funcsig:""
            },
            decode: {
                rawTx:"",
                data: {
                    types:null,
                    hex:null,
                    funcsig:false
                }
            },
            invalid: {
                name: null,
                address: null
            },
            address_message: null,
            file_error: null,
            error_message: null,
            ...mapState(["networks", "selectNetwork"])
        }
    },
    methods : {
        ...mapActions(["insertContract"]),

        shoeConsoleAlert(){
            this.showConsole=true
        },

        addData(){
            this.encode.data.push({type:null, array:false, value:""})
        },

        removeData(index){
            this.encode.data.splice(index,1)
        },

        decodeRaw(){
            this.shoeConsoleAlert()
            console.clear()
            log(UTILS.decodeRawTx(this.decode.rawTx))
        },

        decodeData(){
            this.shoeConsoleAlert()
            console.clear()
            const types = this.decode.data.types.replace(" ","").split(",")
            let hex = this.decode.data.hex.replace(" ","")
            hex = !!this.decode.data.funcsig ? `0x${hex.substring(10)}` : hex

            try{
                log(UTILS.decodeData(types,hex));
            }catch(e){
                console.warn("check input!")
                console.error(e.message)
            }
        },

        encodeFuncsig(){
            this.shoeConsoleAlert()
            console.clear();
            this.encode.funcsig = this.encode.funcsig.replace(" ", "")
            log(UTILS.encodeFuncsig(this.encode.funcsig))
        },

        encodeData(){
            this.shoeConsoleAlert()
            console.clear();

            const types = go(
                this.encode.data,
                map(data => !!data.array ? `${data.type}[]` : data.type),
                filter(data => data !== "" && !!data)
            )

            const values = go(
                this.encode.data,
                map(data => {
                    let result = !!data.array 
                    ? data.value.replace(" ","").replace("[","").replace("]","").split(",") 
                    : data.value.replace(" ","")
                    if(result === "true" || result === "false") {
                        result = result === "true" ? true : false
                    }else if(result[0] === "true" || result[0] === "false"){
                        result = go(
                            result,
                            map(bool => bool === "true" ? true : false)
                        )
                    }
                    return result
                }),
                filter(data => data !== "" && data !== null)
            )

            log(values)

            try{
                if(types.length != values.length || types.length == 0 || values.length == 0) throw "There is null among input."
                log(UTILS.encodeData(types,values))
            }catch(e){
                console.warn("check input!")
                console.error(e)
            }
        },

        readFile(event) {
            this.file_error = null;
            let abi = event.target.files[0];
            let reader = new FileReader();
            reader.readAsText(abi,"euc-kr");
            reader.onload = (e)=>{
                let content;
                try{
                    content = JSON.parse(e.target.result);
                    if(content.length != undefined){
                        this.inputs.abi = content
                    } else{
                        this.inputs.abi = ""
                        this.$refs.abiInput.value = '';
                        this.file_error = "This is not an abi file."
                    }
                }catch(e){
                    this.inputs.abi = ""
                    this.$refs.abiInput.value = ''
                    this.file_error = "This is not an abi file."
                }finally{
                    this.nomalCheck()
                }
            }
        },
        nomalCheck(){
            (this.inputs.name !== "" &&
            this.inputs.address !== "" &&
            this.inputs.network !== "" &&
            this.inputs.abi !== "" &&
            this.invalid["address"] === null) ?
                this.nomal = true : this.nomal = false  
        },
        isCA(){
            try{
                UTILS.isContractAccount(this.inputs.address) ?
                    this.invalid["address"] = null: this.invalid["address"] = "is-invalid"
                this.nomalCheck()
            }catch(e){
                this.invalid["address"] = "is-invalid"
                this.address_message = "Invalid Address"
                this.nomalCheck()
            }
        },
        async insert(){
            this.loading = true;
            this.error_message = null;

            this.invalid["name"] = null
            this.invalid["address"] = null

            let obj ={
                network : this.inputs.network,
                name : this.inputs.name,
                address : this.inputs.address,
                abi : this.inputs.abi,
            }
            let message = await this.insertContract(obj);

            switch(message){
                case 'Name already in use': 
                    this.invalid["name"] = "is-invalid";
                    this.error_message = message 
                    break;
                case 'Address already in use':
                    this.error_message = message 
                    this.address_message = "";
                    this.invalid["address"] = "is-invalid";
                    break;
            }
            this.loading = false;
        }
    },
    created() {
        this.inputs.network = this.selectNetwork()
        const numberType = ["uint","int"]
        go(
            numberType,
            map(type => {
                let returnType = [];
                for(let i = 8; i <= 257; i+=8){
                    returnType.push(`${type}${i}`)
                }
                return returnType
            }),
            map(types => {
                this.types.push(...types)
            })
        )

        // for(let i = 1; i <= 32; i++){
        //     this.types.push(`bytes${i}`)
        // }
    }
}
</script>
