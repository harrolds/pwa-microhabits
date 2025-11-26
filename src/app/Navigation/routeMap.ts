import { lazy } from 'react'

import { preloadRoute } from './preloadRoute'
import type { RouteDef } from './types'

const homeLoader = () => import('@app/Screens/Home')
const exampleLoader = () => import('@app/Screens/Example')

const Home = lazy(homeLoader)
const Example = lazy(exampleLoader)

export const routeMap: RouteDef[] = [
  {
    path: '/',
    component: Home,
    preload: () => preloadRoute(homeLoader)
  },
  {
    path: '/example',
    component: Example,
    preload: () => preloadRoute(exampleLoader)
  }
]

