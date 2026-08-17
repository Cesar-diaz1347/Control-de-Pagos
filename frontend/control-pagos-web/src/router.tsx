import { createBrowserRouter } from 'react-router-dom'

import App from './App'
import { DashboardPage } from './pages/DashboardPage'
import { DeudasListPage } from './pages/DeudasListPage'
import { DeudaFormPage } from './pages/DeudaFormPage'
import { DeudaDetailPage } from './pages/DeudaDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'deudas', element: <DeudasListPage /> },
      { path: 'deudas/nueva', element: <DeudaFormPage /> },
      { path: 'deudas/:id/editar', element: <DeudaFormPage /> },
      { path: 'deudas/:id', element: <DeudaDetailPage /> },
    ],
  },
])
