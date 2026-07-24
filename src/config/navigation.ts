import { HomeIcon, ClockIcon, HeartIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

export const navigationConfig = [
  {
    name: 'Home',
    path: '/',
    label: 'nav.home',
    icon: HomeIcon,
    fillWhenActive: false
  },
  {
    name: 'History',
    path: '/history',
    label: 'nav.history',
    icon: ClockIcon,
    fillWhenActive: false
  },
  {
    name: 'Favorites',
    path: '/favorites',
    label: 'nav.favorites',
    icon: HeartIcon,
    fillWhenActive: true
  },
  {
    name: 'Settings',
    path: '/settings',
    label: 'nav.settings',
    icon: Cog6ToothIcon,
    fillWhenActive: false
  }
]
