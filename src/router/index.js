import { createRouter, createWebHistory } from 'vue-router'
import RootView from '../views/RootView.vue'
import AuthMiddleware from './auth.guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Root',
      component: RootView
    }
  ]
})

router.beforeEach(AuthMiddleware)

export default router
