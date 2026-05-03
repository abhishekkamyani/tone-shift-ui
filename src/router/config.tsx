import type { RouteObject } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import LandingPage from '@/pages/landing/page';
import DashboardPage from '@/pages/dashboard/page';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard/:chatId',
    element: <DashboardPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
