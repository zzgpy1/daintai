import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
    { path: '/search', name: 'Search', component: () => import('@/views/Search.vue') },
    { path: '/history', name: 'History', component: () => import('@/views/History.vue') },
    { path: '/favorites', name: 'Favorites', component: () => import('@/views/Favorites.vue') },
    { path: '/settings', name: 'Settings', component: () => import('@/views/Settings.vue') },
    { path: '/station/:uuid', name: 'StationDetail', component: () => import('@/views/StationDetail.vue') }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 全球电台`
  }
  next()
})

export default router
