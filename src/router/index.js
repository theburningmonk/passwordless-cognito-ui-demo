import { createRouter, createWebHistory } from 'vue-router'
import OtpView from '../views/OtpView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/otp'
    },
    {
      path: '/otp',
      name: 'OTP',
      component: OtpView
    },
    {
      path: '/magic-link',
      name: 'MagicLink',
      component: () => import('../views/MagicLinkView.vue')
    }
  ]
})

export default router
