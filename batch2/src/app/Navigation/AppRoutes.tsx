import { lazy } from 'react'
import { useRoutes } from 'react-router-dom'

const Home = lazy(()=> import('../Screens/Home'))

export default function AppRoutes(){
  return useRoutes([
    { path:'/', element:<Home/> },
    { path:'*', element:<Home/> }
  ])
}
