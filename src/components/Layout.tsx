import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';

const Layout = () => {
  const { user } = useAuth();
  const { system } = useSystem();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-orange-500 text-white shadow-md">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            {system ? system.name : 'Sadhana Tracking System'}
          </h1>
          <p className="text-sm md:text-base text-orange-100">
            Daily Devotional Activities Tracking System
          </p>
        </div>
        <Navbar />
      </header>
      
      <main className="flex-grow py-6 px-4 container mx-auto max-w-6xl">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            {user ? `Authenticated with code: ${user.authCode}` : 'Sadhana Tracking System'} 
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;