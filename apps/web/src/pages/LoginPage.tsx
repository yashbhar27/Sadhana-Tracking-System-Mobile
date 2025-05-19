import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authCode.trim()) {
      toast.error('Authentication code is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(authCode);
      
      if (success) {
        toast.success('Login successful');
        navigate('/');
      } else {
        toast.error('Invalid authentication code');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <KeyRound className="h-12 w-12 text-orange-500 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-gray-800">Sadhana Tracking System</h1>
            <p className="mt-2 text-gray-600">Enter your authentication code to access your tracking system</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="auth-code" className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Code
              </label>
              <input
                id="auth-code"
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                className="input"
                placeholder="Enter your authentication code"
                autoComplete="off"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn size={18} className="mr-2" />
                  Login
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need a new tracking system?{' '}
              <Link to="/new-system" className="text-orange-600 hover:text-orange-700 font-medium">
                Request one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;