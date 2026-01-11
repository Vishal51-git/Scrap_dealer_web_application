import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'history',
        name: 'BillingHistory',
        component: () => import('../views/BillingHistory.vue'),
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/Inventory.vue'),
      },
      {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/Settings.vue'), 
      },
      {
          path: 'team',
          name: 'Team Access',
          component: () => import('../views/TeamAccess.vue'),
      },
      {
          path: 'dealers',
          name: 'Dealers',
          component: () => import('../views/Dealers.vue'),
      },
      {
          path: 'super-admin',
          name: 'SuperAdmin',
          component: () => import('../views/SuperAdmin.vue'),
      },
      {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue'),
      },
      {
          path: 'billing/new',
          name: 'NewBilling',
          component: () => import('../views/NewBillingEntry.vue'),
      },
    ],
  },
  {
      path: '/register',
      name: 'Registration',
      component: () => import('../views/Registration.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const publicPages = ['Registration', 'Login', 'ForgotPassword']
  const authRequired = !publicPages.includes(to.name as string)

  if (authRequired && !authStore.isAuthenticated) {
    next({ name: 'Registration' })
  } else if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Registration')) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
