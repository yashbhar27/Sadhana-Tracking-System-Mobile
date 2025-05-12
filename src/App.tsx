import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DevoteeReportPage from './pages/DevoteeReportPage';
import OverallSummaryPage from './pages/OverallSummaryPage';
import AllEntriesPage from './pages/AllEntriesPage';
import SettingsPage from './pages/SettingsPage';
import FourOhFourPage from './pages/FourOhFourPage';
import NewSystemPage from './pages/NewSystemPage';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth status to be determined
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-orange-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </div>
          <p className="mt-2 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/new-system" 
        element={<NewSystemPage />} 
      />
      <Route element={<Layout />}>
        <Route 
          path="/" 
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/devotee-report" 
          element={isAuthenticated ? <DevoteeReportPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/overall-summary" 
          element={isAuthenticated ? <OverallSummaryPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/all-entries" 
          element={isAuthenticated ? <AllEntriesPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/settings" 
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} 
        />
      </Route>
      <Route path="*" element={<FourOhFourPage />} />
    </Routes>
  );
}

export default App;