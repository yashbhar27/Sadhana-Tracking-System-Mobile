import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import toast from 'react-hot-toast';

interface EditDevoteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  devoteeId: string;
}

const EditDevoteeModal = ({ isOpen, onClose, devoteeId }: EditDevoteeModalProps) => {
  const [name, setName] = useState('');
  const [isResident, setIsResident] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { checkAdminPassword, user } = useAuth();
  const { devotees, updateDevotee } = useSystem();

  useEffect(() => {
    if (isOpen && devoteeId) {
      const devotee = devotees.find(d => d.id === devoteeId);
      if (devotee) {
        setName(devotee.name);
        setIsResident(devotee.is_resident);
      }
      
      // Check if already authenticated as admin
      if (user?.isAdmin) {
        setIsAuthenticating(false);
      } else {
        setIsAuthenticating(true);
        setAdminPassword('');
      }
    }
  }, [isOpen, devoteeId, devotees, user]);

  const authenticate = async () => {
    if (!adminPassword.trim()) {
      toast.error('Password is required');
      return;
    }

    const isAdmin = await checkAdminPassword(adminPassword);
    if (isAdmin) {
      setIsAuthenticating(false);
    } else {
      toast.error('Incorrect admin password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await updateDevotee(devoteeId, name, isResident);
      
      if (success) {
        toast.success('Devotee updated successfully');
        onClose();
      } else {
        toast.error('Failed to update devotee');
      }
    } catch (error) {
      console.error('Error updating devotee:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // If user is already verified as admin, skip password prompt
  const showPasswordScreen = isAuthenticating && !user?.isAdmin;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {showPasswordScreen ? 'Admin Authentication' : 'Edit Devotee'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {showPasswordScreen ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
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
                >
                  Authenticate
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="devotee-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Devotee Name
                </label>
                <input
                  type="text"
                  id="devotee-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Enter devotee name"
                  autoComplete="off"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resident Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="resident-status"
                      checked={isResident}
                      onChange={() => setIsResident(true)}
                      className="form-radio h-4 w-4 text-orange-500"
                    />
                    <span className="ml-2">Resident</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="resident-status"
                      checked={!isResident}
                      onChange={() => setIsResident(false)}
                      className="form-radio h-4 w-4 text-orange-500"
                    />
                    <span className="ml-2">Non-Resident</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="mr-2">Saving</span>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDevoteeModal;