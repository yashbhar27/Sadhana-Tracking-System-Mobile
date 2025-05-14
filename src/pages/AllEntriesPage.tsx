import { useState } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Upload, Filter, X, Download, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface CSVEntry {
  date: string;
  devotee_name: string;
  mangla: number;
  japa: number;
  lecture: number;
  temple_visit: boolean;
}

const AllEntriesPage = () => {
  const { entries, devotees, addEntry, deleteEntry } = useSystem();
  const { user, checkAdminPassword } = useAuth();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const [filter, setFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  const authenticate = async () => {
    if (!adminPassword.trim()) {
      toast.error('Password is required');
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      const isAdmin = await checkAdminPassword(adminPassword);
      if (isAdmin) {
        setIsAuthenticated(true);
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
  
  // Filter entries based on search term
  const filteredEntries = entries.filter(entry => {
    const searchTerm = filter.toLowerCase();
    const devoteeNameMatch = entry.devotee_name?.toLowerCase().includes(searchTerm);
    const dateMatch = entry.date.includes(searchTerm);
    return !filter || devoteeNameMatch || dateMatch;
  });

  const handleDeleteSelected = async () => {
    if (!selectedEntries.length) {
      toast.error('No entries selected');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedEntries.length} selected entries?`)) {
      let successCount = 0;
      let errorCount = 0;

      for (const entryId of selectedEntries) {
        try {
          const success = await deleteEntry(entryId);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error deleting entry:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} entries`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} entries`);
      }

      setSelectedEntries([]);
    }
  };
  
  // Handle CSV file upload and processing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };
  
  const processCSV = async () => {
    if (!csvData) {
      toast.error('Please upload a CSV file first');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Parse CSV data
      const rows = csvData.split('\n');
      // Skip header row and empty rows
      const dataRows = rows.slice(1).filter(row => row.trim() !== '');
      
      let successCount = 0;
      let errorCount = 0;
      
      //Process each row
      for (const row of dataRows) {
        const [date, devotee_name, mangla_str, japa_str, lecture_str, temple_visit_str] = row.split(',').map(c => c.trim());
        
        // Find devotee by name
        const devotee = devotees.find(d => d.name.toLowerCase() === devotee_name.toLowerCase());
        if (!devotee) {
          console.error(`Devotee not found: ${devotee_name}`);
          errorCount++;
          continue;
        }
        
        // Parse values and ensure they are valid
        const mangla = parseFloat(mangla_str);
        const japa = parseFloat(japa_str);
        const lecture = parseFloat(lecture_str);
        const temple_visit = temple_visit_str?.toLowerCase() === 'true';
        
        // Validate values
        if (![0, 0.5, 1].includes(mangla) || ![0, 0.5, 1].includes(japa) || ![0, 0.5, 1].includes(lecture)) {
          console.error(`Invalid values for entry: ${row}`);
          errorCount++;
          continue;
        }
        
        try {
          const success = await addEntry(
            devotee.id, 
            date, 
            mangla, 
            japa, 
            lecture, 
            temple_visit,
            'normal'
          );
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error processing entry:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} entries`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} entries`);
      }
      
      // Clear CSV data
      setCsvData('');
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('CSV processing error:', error);
      toast.error('An error occurred while processing the CSV file');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Generate CSV for download
  const generateCSV = () => {
    const header = 'Date,Devotee Name,Mangla Arti,Japa,Lecture,Temple Visit\n';
    const rows = filteredEntries.map(entry => {
      return `${entry.date},${entry.devotee_name},${entry.mangla},${entry.japa},${entry.lecture},${entry.temple_visit}`;
    }).join('\n');
    
    const csvContent = `${header}${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `entries_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate sample CSV for download
  const downloadSampleCSV = () => {
    const sampleData = `Date,Devotee Name,Mangla Arti,Japa,Lecture,Temple Visit
2025-05-01,John Doe,1,1,0.5,true
2025-05-01,Jane Smith,0.5,1,1,true`;
    
    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_entries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getNameColor = (entry: any) => {
    if (entry.temple_visit) {
      return 'text-green-600 font-medium';
    }
    return '';
  };

  const getScoreColor = (score: number) => {
    return 'text-gray-900';
  };
  
  // If user is already authenticated as admin, show entries directly
  const showAuthForm = !isAuthenticated && !user?.isAdmin;
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Entries</h1>
      
      {showAuthForm ? (
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
        <>
          <div className="card mb-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Entries from CSV</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-1">
                  CSV File (format: date,devotee_name,mangla,japa,lecture,temple_visit)
                </label>
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-orange-50 file:text-orange-600
                    hover:file:bg-orange-100
                  "
                />
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={downloadSampleCSV}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download Sample CSV
                  </button>
                  <span className="text-sm text-gray-500">
                    (Values for mangla, japa, and lecture must be 0, 0.5, or 1)
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={processCSV}
                  className="btn btn-primary"
                  disabled={!csvData || isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <span className="mr-2">Uploading</span>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Upload size={16} className="mr-2" />
                      Import Data
                    </span>
                  )}
                </button>
                <button 
                  onClick={generateCSV}
                  className="btn btn-secondary"
                >
                  <Download size={16} className="mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
          
          <div className="card animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              <FileText className="inline mr-2" size={20} />
              Entry Records
            </h2>

            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Filter by name or date"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input pl-10"
                />
                {filter && (
                  <button 
                    onClick={() => setFilter('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {filteredEntries.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedEntries.length === filteredEntries.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries(filteredEntries.map(entry => entry.id));
                            } else {
                              setSelectedEntries([]);
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-orange-500"
                        />
                      </th>
                      <th>Date</th>
                      <th>Devotee</th>
                      <th>Mangla Arti</th>
                      <th>Japa</th>
                      <th>Lecture</th>
                      <th>Temple Visit</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEntries([...selectedEntries, entry.id]);
                              } else {
                                setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-orange-500"
                          />
                        </td>
                        <td>{format(parseISO(entry.date), 'dd MMM yyyy')}</td>
                        <td className={getNameColor(entry)}>
                          {entry.devotee_name}
                        </td>
                        <td className={getScoreColor(entry.mangla)}>
                          {entry.mangla}
                        </td>
                        <td className={getScoreColor(entry.japa)}>
                          {entry.japa}
                        </td>
                        <td className={getScoreColor(entry.lecture)}>
                          {entry.lecture}
                        </td>
                        <td>
                          {entry.temple_visit ? 'YES' : 'NO'}
                        </td>
                        <td className="font-medium">{entry.mangla + entry.japa + entry.lecture}/3</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 text-center rounded-lg">
                <p className="text-gray-500">No entries found</p>
              </div>
            )}

            {selectedEntries.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleDeleteSelected}
                  className="btn btn-error"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Selected ({selectedEntries.length})
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AllEntriesPage;