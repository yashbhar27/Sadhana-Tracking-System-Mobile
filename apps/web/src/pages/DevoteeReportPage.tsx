import { useState, useEffect } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { Calendar, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DevoteeSummary {
  id: string;
  name: string;
  isResident: boolean;
  manglaPercentage: number;
  japaPercentage: number;
  lecturePercentage: number;
  totalPoints: number;
  maxPoints: number;
  totalPercentage: number;
  totalDays: number;
  templeVisits: number;
}

interface ReportEntry {
  date: string;
  mangla: number;
  japa: number;
  lecture: number;
  temple_visit: boolean;
  temple_visit_type: string;
  dailyTotal: number;
}

const DevoteeReportPage = () => {
  const { devotees, entries } = useSystem();
  const [selectedDevotee, setSelectedDevotee] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [reportEntries, setReportEntries] = useState<ReportEntry[]>([]);
  
  const generateReport = () => {
    if (!selectedDevotee) return;
    
    const devoteeEntries = entries.filter(entry => 
      entry.devotee_id === selectedDevotee &&
      entry.date >= startDate &&
      entry.date <= endDate
    );
    
    // Collect unique dates
    const uniqueDates = new Set<string>();
    devoteeEntries.forEach(entry => uniqueDates.add(entry.date));
    const totalDays = uniqueDates.size;
    
    // Calculate totals
    let totalMangla = 0;
    let totalJapa = 0;
    let totalLecture = 0;
    let templeVisits = 0;
    
    const reportData: ReportEntry[] = [];
    
    devoteeEntries.forEach(entry => {
      totalMangla += entry.mangla;
      totalJapa += entry.japa;
      totalLecture += entry.lecture;
      if (entry.temple_visit) templeVisits++;
      
      reportData.push({
        date: entry.date,
        mangla: entry.mangla,
        japa: entry.japa,
        lecture: entry.lecture,
        temple_visit: entry.temple_visit,
        temple_visit_type: entry.temple_visit_type,
        dailyTotal: entry.mangla + entry.japa + entry.lecture
      });
    });
    
    const totalPoints = totalMangla + totalJapa + totalLecture;
    const maxPoints = totalDays * 3;
    
    // Calculate percentages
    const calcPercentage = (value: number) => 
      totalDays ? `${((value / totalDays) * 100).toFixed(2)}%` : '0%';
    
    const totalPercentage = maxPoints ? `${((totalPoints / maxPoints) * 100).toFixed(2)}%` : '0%';
    
    setReportSummary({
      manglaPercentage: calcPercentage(totalMangla),
      japaPercentage: calcPercentage(totalJapa),
      lecturePercentage: calcPercentage(totalLecture),
      totalPoints,
      maxPoints,
      totalPercentage,
      totalDays,
      templeVisits
    });
    
    // Sort entries by date (newest first)
    reportData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReportEntries(reportData);
  };
  
  // Generate report when selection changes
  useEffect(() => {
    if (selectedDevotee) {
      generateReport();
    }
  }, [selectedDevotee, startDate, endDate, entries]);
  
  const getNameColor = (entry: ReportEntry) => {
    if (entry.temple_visit) {
      return 'text-green-600 font-medium';
    }
    return '';
  };

  const getScoreColor = (score: number) => {
    return 'text-gray-900';
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Devotee Report</h1>
      
      <div className="card mb-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Devotee and Date Range</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="devotee-select" className="block text-sm font-medium text-gray-700 mb-1">
              Devotee
            </label>
            <select
              id="devotee-select"
              value={selectedDevotee}
              onChange={(e) => setSelectedDevotee(e.target.value)}
              className="select"
            >
              <option value="">Select a devotee</option>
              {devotees.map((devotee) => (
                <option key={devotee.id} value={devotee.id}>
                  {devotee.name} {devotee.is_resident ? '(Resident)' : '(Non-Resident)'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>
      
      {selectedDevotee && reportSummary && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Activity Attendance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Temple Visits:</span>
                  <span className="font-semibold">{reportSummary.templeVisits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mangla Arti:</span>
                  <span className="font-semibold">{reportSummary.manglaPercentage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Japa:</span>
                  <span className="font-semibold">{reportSummary.japaPercentage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lecture:</span>
                  <span className="font-semibold">{reportSummary.lecturePercentage}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Overall Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Points:</span>
                  <span className="font-semibold">{reportSummary.totalPoints} / {reportSummary.maxPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overall Percentage:</span>
                  <span className="font-semibold">{reportSummary.totalPercentage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Days:</span>
                  <span className="font-semibold">{reportSummary.totalDays}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedDevotee && reportEntries.length > 0 && (
        <div className="card animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Report</h2>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Temple Visit</th>
                  <th>Mangla Arti</th>
                  <th>Japa</th>
                  <th>Lecture</th>
                  <th>Daily Total</th>
                </tr>
              </thead>
              <tbody>
                {reportEntries.map((entry, index) => (
                  <tr key={index}>
                    <td>{format(parseISO(entry.date), 'dd MMM yyyy')}</td>
                    <td>{entry.temple_visit ? 'YES' : 'NO'}</td>
                    <td className={getScoreColor(entry.mangla)}>{entry.mangla}</td>
                    <td className={getScoreColor(entry.japa)}>{entry.japa}</td>
                    <td className={getScoreColor(entry.lecture)}>{entry.lecture}</td>
                    <td className="font-medium">{entry.dailyTotal}/3</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedDevotee && reportEntries.length === 0 && (
        <div className="card p-8 text-center animate-fade-in">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No entries found</h3>
          <p className="text-gray-500">
            There are no entries for this devotee in the selected date range.
          </p>
        </div>
      )}
      
      {!selectedDevotee && (
        <div className="card p-8 text-center animate-fade-in">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Select a devotee</h3>
          <p className="text-gray-500">
            Please select a devotee and date range to generate a report.
          </p>
        </div>
      )}
    </div>
  );
};

export default DevoteeReportPage;