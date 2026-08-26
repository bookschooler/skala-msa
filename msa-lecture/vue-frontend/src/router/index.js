import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/announcements', name: 'AnnouncementList', component: () => import('@/views/AnnouncementListView.vue') },
  { path: '/announcements/:id(\\d+)', name: 'AnnouncementDetail', component: () => import('@/views/AnnouncementDetailView.vue') },
  {
    path: '/apply/:id(\\d+)',
    name: 'ApplicationWizard',
    component: () => import('@/views/ApplicationWizardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/applications',
    name: 'MyApplications',
    component: () => import('@/views/MyApplicationsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: () => import('@/views/MyPageView.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { guestOnly: true } },
  { path: '/callback', name: 'Callback', component: () => import('@/views/CallbackView.vue') },
  { path: '/courses', redirect: '/announcements' },
  { path: '/courses/:id(\\d+)', redirect: to => `/announcements/${to.params.id}` },
  { path: '/enrollments', redirect: '/applications' },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(to => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'Home' }
})

export default router
