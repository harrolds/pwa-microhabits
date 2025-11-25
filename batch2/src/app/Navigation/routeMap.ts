import { RouteDef } from './types'
import { preloadRoute } from './preloadRoute'

const Home = ()=> import('../Screens/Home')

export const routeMap:RouteDef[] = [
  {
    path:'/',
    component:()=> (await Home()).default,
    preload:()=> preloadRoute(Home)
  }
]
