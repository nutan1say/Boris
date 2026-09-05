import { useAuth } from '@clerk/react';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0c0a09',
          color: '#f5f0e8',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
