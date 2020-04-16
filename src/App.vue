<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      v-if="access_key !== null"
    >
      <v-list light>
        <v-list-group
          v-for="menu in menus"
          :key="menu.name"
          :prepend-icon="menu.icon != null ? menu.icon : 'description'"
          :append-icon="menu.arrayFunc != null ? 'keyboard_arrow_down' : ''"
        >
          <template 
            v-slot:activator 
            :ref="menu.name">
            <v-list-tile :to="menu.url != null ? menu.url : `/contract/${menu.name}`">
                <v-list-tile-title>{{ menu.name }}</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile
            v-for="arrayFunc in menu.arrayFunc"
            :key="arrayFunc"
            :to="`/arrayFunc/${menu.name}/${arrayFunc}`"
          >
            <v-list-tile-action>
            </v-list-tile-action>
            <v-list-tile-title>{{ arrayFunc }}</v-list-tile-title>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="#4caeb3" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" v-if="access_key !== null"></v-toolbar-side-icon>
      <v-toolbar-title>
        <img src="./assets/logo.png"/>
        <sub class="ml-3" style="color:rgb(191, 88, 88)">Admin</sub>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat v-if="access_key !== null" @click="disconnectKey">
          <v-icon style="font-size:17px" class="mr-1">delete_forever</v-icon>
          clear Private Key
        </v-btn>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn 
              flat
              v-on="on"
            >
              <v-icon style="font-size:17px" class="mr-1">rss_feed</v-icon>
              Network
              <sub class="ml-2" style="color:#d9e7f7">{{ selectNetwork() }}</sub>
            </v-btn>
          </template>
          <v-list>
            <v-list-tile
              v-for="(network, index) in networks"
              :key="index"
              @click="changeNetwork(network); menusReset()"
            >
              <v-list-tile-title>
                {{ network }}
                <v-icon v-if="selectNetwork() === network" color="#4caeb3" style="font-size:20px">done</v-icon>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
  import { mapState, mapActions } from "vuex"
  import { ACCOUNTS, UTILS, KLAY } from "./api";
  import { go, log } from 'fff-js'

  export default {
    data: () => ({
      ...mapState(["contracts","selectNetwork"]),
      drawer: null,
      menus : []
    }),
    computed: {
      ...mapState(["access_key", "networks"])
    },
    methods: {
      ...mapActions(["check","changeNetwork","disconnectKey"]),
      menusReset(){
        this.menus = [
          {
            name : "Wallet",
            icon : "account_balance_wallet",
            url : "/wallet" 
          },
          {
            name : "Lock Details",
            icon : "vpn_lock",
            url : "/lock_details" 
          },
          ...this.contracts()[this.selectNetwork()],
          {
            name : "Other",
            icon : "extension",
            url : "/other" 
          }
        ]
      }
    },
    props: {
      source: String
    },created(){
      this.menusReset();
    },
    watch: {
      '$route' (to, from) {
        this.menusReset();
      }
    }
  }
</script>