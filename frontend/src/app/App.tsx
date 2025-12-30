import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { routes } from './routes';
import { useAuth } from '../context/AuthContext';

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {routes.map((route) => {
          const Element = route.component;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  user ? (
                    <Element />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                ) : (
                  user && route.path === '/login' ? (
                    <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/dashboard'} replace />
                  ) : (
                    <Element />
                  )
                )
              }
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
