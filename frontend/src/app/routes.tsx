import { lazy } from 'react';

// Lazy load pages for better performance
const Login = lazy(() => import('../pages/auth/Login'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const OrganizerDashboard = lazy(() => import('../pages/dashboard/OrganizerDashboard'));
const ParticipantDashboard = lazy(() => import('../pages/dashboard/ParticipantDashboard'));
const TourList = lazy(() => import('../pages/tours/TourList'));
const CreateTour = lazy(() => import('../pages/tours/CreateTour'));
const UserList = lazy(() => import('../pages/users/UserList'));

export const routes = [
  {
    path: '/login',
    component: Login,
    protected: false,
  },
  {
    path: '/admin',
    component: AdminDashboard,
    protected: true,
  },
  {
    path: '/organizer',
    component: OrganizerDashboard,
    protected: true,
  },
  {
    path: '/dashboard',
    component: ParticipantDashboard,
    protected: true,
  },
  {
    path: '/tours',
    component: TourList,
    protected: true,
  },
  {
    path: '/tours/create',
    component: CreateTour,
    protected: true,
  },
  {
    path: '/users',
    component: UserList,
    protected: true,
  },
  {
    path: '/',
    component: ParticipantDashboard,
    protected: true,
  },
];