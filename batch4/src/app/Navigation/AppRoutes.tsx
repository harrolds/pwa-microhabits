import { lazy } from 'react'
import { useRoutes } from 'react-router-dom'

const Home = lazy(()=> import('../Screens/Home'))

// Example Lazy Module Screen loader
const Example = lazy(()=> import('../Screens/Example'))

export default function AppRoutes(){
  return useRoutes([
    { path:'/', element:<Home/> },
    { path:'/example', element:<Example/> },
    { path:'*', element:<Home/> }
  ])
}
