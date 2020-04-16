<template>
<v-container grid-list-md text-xs-center>
    <h4 align="center" class="mt-4" style="font-size:24px; color:#777777"> <strong> LOCK DETAILS </strong> </h4>
    <v-divider class="my-3"></v-divider>
    <v-layout justify-center>
        <v-flex xs12 sm6>
        <v-text-field
            label="Owner Address"
            color="#4caeb3"
            v-model="ownerAddress"
            :rules="rules.ownerAddress"
            class="mb-4 "
            @keyup="changeAddress"
        ></v-text-field>
        </v-flex>
    </v-layout>
    <v-layout justify-center>
        <v-flex xs4 class="mr-5">
            <v-text-field
                label="Total Locked Tokens"
                color="#4caeb3"
                v-model="lockedToken"
                class="mb-4"
                readonly
                suffix="SPIN"
                stype="color:gray"
            ></v-text-field>
        </v-flex>
        <v-flex xs4 class="ml-5">
            <v-text-field
                label="Total Claimable Tokens"
                color="#4caeb3"
                v-model="claimableToken"
                readonly
                class="mb-4"
                suffix="SPIN"
            ></v-text-field>
        </v-flex>
    </v-layout>
    <v-data-table
    :headers="headers"
    :items="datas"
    class="elevation-1 ml-4 mr-4"
    >
        <template v-slot:items="props">
        <td class="text-xs-left">{{ props.item.reasons }}</td>
        <td class="text-xs-left">{{ props.item.amounts }}</td>
        <td class="text-xs-left">{{ props.item.validities }}</td>
        <td class="text-xs-left">{{ props.item.claimStatus }}</td>
        </template>
    </v-data-table>
</v-container>
</template>

<script>
  import { mapState } from "vuex"
  import { CONTRACT, ACCOUNTS, UTILS } from "../api";
  import { contractRead } from "../utils/transactionCall";
  import { go, log, filter, filterL, takeAll, first, map, find } from 'fff-js'
  import { ethers } from 'ethers';

export default {
    data() {
        return {
            ...mapState(["contracts","selectNetwork"]),
            ownerAddress: "",
            lockedToken: "0",
            claimableToken: "0",
            rules : {
                ownerAddress : [
                    v => this.addressCheck()
                ]
            },
            datas : [],
            headers: [
                {
                    text : "LOCK REASON",
                    align: 'left',
                    value: "reasons"
                },
                {
                    text : "LOCKED TOKEN AMOUNT (SYMBOL)",
                    align: 'left',
                    value: "amounts"
                },
                {
                    text : "LOCK EXPIRY DATE",
                    align: 'left',
                    value: "validities",
                    sortable: false
                },
                {
                    text : "TOKEN STATUS",
                    align: 'left',
                    value: "claimStatus",
                    sortable: false
                }
            ]
        }
    },
    methods:{
        addressCheck(key){
            return UTILS.isAddress(this.ownerAddress) || this.ownerAddress === "" ? true : "Invalid Address"
        },
        async changeAddress(){
            this.datas = []
            this.lockedToken = "0"
            this.claimableToken = "0"
            
            if(this.addressCheck(this.ownerAddress) === true && this.ownerAddress != ""){
                const contract = go(
                    this.contracts()[this.selectNetwork()],
                    filter(obj => obj.name === "Crowdsale"),
                    takeAll,
                    first
                )
                
                const output = await contractRead(
                        contract.abi, 
                        contract.address, 
                        "getLockDetails(address)", 
                        {lockee : this.ownerAddress})
                this.dataConvertToHumanReadable(output);
            }
        },
        dataConvertToHumanReadable(data){
            data.forEach((keyArr, index) => {
                keyArr.forEach((valArr, val_index) => {
                    index == 0 && this.datas[val_index] == null ? this.datas.push({}) : false
                    switch(index){
                        case 0 : valArr = ethers.utils.parseBytes32String(valArr) 
                                break;
                        case 1 : valArr = UTILS.fromKLAY(valArr)
                                break;
                        case 2 : valArr = this.getTimeStamp(valArr)
                                break;
                        case 3 : valArr = valArr ? 'claimed' : Date.parse(this.datas[val_index].validities) < + new Date() ? 'claimable' : "locked"
                                break;
                        default : valArr;
                    }
                    this.datas[val_index][this.headers[index].value] = valArr
                })
            })

            this.lockedToken = go(
              this.datas,
              arr => this.amountSum(arr)
            )

            this.claimableToken = go(
              this.datas,
              filter(obj => obj.claimStatus === "claimable"),
              arr => this.amountSum(arr)
            )
        },
        getTimeStamp(timestamp) {
            var d = new Date(timestamp * 1000);
            var s =
                this.leadingZeros(d.getFullYear(), 4) + '.' +
                this.leadingZeros(d.getMonth() + 1, 2) + '.' +
                this.leadingZeros(d.getDate(), 2) + ' ' +

                this.leadingZeros(d.getHours(), 2) + ':' +
                this.leadingZeros(d.getMinutes(), 2)
            return s;
        },
        leadingZeros(n, digits) {
            var zero = '';
            n = n.toString();

            if (n.length < digits) {
                for (let i = 0; i < digits - n.length; i++)
                zero += '0';
            }
            return zero + n;
        },
        amountSum(arr){
            arr = go(
                arr,
                map(obj => obj.amounts )
            )
            return arr.length === 0 ? "0" 
                : arr.length === 1 ? arr[0] 
                    : arr.reduce((acc,current) => Number(acc) + Number(current)) 

        }
    }
}
</script>
