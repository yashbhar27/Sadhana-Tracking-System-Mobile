import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider } from './contexts/AuthContext';
import { SystemProvider } from './contexts/SystemContext';
import { useAuth } from './contexts/AuthContext';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return null;
  }

  return <Slot />;
}

export default function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <ProtectedLayout />
      </SystemProvider>
    </AuthProvider>
  );
}