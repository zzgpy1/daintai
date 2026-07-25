import { HomeIcon, HeartIcon, ClockIcon, MagnifyingGlassIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

export interface NavItem {
  name: string
  path: string
  label: string
  icon: any
  fillWhenActive?: boolean
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export const navigationItems: NavItem[] = [
  {
    name: 'Home',
    path: '/',
    label: 'nav.home',
    icon: HomeIcon,
    fillWhenActive: false
  },
  {
    name: 'Search',
    path: '/search',
    label: 'nav.search',
    icon: MagnifyingGlassIcon,
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
    name: 'History',
    path: '/history',
    label: 'nav.history',
    icon: ClockIcon,
    fillWhenActive: false
  },
  {
    name: 'Settings',
    path: '/settings',
    label: 'nav.settings',
    icon: Cog6ToothIcon,
    fillWhenActive: false,
    desktopOnly: true
  }
]

// 底部导航（移动端）
export const bottomNavItems: NavItem[] = navigationItems
  .filter(item => !item.desktopOnly)

// 顶部导航（桌面端）
export const topNavItems: NavItem[] = navigationItems
  .filter(item => !item.mobileOnly)
