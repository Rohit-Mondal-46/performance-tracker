import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { CHART_COLORS } from '../../../utils/constants';
import { generateDateRange, generateRandomData } from '../../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const UserStats = () => {
  const dates = generateDateRange(7);
  const userData = generateRandomData(7, 80, 120);
  const productivityData = generateRandomData(7, 65, 90);

  const barChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Active Users',
        data: userData,
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[0],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Active', 'Idle', 'Distracted', 'Offline'],
    datasets: [
      {
        data: [65, 15, 10, 10],
        backgroundColor: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[3], CHART_COLORS[4]],
        borderWidth: 0,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-primary">124</p>
          <p className="text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-secondary">87</p>
          <p className="text-muted-foreground">Active Now</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-accent">76%</p>
          <p className="text-muted-foreground">Avg Productivity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Active Users</h3>
          <div className="h-64">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Status Distribution</h3>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-foreground">Team</th>
                <th className="text-left p-3 font-medium text-foreground">Members</th>
                <th className="text-left p-3 font-medium text-foreground">Avg Productivity</th>
                <th className="text-left p-3 font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { team: 'Development', members: 15, productivity: 82, status: 'Excellent' },
                { team: 'Design', members: 8, productivity: 78, status: 'Good' },
                { team: 'Marketing', members: 12, productivity: 75, status: 'Good' },
                { team: 'Sales', members: 10, productivity: 68, status: 'Average' },
                { team: 'Support', members: 7, productivity: 85, status: 'Excellent' },
              ].map((team, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground">{team.team}</td>
                  <td className="p-3 text-foreground">{team.members}</td>
                  <td className="p-3 text-foreground">{team.productivity}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      team.status === 'Excellent' 
                        ? 'bg-green-100 text-green-800' 
                        : team.status === 'Good'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {team.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserStats;