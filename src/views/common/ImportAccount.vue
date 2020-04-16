<template>
<v-layout>
  <v-flex xs12 sm6 offset-sm3 class="mt-5">
    <v-card>
      <v-tabs
        fixed-tabs
        v-model="active"
        slider-color="#4caeb3"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab"
          ripple
          @click="resetInputs()"
        >
          {{ tab }}

        </v-tab>
        <v-tab-item>
            <v-card flat>
              <v-card-actions>
                <div class="form-group" style="width:100%" >
                  <input type="text" placeholder="Private Key" class="form-control mb-2" :class="invalid['privateKey']" v-model="privateKey" @keyup='pkCheck()'>
                  <div class="valid-feedback" style="font-size:14px"> {{ pk_obj.address }}</div>
                  <div class="invalid-feedback" style="font-size:13px">Invalid key</div>
                </div>
              </v-card-actions>
            </v-card>
        </v-tab-item>
        <v-tab-item>
            <v-card flat>
              <v-card-actions>
                <div class="form-group" style="width:100%">
                    <label for="exampleInputFile">Keystore input</label>
                    <input type="file" class="form-control-file" aria-describedby="fileHelp" accept="application/json" ref="keystore_file" @change="fileCheck($event)">
                    <p class="text-danger">{{ keystore.warning}}</p>
                    <br/>
                    <input type="password" class="form-control" :class="invalid['keystore']" placeholder="Password" v-model="password">
                    <div class="invalid-feedback">{{ keystore.err }}</div>
                    <div class="text-center mt-2" >
                      <v-btn color="rgb(76, 174, 179)" @click="keystoreCheck()" flat>
                        Check State
                        <v-icon class="ml-1">lock</v-icon>
                      </v-btn>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
        </v-tab-item>
      </v-tabs>
      <v-container fill-height class="text-center" style="max-width:350px">
          <v-btn color="#4caeb3" style="color:white" block :disabled="access_disabled" @click="access">Access</v-btn>
      </v-container>
    </v-card>
  </v-flex>
</v-layout>
</template>

<style>
.v-card{
    padding:5%;
}
</style>

<script>
import { ACCOUNTS } from "../../api";
import { mapActions } from "vuex"

  export default {
    data () {
      return {
        active: null, //ег index
        access_disabled: true, //access disabled
        keystore: {
          file : null,
          obj : null, //keystore
          warning : null,
          err : null
        },
        password: null,
        pk_obj: {address:null}, 
        privateKey: null,
        invalid: {
          privateKey: null,
          password: null,
          keystore: null
        },
        tabs : [
            "Private Key",
            "Keystore File",
        ],
      }
    },
    methods: {
      ...mapActions(["accessKey"]),
      accessBtnDisabled(bool){
        bool ? this.access_disabled = true : this.access_disabled = false;
      },
      resetInputs(){
        this.accessBtnDisabled(true);
        this.$refs.keystore_file.value = '';
        this.privateKey = null;
        this.password = null;
        this.invalid["privateKey"] = null;
        this.invalid["keystore"] = null;
      },
      pkCheck() {
        try{
          this.pk_obj = ACCOUNTS.access(this.privateKey)
          this.invalid["privateKey"] = "is-valid";
          this.accessBtnDisabled(false);
          return true;
        }catch(e){
          this.invalid["privateKey"] = "is-invalid"
          this.accessBtnDisabled(true);
          return false;
        }
      },
      fileCheck(event) {
        let keystore = event.target.files[0];

        let reader = new FileReader();
        reader.readAsText(keystore,"euc-kr");
        reader.onload = (e)=>{
          let content = JSON.parse(e.target.result);
          this.keystore.file = content;
          this.keystore.warning = "";
          if(this.password != null) this.keystoreCheck();
        }
      },
      keystoreCheck(){
        if(this.keystore.file == null){
          this.keystore.warning = "Input file";
        }else{
          try{
            let keystore = ACCOUNTS.decrypt(this.keystore.file, this.password);
            this.keystore.obj = keystore;
            this.invalid["keystore"] = "is-valid"
            this.accessBtnDisabled(false);
            return true;
          }catch(e) {
            this.keystore.err = e.message;
            this.invalid["keystore"] = "is-invalid"
            this.accessBtnDisabled(true);
          }
        }
      },
      access() {
        if(this.active === 0 && this.pkCheck()){ //pk
          this.accessKey(this.pk_obj.privateKey);
        }else if(this.active === 1 && this.keystoreCheck()){ //keystore
          this.accessKey(this.keystore.obj.privateKey);
        }
      }
    }
  }
</script>