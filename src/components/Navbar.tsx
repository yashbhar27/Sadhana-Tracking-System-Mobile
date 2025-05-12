import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, BarChart2, List, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/devotee-report', label: 'Devotee Report', icon: <User size={18} /> },
    { to: '/overall-summary', label: 'Overall Summary', icon: <BarChart2 size={18} /> },
    { to: '/all-entries', label: 'All Entries', icon: <List size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mobile navigation
  if (isMobile) {
    return (
      <div className="bg-orange-600">
        <div className="container mx-auto flex justify-between items-center p-2">
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center justify-center p-2 rounded-full ${
                    isActive ? 'bg-orange-700 text-white' : 'text-orange-100 hover:bg-orange-700'
                  }`
                }
              >
                {item.icon}
              </NavLink>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-full text-orange-100 hover:bg-orange-700"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Desktop navigation
  return (
    <div className="bg-orange-600">
      <div className="container mx-auto flex space-x-4 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive ? 'bg-orange-700 text-white' : 'text-orange-50 hover:bg-orange-700 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center px-3 py-2 rounded-md text-orange-50 hover:bg-orange-700 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;