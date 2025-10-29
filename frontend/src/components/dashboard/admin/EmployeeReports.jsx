import { useState } from 'react';

const EmployeeReports = () => {
  const [reports, setReports] = useState([
    { id: 1, employee: 'John Doe', date: '2023-10-15', type: 'Weekly', status: 'Completed' },
    { id: 2, employee: 'Jane Smith', date: '2023-10-15', type: 'Weekly', status: 'Pending' },
    { id: 3, employee: 'Robert Johnson', date: '2023-10-14', type: 'Daily', status: 'Completed' },
    { id: 4, employee: 'Emily Davis', date: '2023-10-14', type: 'Daily', status: 'Completed' },
    { id: 5, employee: 'Michael Wilson', date: '2023-10-13', type: 'Monthly', status: 'In Progress' },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Employee Reports</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
          </select>
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-foreground">Employee</th>
              <th className="text-left p-4 font-medium text-foreground">Date</th>
              <th className="text-left p-4 font-medium text-foreground">Type</th>
              <th className="text-left p-4 font-medium text-foreground">Status</th>
              <th className="text-left p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-b border-border last:border-0">
                <td className="p-4 text-foreground">{report.employee}</td>
                <td className="p-4 text-foreground">{report.date}</td>
                <td className="p-4 text-foreground">{report.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-primary hover:text-primary/80">View</button>
                    <button className="text-secondary hover:text-secondary/80">Export</button>
                    {report.status === 'Pending' && (
                      <button className="text-accent hover:text-accent/80">Remind</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Report Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <p className="text-2xl font-bold text-green-800">12</p>
            <p className="text-muted-foreground">Completed Reports</p>
          </div>
          <div className="text-center p-4 bg-yellow-100 rounded-lg">
            <p className="text-2xl font-bold text-yellow-800">3</p>
            <p className="text-muted-foreground">Pending Reports</p>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <p className="text-2xl font-bold text-blue-800">2</p>
            <p className="text-muted-foreground">In Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReports;