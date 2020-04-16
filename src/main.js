import Vue from "vue";
import './plugins/fontawesome'
import './plugins/vuetify'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap'
// import 'bootstrap/dist/css/bootstrap.min.css'


Vue.config.productionTip = false;


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
