import { ReactElement } from 'react';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Settings from '../pages/Settings';
import Shelf from "../pages/Shelf";

export interface RouteConfig {
  path: string;
  label: string;
  element: ReactElement;
}

export const routes: RouteConfig[] = [
  { path: '/Shelf', label: 'Полка', element: <Shelf /> },
  { path: '/', label: 'Dashboard', element: <Dashboard /> },
  { path: '/orders', label: 'Orders', element: <Orders /> },
  { path: '/settings', label: 'Settings', element: <Settings /> },
];
