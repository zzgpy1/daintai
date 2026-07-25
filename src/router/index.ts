import { createRouter, createWebHistory } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: {
        title: 'home.title',
        keepAlive: true
      }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue'),
      meta: {
        title: 'nav.search',
        keepAlive: true
      }
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/Favorites.vue'),
      meta: {
        title: 'nav.favorites',
        keepAlive: true
      }
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/History.vue'),
      meta: {
        title: 'nav.history',
        keepAlive: true
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: {
        title: 'nav.settings'
      }
    },
    {
      path: '/station/:uuid',
      name: 'StationDetail',
      component: () => import('@/views/StationDetail.vue'),
      meta: {
        title: 'station.detail'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: 'common.notFound'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  const languageStore = useLanguageStore()
  const titleKey = to.meta.title as string
  
  if (titleKey) {
    document.title = `${languageStore.t(titleKey)} - ${languageStore.t('home.title')}`
  }
  
  next()
})

export default router
