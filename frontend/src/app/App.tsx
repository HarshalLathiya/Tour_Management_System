import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { useAuth } from '../context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
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
                <Element />
              )
            }
          />
        );
      })}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;