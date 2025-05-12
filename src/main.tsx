import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { SystemProvider } from './contexts/SystemContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SystemProvider>
          <App />
          <Toaster position="top-right" />
        </SystemProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);