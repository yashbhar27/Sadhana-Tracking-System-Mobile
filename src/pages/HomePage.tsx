import { useState } from 'react';
import { UserPlus, ClipboardList, Users } from 'lucide-react';
import AddDevoteeModal from '../components/AddDevoteeModal';
import MakeEntryModal from '../components/MakeEntryModal';
import EditDevoteeModal from '../components/EditDevoteeModal';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [showAddDevoteeModal, setShowAddDevoteeModal] = useState(false);
  const [showMakeEntryModal, setShowMakeEntryModal] = useState(false);
  const [showEditDevoteeModal, setShowEditDevoteeModal] = useState(false);
  const [selectedDevoteeId, setSelectedDevoteeId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  
  const { system, devotees, deleteDevotee } = useSystem();
  const { checkAdminPassword, user } = useAuth();

  // Sort devotees: residents first, then non-residents, alphabetically within each group
  const sortedDevotees = [...devotees].sort((a, b) => {
    if (a.is_resident === b.is_resident) {
      return a.name.localeCompare(b.name);
    }
    return a.is_resident ? -1 : 1;
  });

  const handleEditDevotee = (id: string) => {
    setSelectedDevoteeId(id);
    setShowEditDevoteeModal(true);
  };

  const handleDeleteDevotee = async (id: string) => {
    // If already admin, delete immediately
    if (user?.isAdmin) {
      confirmDelete(id);
      return;
    }
    
    // Otherwise prompt for password
    const password = prompt('Enter admin password to delete this devotee:');
    if (!password) return;
    
    setIsCheckingPassword(true);
    
    try {
      const isAdmin = await checkAdminPassword(password);
      if (isAdmin) {
        confirmDelete(id);
      } else {
        toast.error('Incorrect admin password');
      }
    } catch (error) {
      console.error('Error checking admin password:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const confirmDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this devotee? This action cannot be undone.')) {
      try {
        const success = await deleteDevotee(id);
        if (success) {
          toast.success('Devotee deleted successfully');
        } else {
          toast.error('Failed to delete devotee');
        }
      } catch (error) {
        console.error('Error deleting devotee:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      
      <div className="card mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sadhana Tracking System</h2>
        <p className="text-gray-600 mb-6">
          Track daily devotional activities including Mangla Arti, Japa, and Lecture attendance.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setShowAddDevoteeModal(true)}
            className="btn btn-primary h-16"
          >
            <UserPlus className="mr-2" size={20} />
            Add New Devotee
          </button>
          
          <button
            onClick={() => setShowMakeEntryModal(true)}
            className="btn btn-secondary h-16"
          >
            <ClipboardList className="mr-2" size={20} />
            Make Today's Entry
          </button>
        </div>
      </div>
      
      <div className="card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            <Users className="inline mr-2" size={20} />
            Registered Devotees
          </h2>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Total: {devotees.length}
          </span>
        </div>
        
        {sortedDevotees.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDevotees.map((devotee) => (
                  <tr key={devotee.id}>
                    <td className="font-medium">{devotee.name}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        devotee.is_resident 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {devotee.is_resident ? 'Resident' : 'Non-Resident'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleEditDevotee(devotee.id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        disabled={isCheckingPassword}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDevotee(devotee.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isCheckingPassword}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-gray-500">No devotees registered yet</p>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AddDevoteeModal 
        isOpen={showAddDevoteeModal} 
        onClose={() => setShowAddDevoteeModal(false)} 
      />
      <MakeEntryModal 
        isOpen={showMakeEntryModal} 
        onClose={() => setShowMakeEntryModal(false)} 
      />
      {showEditDevoteeModal && (
        <EditDevoteeModal 
          isOpen={showEditDevoteeModal} 
          onClose={() => setShowEditDevoteeModal(false)} 
          devoteeId={selectedDevoteeId}
        />
      )}
    </div>
  );
};

export default HomePage;