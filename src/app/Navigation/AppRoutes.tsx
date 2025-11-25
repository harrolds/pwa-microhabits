import { Navigate, useRoutes } from 'react-router-dom'

import { routeMap } from './routeMap'

export default function AppRoutes() {
  return useRoutes([
    ...routeMap.map((route) => ({
      path: route.path,
      element: <route.component />
    })),
    { path: '*', element: <Navigate to="/" replace /> }
  ])
}

