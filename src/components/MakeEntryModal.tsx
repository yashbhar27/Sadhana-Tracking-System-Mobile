import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface MakeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MakeEntryModal = ({ isOpen, onClose }: MakeEntryModalProps) => {
  const [devoteeId, setDevoteeId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mangla, setMangla] = useState<number>(0);
  const [japa, setJapa] = useState<number>(0);
  const [lecture, setLecture] = useState<number>(0);
  const [templeVisit, setTempleVisit] = useState(false);
  const [templeVisitType, setTempleVisitType] = useState<'none' | 'normal' | 'mangla' | 'japa' | 'lecture'>('none');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { checkAdminPassword, user } = useAuth();
  const { devotees, addEntry } = useSystem();

  useEffect(() => {
    // Reset form on open
    if (isOpen) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setMangla(0);
      setJapa(0);
      setLecture(0);
      setTempleVisit(false);
      setTempleVisitType('none');
      
      // Check if already authenticated as admin
      if (user?.isAdmin) {
        setIsAuthenticating(false);
      } else {
        setIsAuthenticating(true);
        setAdminPassword('');
      }
    }
  }, [isOpen, user]);

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
    
    if (!devoteeId) {
      toast.error('Please select a devotee');
      return;
    }
    
    if (!date) {
      toast.error('Date is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await addEntry(
        devoteeId, 
        date, 
        mangla, 
        japa, 
        lecture, 
        templeVisit,
        templeVisitType
      );
      
      if (success) {
        toast.success('Entry added successfully');
        // Reset form fields except devotee - this makes adding multiple entries easier
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setMangla(0);
        setJapa(0);
        setLecture(0);
        setTempleVisit(false);
        setTempleVisitType('none');
      } else {
        toast.error('Failed to add entry');
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // If user is already verified as admin, skip password prompt
  const showPasswordScreen = isAuthenticating && !user?.isAdmin;

  // Sort devotees: residents first, then non-residents
  const sortedDevotees = [...devotees].sort((a, b) => {
    if (a.is_resident === b.is_resident) {
      return a.name.localeCompare(b.name);
    }
    return a.is_resident ? -1 : 1;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {showPasswordScreen ? 'Admin Authentication' : 'Make Today\'s Entry'}
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
                <label htmlFor="devotee-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Devotee
                </label>
                <select
                  id="devotee-select"
                  value={devoteeId}
                  onChange={(e) => setDevoteeId(e.target.value)}
                  className="select"
                >
                  <option value="">Select a devotee</option>
                  {sortedDevotees.map((devotee) => (
                    <option key={devotee.id} value={devotee.id}>
                      {devotee.name} {devotee.is_resident ? '(Resident)' : '(Non-Resident)'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="entry-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="mangla" className="block text-sm font-medium text-gray-700 mb-1">
                    Mangla Arti
                  </label>
                  <select
                    id="mangla"
                    value={mangla}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setMangla(value);
                      if (e.target.value.includes('T')) {
                        setTempleVisit(true);
                        setTempleVisitType('mangla');
                      } else if (templeVisitType === 'mangla') {
                        setTempleVisitType('none');
                        setTempleVisit(false);
                      }
                    }}
                    className="select"
                  >
                    <option value={0}>Absent (0)</option>
                    <option value={0.5}>Partial (0.5)</option>
                    <option value={1}>Present (1)</option>
                    <option value="0T">Temple Absent (0)</option>
                    <option value="0.5T">Temple Partial (0.5)</option>
                    <option value="1T">Temple Present (1)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="japa" className="block text-sm font-medium text-gray-700 mb-1">
                    Japa
                  </label>
                  <select
                    id="japa"
                    value={japa}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setJapa(value);
                      if (e.target.value.includes('T')) {
                        setTempleVisit(true);
                        setTempleVisitType('japa');
                      } else if (templeVisitType === 'japa') {
                        setTempleVisitType('none');
                        setTempleVisit(false);
                      }
                    }}
                    className="select"
                  >
                    <option value={0}>Absent (0)</option>
                    <option value={0.5}>Partial (0.5)</option>
                    <option value={1}>Present (1)</option>
                    <option value="0T">Temple Absent (0)</option>
                    <option value="0.5T">Temple Partial (0.5)</option>
                    <option value="1T">Temple Present (1)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="lecture" className="block text-sm font-medium text-gray-700 mb-1">
                    Lecture
                  </label>
                  <select
                    id="lecture"
                    value={lecture}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setLecture(value);
                      if (e.target.value.includes('T')) {
                        setTempleVisit(true);
                        setTempleVisitType('lecture');
                      } else if (templeVisitType === 'lecture') {
                        setTempleVisitType('none');
                        setTempleVisit(false);
                      }
                    }}
                    className="select"
                  >
                    <option value={0}>Absent (0)</option>
                    <option value={0.5}>Partial (0.5)</option>
                    <option value={1}>Present (1)</option>
                    <option value="0T">Temple Absent (0)</option>
                    <option value="0.5T">Temple Partial (0.5)</option>
                    <option value="1T">Temple Present (1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={templeVisit}
                    onChange={(e) => {
                      setTempleVisit(e.target.checked);
                      if (e.target.checked) {
                        setTempleVisitType('normal');
                      } else if (templeVisitType === 'normal') {
                        setTempleVisitType('none');
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Temple Visit</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Close
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
                      Save Entry
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

export default MakeEntryModal;