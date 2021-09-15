import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import TRA from '../views/TRA.vue'
import THSR from '../views/THSR.vue'
import Bus from '../views/Bus.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '台灣安心旅遊通',
    }
  },
  {
    path: '/tra',
    name: 'TRA',
    component: TRA,
    meta: {
      title: '台灣安心旅遊通',
    }
  },
  {
    path: '/thsr',
    name: 'THSR',
    component: THSR,
    meta: {
      title: '台灣安心旅遊通',
    }
  },
  {
    path: '/bus',
    name: 'Bus',
    component: Bus,
    meta: {
      title: '台灣安心旅遊通',
    }
  },
 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) =>{
  document.title = `${to.meta.title}`
  next()
})

export default router
