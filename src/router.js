import Vue from "vue";
import Router from "vue-router";
import store from './store'

Vue.use(Router);

import ErrorPage from './views/common/ErrorPage404'
import ImportAccount from './views/common/ImportAccount'
import Contract from './views/Contract'
import ArrayFunc from './views/ArrayFunc'
import Wallet from './views/Wallet'
import Lock_details from './views/Lock_details'
import Other from './views/Other'

const onlyAccessAuth = (to, from, next) => {
  store.state.access_key === null ? next('/') : next()
}
const noneAccessAuth = (to, from, next) => {
  store.state.access_key === null ? next() : next('/wallet')
}

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      beforeEnter: noneAccessAuth,
      components: {
        default: ImportAccount
      }
    },
    {
      path: '/wallet',
      name: 'wallet',
      beforeEnter: onlyAccessAuth,
      components: {
        default: Wallet
      }
    },
    {
      path: '/lock_details',
      name: 'lock_details',
      beforeEnter: onlyAccessAuth,
      components: {
        default: Lock_details
      }
    },
    {
      path: '/contract/:name',
      beforeEnter: onlyAccessAuth,
      components: {
        default: Contract
      }
    },
    {
      path: '/arrayFunc/:name/:func',
      beforeEnter: onlyAccessAuth,
      components: {
        default: ArrayFunc
      }
    },
    {
      path: '/other',
      beforeEnter: onlyAccessAuth,
      components: {
        default: Other
      }
    },
    {
      path: '/page_not_found',
      name: 'page_not_found',
      components: {
        default: ErrorPage
      }
    },
    { path: '/*', redirect: '/page_not_found'}
  ]
});
        // {
        //   path: "/about",
        //   name: "about",
        //   component: () =>
        //     import(/* webpackChunkName: "about" */ "./views/About.vue")
        // }
