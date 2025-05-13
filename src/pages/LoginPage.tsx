import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../lib/supabase';

interface SystemInfo {
  id: string;
  name: string;
  auth_code: string;
  admin_password: string;
  admin_name: string | null;
  master_key: string;
  devotees: { name: string; is_resident: boolean }[];
}

const LoginPage = () => {
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [superAdminKey, setSuperAdminKey] = useState('');
  const [systems, setSystems] = useState<SystemInfo[]>([]);
  const [editingSystem, setEditingSystem] = useState<string | null>(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
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

  const handleSuperAdminLogin = async () => {
    if (superAdminKey !== 'SALWGP108') {
      toast.error('Invalid super admin key');
      return;
    }

    setIsLoading(true);
    try {
      const { data: systemsData, error: systemsError } = await supabase
        .from('systems')
        .select(`
          id,
          name,
          auth_code,
          admin_password,
          admin_name,
          master_key,
          devotees (
            name,
            is_resident
          )
        `)
        .order('created_at', { ascending: false });

      if (systemsError) {
        console.error('Error fetching systems:', systemsError);
        throw systemsError;
      }

      if (!systemsData) {
        throw new Error('No data received from Supabase');
      }

      setSystems(systemsData);
      toast.success('Systems data loaded successfully');
      
    } catch (error) {
      console.error('Error fetching systems:', error);
      toast.error('Failed to fetch systems data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdminName = async (systemId: string) => {
    if (!newAdminName.trim()) {
      toast.error('Admin name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('systems')
        .update({ admin_name: newAdminName })
        .eq('id', systemId);

      if (error) throw error;

      toast.success('Admin name updated successfully');
      setEditingSystem(null);
      setNewAdminName('');
      
      // Refresh systems list
      const { data } = await supabase
        .from('systems')
        .select(`
          id,
          name,
          auth_code,
          admin_password,
          admin_name,
          master_key,
          devotees (
            name,
            is_resident
          )
        `)
        .order('created_at', { ascending: false });
      setSystems(data || []);
    } catch (error) {
      console.error('Error updating admin name:', error);
      toast.error('Failed to update admin name');
    }
  };

  const handleDeleteSystem = async (systemId: string) => {
    if (deleteConfirmPassword !== 'SALWGP108') {
      toast.error('Invalid super admin password');
      return;
    }

    try {
      const { error } = await supabase
        .from('systems')
        .delete()
        .eq('id', systemId);

      if (error) throw error;

      toast.success('System deleted successfully');
      setSystems(systems.filter(s => s.id !== systemId));
      setConfirmDelete(null);
      setDeleteConfirmPassword('');
    } catch (error) {
      console.error('Error deleting system:', error);
      toast.error('Failed to delete system');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center p-4">
      <button
        onClick={() => setShowSuperAdmin(true)}
        className="absolute top-4 right-4 text-white opacity-20 hover:opacity-100 transition-opacity"
      >
        <Shield size={24} />
      </button>

      {showSuperAdmin ? (
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Super Admin Panel</h1>
              <button
                onClick={() => setShowSuperAdmin(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Login
              </button>
            </div>

            {superAdminKey !== 'SALWGP108' ? (
              <div className="max-w-md mx-auto">
                <input
                  type="password"
                  value={superAdminKey}
                  onChange={(e) => setSuperAdminKey(e.target.value)}
                  className="input mb-4"
                  placeholder="Enter super admin key"
                />
                <button
                  onClick={handleSuperAdminLogin}
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Loading Systems...
                    </span>
                  ) : (
                    'Access Panel'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>System Name</th>
                        <th>Auth Code</th>
                        <th>Admin Password</th>
                        <th>Admin Name</th>
                        <th>Master Key</th>
                        <th>Devotees</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systems.map((system) => (
                        <tr key={system.id}>
                          <td>{system.name}</td>
                          <td>{system.auth_code}</td>
                          <td>{system.admin_password}</td>
                          <td>
                            {editingSystem === system.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newAdminName}
                                  onChange={(e) => setNewAdminName(e.target.value)}
                                  className="input input-sm"
                                  placeholder="New admin name"
                                />
                                <button
                                  onClick={() => handleUpdateAdminName(system.id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSystem(null);
                                    setNewAdminName('');
                                  }}
                                  className="btn btn-sm btn-outline"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span>{system.admin_name || 'Not set'}</span>
                            )}
                          </td>
                          <td>{system.master_key}</td>
                          <td>
                            <details className="cursor-pointer">
                              <summary>{system.devotees?.length || 0} devotees</summary>
                              <ul className="mt-2 text-sm">
                                {system.devotees?.map((devotee, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <span>{devotee.name}</span>
                                    <span className={`text-xs px-1 rounded ${
                                      devotee.is_resident 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {devotee.is_resident ? 'R' : 'NR'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingSystem(system.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit Admin
                              </button>
                              {confirmDelete === system.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="password"
                                    value={deleteConfirmPassword}
                                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                                    placeholder="Enter super admin key"
                                    className="input input-sm w-40"
                                  />
                                  <button
                                    onClick={() => handleDeleteSystem(system.id)}
                                    className="btn btn-sm btn-error"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmDelete(null);
                                      setDeleteConfirmPassword('');
                                    }}
                                    className="btn btn-sm btn-outline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(system.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default LoginPage;