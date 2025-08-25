import { useState } from 'react';

const MyReports = () => {
  const [reports, setReports] = useState([
    { id: 1, date: '2023-10-15', title: 'Weekly Performance Report', type: 'Weekly' },
    { id: 2, date: '2023-10-08', title: 'Weekly Performance Report', type: 'Weekly' },
    { id: 3, date: '2023-10-01', title: 'Weekly Performance Report', type: 'Weekly' },
    { id: 4, date: '2023-09-24', title: 'Weekly Performance Report', type: 'Weekly' },
  ]);

  const [showAddReport, setShowAddReport] = useState(false);
  const [newReport, setNewReport] = useState({ title: '', type: 'Daily' });

  const handleAddReport = () => {
    if (newReport.title.trim()) {
      const report = {
        id: reports.length + 1,
        date: new Date().toISOString().split('T')[0],
        title: newReport.title,
        type: newReport.type,
      };
      
      setReports([report, ...reports]);
      setNewReport({ title: '', type: 'Daily' });
      setShowAddReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Reports</h2>
        <button
          onClick={() => setShowAddReport(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          Add Report
        </button>
      </div>

      {showAddReport && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Create New Report</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Report Title</label>
              <input
                type="text"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                placeholder="Enter report title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Report Type</label>
              <select
                value={newReport.type}
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddReport}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Save Report
              </button>
              <button
                onClick={() => setShowAddReport(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-foreground">Date</th>
              <th className="text-left p-4 font-medium text-foreground">Title</th>
              <th className="text-left p-4 font-medium text-foreground">Type</th>
              <th className="text-left p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-border last:border-0">
                <td className="p-4 text-foreground">{report.date}</td>
                <td className="p-4 text-foreground">{report.title}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {report.type}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-primary hover:text-primary/80">View</button>
                    <button className="text-secondary hover:text-secondary/80">Export</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyReports;