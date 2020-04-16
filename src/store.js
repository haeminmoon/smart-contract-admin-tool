import Vue from "vue";
import Vuex from "vuex";
import { go, log, takeAll, filterL } from 'fff-js'
import router from "./router";
import { initNetwork, UTILS, ACCOUNTS, KLAY } from "./api";
import { initialSetting, networks, tokens, contracts } from "../config/initData.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    access_key:null,
    access_time:null,
    networks : networks,
    selectNetwork : initialSetting,
    contracts: contracts,
    tokens: tokens
  },
  mutations: {
    saveKey(state, access_key){
      state.access_key = access_key;
      state.access_time = new Date().getTime();
    },
    removeKey(state){
      state.access_key = null;
      state.access_time = 0;
    },
    changeNetwork(state, network){
      state.selectNetwork = network; 
    },
    pushContract(state, paramObj){
      let network = paramObj.network;
      delete paramObj.network

      state.contracts[network].push(paramObj);
    },
    pushToken(state, paramObj){
      let network = paramObj.network;
      delete paramObj.network
      
      state.tokens[network].push(paramObj);
    }
  },
  actions: {
    accessKey({ state, commit }, access_key){
      commit("saveKey", access_key);
      router.push({ name : "wallet"});
    },
    disconnectKey({ commit }){
      commit("removeKey");
      router.push("/")
    },
    changeNetwork({ commit }, network){
      commit("changeNetwork", network);
      initNetwork(network);
      router.push({ name : "wallet"})
    },

    /**
     * @param { Object } paramObj
     * {
     *    network : "baobab",
     *    name : "Test",
     *    address : "0x0000...",
     *    abi : [{},{},{}]
     * }  
     * @return { String } Success || error.message
    */
    insertContract({ state, commit }, paramObj){
      let network = paramObj.network

      return go(
        state.contracts[paramObj.network],
        filterL(obj => obj.name === paramObj.name),
        takeAll,
        name_arr => 
          name_arr.length === 0 ? 
            go(
              state.contracts[paramObj.network],
              filterL(obj => obj.address === paramObj.address),
              takeAll,
              addr_arr => {
                // if(addr_arr.length === 0){
                if(true){
                  commit("pushContract", paramObj);
                  network !== state.selectNetwork ? 
                    commit("changeNetwork", network) : router.push(`/contract/${paramObj.name}`)
                    router.push({name:"wallet"})
                  return "Success"
                }else return "Address already in use"
              }
            ) : "Name already in use"
      )//go
    }
  }
});
