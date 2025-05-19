import { useState, useEffect } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { BarChart, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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

const OverallSummaryPage = () => {
  const { devotees, entries } = useSystem();
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [summaries, setSummaries] = useState<DevoteeSummary[]>([]);
  
  const generateSummary = () => {
    const results: DevoteeSummary[] = [];
    
    devotees.forEach(devotee => {
      // Get all entries for this devotee within date range
      const devoteeEntries = entries.filter(entry => 
        entry.devotee_id === devotee.id &&
        entry.date >= startDate &&
        entry.date <= endDate
      );
      
      // Count unique days
      const uniqueDates = new Set<string>();
      devoteeEntries.forEach(entry => uniqueDates.add(entry.date));
      const totalDays = uniqueDates.size;
      
      if (totalDays === 0) {
        // No entries for this devotee in the date range
        results.push({
          id: devotee.id,
          name: devotee.name,
          isResident: devotee.is_resident,
          manglaPercentage: 0,
          japaPercentage: 0,
          lecturePercentage: 0,
          totalPoints: 0,
          maxPoints: 0,
          totalPercentage: 0,
          totalDays: 0,
          templeVisits: 0
        });
        return;
      }
      
      // Calculate totals
      let totalMangla = 0;
      let totalJapa = 0;
      let totalLecture = 0;
      let templeVisits = 0;
      
      devoteeEntries.forEach(entry => {
        totalMangla += entry.mangla;
        totalJapa += entry.japa;
        totalLecture += entry.lecture;
        if (entry.temple_visit) templeVisits++;
      });
      
      const totalPoints = totalMangla + totalJapa + totalLecture;
      const maxPoints = totalDays * 3;
      
      results.push({
        id: devotee.id,
        name: devotee.name,
        isResident: devotee.is_resident,
        manglaPercentage: (totalMangla / totalDays) * 100,
        japaPercentage: (totalJapa / totalDays) * 100,
        lecturePercentage: (totalLecture / totalDays) * 100,
        totalPoints,
        maxPoints,
        totalPercentage: (totalPoints / maxPoints) * 100,
        totalDays,
        templeVisits
      });
    });
    
    // Sort by total points (highest first), then by total days (highest first)
    results.sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.totalDays - a.totalDays;
    });
    
    setSummaries(results);
  };
  
  // Generate summary when date range changes
  useEffect(() => {
    generateSummary();
  }, [startDate, endDate, devotees, entries]);
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overall Summary</h1>
      
      <div className="card mb-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date Range</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      {summaries.length > 0 ? (
        <div className="card animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Report</h2>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Temple Visits</th>
                  <th>Mangla %</th>
                  <th>Japa %</th>
                  <th>Lecture %</th>
                  <th>Total Points</th>
                  <th>Total Days</th>
                  <th>Total %</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary, index) => (
                  <tr key={summary.id}>
                    <td>{index + 1}</td>
                    <td className="font-medium">
                      {summary.name}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        summary.isResident 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {summary.isResident ? 'R' : 'NR'}
                      </span>
                    </td>
                    <td>{summary.templeVisits}</td>
                    <td>{summary.manglaPercentage.toFixed(2)}%</td>
                    <td>{summary.japaPercentage.toFixed(2)}%</td>
                    <td>{summary.lecturePercentage.toFixed(2)}%</td>
                    <td>{summary.totalPoints} / {summary.maxPoints}</td>
                    <td>{summary.totalDays}</td>
                    <td>
                      <span className={`px-2 py-1 rounded ${getPercentageColor(summary.totalPercentage)}`}>
                        {summary.totalPercentage.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center animate-fade-in">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No data available</h3>
          <p className="text-gray-500">
            There are no entries in the selected date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default OverallSummaryPage;