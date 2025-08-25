import { Bar, Doughnut } from 'react-chartjs-2';
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

const PerformanceMetrics = () => {
  const dates = generateDateRange(7);
  const productivityData = generateRandomData(7, 60, 95);
  const engagementData = generateRandomData(7, 65, 90);

  const barChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Productivity (%)',
        data: productivityData,
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[0],
        borderWidth: 1,
      },
      {
        label: 'Engagement (%)',
        data: engagementData,
        backgroundColor: CHART_COLORS[1],
        borderColor: CHART_COLORS[1],
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Focused', 'Distracted', 'Neutral'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: [CHART_COLORS[0], CHART_COLORS[3], CHART_COLORS[4]],
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
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Performance</h3>
          <div className="h-64">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Focus Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-2xl font-bold text-primary">82%</p>
            <p className="text-muted-foreground">Productivity Score</p>
          </div>
          <div className="text-center p-4 bg-secondary/10 rounded-lg">
            <p className="text-2xl font-bold text-secondary">78%</p>
            <p className="text-muted-foreground">Engagement</p>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <p className="text-2xl font-bold text-accent">80%</p>
            <p className="text-muted-foreground">Final Score</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;