import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import { Key, ShieldQuestion, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, checkAdminPassword } = useAuth();
  const { system, updateSystemSettings } = useSystem();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  
  // System name change
  const [newSystemName, setNewSystemName] = useState('');
  const [isChangingSystemName, setIsChangingSystemName] = useState(false);
  
  // Auth code change
  const [newAuthCode, setNewAuthCode] = useState('');
  const [isChangingAuthCode, setIsChangingAuthCode] = useState(false);
  
  // Admin password change
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);
  
  // Security settings
  const [newSecurityQuestion, setNewSecurityQuestion] = useState('');
  const [newSecurityAnswer, setNewSecurityAnswer] = useState('');
  const [isChangingSecuritySettings, setIsChangingSecuritySettings] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If the user is already authenticated as admin, skip authentication
    if (user?.isAdmin) {
      setIsAuthenticated(true);
    }
    
    // Set security question if available
    if (system?.security_question) {
      setNewSecurityQuestion(system.security_question);
    }
  }, [user, system]);
  
  const authenticate = async () => {
    if (!currentPassword.trim()) {
      toast.error('Password is required');
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      const isAdmin = await checkAdminPassword(currentPassword);
      if (isAdmin) {
        setIsAuthenticated(true);
        setCurrentPassword('');
      } else {
        toast.error('Incorrect admin password');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleSystemNameChange = async () => {
    if (!newSystemName.trim()) {
      toast.error('System name is required');
      return;
    }
    
    if (!currentPassword) {
      toast.error('Please enter current admin password to confirm changes');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isAdmin = await checkAdminPassword(currentPassword);
      if (!isAdmin) {
        toast.error('Incorrect admin password');
        return;
      }
      
      const success = await updateSystemSettings({ name: newSystemName });
      
      if (success) {
        toast.success('System name updated successfully');
        setNewSystemName('');
        setCurrentPassword('');
        setIsChangingSystemName(false);
      } else {
        toast.error('Failed to update system name');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAuthCodeChange = async () => {
    if (!newAuthCode.trim()) {
      toast.error('Authentication code is required');
      return;
    }
    
    if (!/^[A-Z0-9]{6,12}$/.test(newAuthCode)) {
      toast.error('Authentication code must be 6-12 characters long and contain only uppercase letters and numbers');
      return;
    }
    
    if (!currentPassword) {
      toast.error('Please enter current admin password to confirm changes');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isAdmin = await checkAdminPassword(currentPassword);
      if (!isAdmin) {
        toast.error('Incorrect admin password');
        return;
      }
      
      const success = await updateSystemSettings({ auth_code: newAuthCode });
      
      if (success) {
        toast.success('Authentication code updated successfully');
        setNewAuthCode('');
        setCurrentPassword('');
        setIsChangingAuthCode(false);
      } else {
        toast.error('Failed to update authentication code');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAdminPasswordChange = async () => {
    if (!newAdminPassword.trim()) {
      toast.error('New admin password is required');
      return;
    }
    
    if (newAdminPassword !== confirmAdminPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!currentPassword) {
      toast.error('Please enter current admin password to confirm changes');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isAdmin = await checkAdminPassword(currentPassword);
      if (!isAdmin) {
        toast.error('Incorrect admin password');
        return;
      }
      
      const success = await updateSystemSettings({ admin_password: newAdminPassword });
      
      if (success) {
        toast.success('Admin password updated successfully');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        setCurrentPassword('');
        setIsChangingAdminPassword(false);
      } else {
        toast.error('Failed to update admin password');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSecuritySettingsChange = async () => {
    if (newSecurityQuestion.trim() && !newSecurityAnswer.trim()) {
      toast.error('Security answer is required if you set a security question');
      return;
    }
    
    if (!currentPassword) {
      toast.error('Please enter current admin password to confirm changes');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isAdmin = await checkAdminPassword(currentPassword);
      if (!isAdmin) {
        toast.error('Incorrect admin password');
        return;
      }
      
      const success = await updateSystemSettings({
        security_question: newSecurityQuestion.trim() || null,
        security_answer: newSecurityAnswer.trim() || null
      });
      
      if (success) {
        toast.success('Security settings updated successfully');
        setNewSecurityAnswer('');
        setCurrentPassword('');
        setIsChangingSecuritySettings(false);
      } else {
        toast.error('Failed to update security settings');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {!isAuthenticated ? (
        <div className="card p-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Admin Authentication Required</h2>
          
          <div className="max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input"
                  placeholder="Enter admin password"
                  autoComplete="off"
                />
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={authenticate}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <span className="flex items-center">
                      <span className="mr-2">Authenticating</span>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    </span>
                  ) : (
                    'Authenticate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-6">
          {/* System Name Settings */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">System Name</h2>
              <button
                onClick={() => setIsChangingSystemName(!isChangingSystemName)}
                className="text-orange-600 hover:text-orange-700"
              >
                {isChangingSystemName ? 'Cancel' : 'Change'}
              </button>
            </div>
            
            {isChangingSystemName ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New System Name
                  </label>
                  <input
                    type="text"
                    value={newSystemName}
                    onChange={(e) => setNewSystemName(e.target.value)}
                    className="input"
                    placeholder="Enter new system name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm with Admin Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="Enter current admin password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSystemNameChange}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{system?.name}</p>
            )}
          </div>
          
          {/* Authentication Code Settings */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Authentication Code</h2>
              <button
                onClick={() => setIsChangingAuthCode(!isChangingAuthCode)}
                className="text-orange-600 hover:text-orange-700"
              >
                {isChangingAuthCode ? 'Cancel' : 'Change'}
              </button>
            </div>
            
            {isChangingAuthCode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Authentication Code
                  </label>
                  <input
                    type="text"
                    value={newAuthCode}
                    onChange={(e) => setNewAuthCode(e.target.value.toUpperCase())}
                    className="input"
                    placeholder="Enter new authentication code"
                    maxLength={12}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Use 6-12 uppercase letters and numbers only
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm with Admin Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="Enter current admin password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAuthCodeChange}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{system?.auth_code}</p>
            )}
          </div>
          
          {/* Admin Password Settings */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Admin Password</h2>
              <button
                onClick={() => setIsChangingAdminPassword(!isChangingAdminPassword)}
                className="text-orange-600 hover:text-orange-700"
              >
                {isChangingAdminPassword ? 'Cancel' : 'Change'}
              </button>
            </div>
            
            {isChangingAdminPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="input"
                    placeholder="Enter new admin password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    className="input"
                    placeholder="Confirm new admin password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Admin Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="Enter current admin password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAdminPasswordChange}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">••••••••</p>
            )}
          </div>
          
          {/* Security Settings */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
              <button
                onClick={() => setIsChangingSecuritySettings(!isChangingSecuritySettings)}
                className="text-orange-600 hover:text-orange-700"
              >
                {isChangingSecuritySettings ? 'Cancel' : 'Change'}
              </button>
            </div>
            
            {isChangingSecuritySettings ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Question
                  </label>
                  <input
                    type="text"
                    value={newSecurityQuestion}
                    onChange={(e) => setNewSecurityQuestion(e.target.value)}
                    className="input"
                    placeholder="Enter security question"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Answer
                  </label>
                  <input
                    type="text"
                    value={newSecurityAnswer}
                    onChange={(e) => setNewSecurityAnswer(e.target.value)}
                    className="input"
                    placeholder="Enter security answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm with Admin Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="Enter current admin password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSecuritySettingsChange}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">
                  Security Question: {system?.security_question || 'Not set'}
                </p>
                <p className="text-gray-600">
                  Security Answer: {system?.security_answer ? '••••••••' : 'Not set'}
                </p>
              </div>
            )}
          </div>
          
          {/* Admin Information */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Admin Information</h2>
              <Lock size={20} className="text-gray-400" />
            </div>
            
            <p className="text-gray-600">
              Admin Name: {system?.admin_name || 'Not set'} 
              <span className="text-sm text-gray-400 ml-2">(Can only be changed by super admin)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;