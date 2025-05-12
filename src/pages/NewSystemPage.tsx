import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

const NewSystemPage = () => {
  const [masterKey, setMasterKey] = useState('');
  const [systemName, setSystemName] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (masterKey !== 'SALWGP108') {
      toast.error('Invalid master key');
      return;
    }

    // Validate system name
    if (!systemName.trim()) {
      toast.error('System name is required');
      return;
    }

    // Validate auth code format
    if (!authCode.trim()) {
      toast.error('Authentication code is required');
      return;
    }

    if (!/^[A-Z0-9]{6,12}$/.test(authCode)) {
      toast.error('Authentication code must be 6-12 characters long and contain only uppercase letters and numbers');
      return;
    }

    // Validate admin name
    if (!adminName.trim()) {
      toast.error('Admin name is required');
      return;
    }

    // Validate passwords
    if (!adminPassword.trim()) {
      toast.error('Admin password is required');
      return;
    }
    
    if (adminPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate security question and answer
    if (!securityQuestion.trim()) {
      toast.error('Security question is required');
      return;
    }

    if (!securityAnswer.trim()) {
      toast.error('Security answer is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if auth code already exists
      const { data: existingSystem, error: checkError } = await supabase
        .from('systems')
        .select('id')
        .eq('auth_code', authCode)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking auth code:', checkError);
        toast.error('An error occurred while checking the authentication code');
        setIsSubmitting(false);
        return;
      }

      if (existingSystem) {
        toast.error('This authentication code is already in use');
        setIsSubmitting(false);
        return;
      }

      // Generate a new random master key
      const newMasterKey = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      // Create new system
      const { data, error: createError } = await supabase
        .from('systems')
        .insert([{
          name: systemName,
          auth_code: authCode,
          admin_name: adminName,
          admin_password: adminPassword,
          security_question: securityQuestion,
          security_answer: securityAnswer,
          master_key: newMasterKey
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating system:', createError);
        toast.error('Failed to create tracking system');
        return;
      }
      
      if (data) {
        toast.success('Tracking system created successfully!');
        toast.success(`Your authentication code is: ${authCode}`);
        toast.success('The master key for this system will be available in the super admin panel');
        
        // Navigate to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('System creation error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-4">
            <Link to="/login" className="text-orange-600 hover:text-orange-700 inline-flex items-center">
              <ArrowLeft size={16} className="mr-1" />
              Back to Login
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-orange-500 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-gray-800">New Tracking System</h1>
            <p className="mt-2 text-gray-600">
              Create your own sadhana tracking system for your community
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="master-key" className="block text-sm font-medium text-gray-700 mb-1">
                Master Key
              </label>
              <input
                id="master-key"
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                className="input"
                placeholder="Enter master key"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="system-name" className="block text-sm font-medium text-gray-700 mb-1">
                System Name
              </label>
              <input
                id="system-name"
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="input"
                placeholder="Enter your system name"
                autoComplete="off"
              />
            </div>

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
                placeholder="Enter 6-12 character code (e.g., TEMPLE123)"
                autoComplete="off"
                maxLength={12}
              />
              <p className="mt-1 text-sm text-gray-500">
                Use 6-12 uppercase letters and numbers only
              </p>
            </div>

            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name
              </label>
              <input
                id="admin-name"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="input"
                placeholder="Enter admin name"
                autoComplete="off"
              />
            </div>
            
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input"
                placeholder="Create an admin password"
                autoComplete="new-password"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="security-question" className="block text-sm font-medium text-gray-700 mb-1">
                Security Question
              </label>
              <input
                id="security-question"
                type="text"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="input"
                placeholder="Enter a security question"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="security-answer" className="block text-sm font-medium text-gray-700 mb-1">
                Security Answer
              </label>
              <input
                id="security-answer"
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="input"
                placeholder="Enter your answer"
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Creating System...
                </span>
              ) : (
                'Create Tracking System'
              )}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md text-sm text-blue-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Master key is required to create a new system</li>
              <li>Choose a memorable authentication code</li>
              <li>Keep your admin password and security details safe</li>
              <li>Each tracking system is completely separate from others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSystemPage;