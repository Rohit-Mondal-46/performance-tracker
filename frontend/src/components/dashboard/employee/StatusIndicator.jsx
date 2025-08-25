import { useState, useEffect } from 'react';
import { USER_STATUS, STATUS_COLORS, STATUS_LABELS } from '../../../utils/constants';

const StatusIndicator = () => {
  const [currentStatus, setCurrentStatus] = useState(USER_STATUS.ACTIVE);
  const [timeActive, setTimeActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeActive(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    setTimeActive(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className={`w-24 h-24 ${STATUS_COLORS[currentStatus]} rounded-full mx-auto flex items-center justify-center mb-4`}>
          <span className="text-3xl font-bold text-white">
            {currentStatus.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{STATUS_LABELS[currentStatus]}</h2>
        <p className="text-muted-foreground">Time in this status: {formatTime(timeActive)}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Change Status</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(USER_STATUS).map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`p-3 rounded-lg text-center transition-colors ${
                currentStatus === status
                  ? `${STATUS_COLORS[status]} text-white font-bold`
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Status Guide</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            <span className="text-foreground">Active - Working productively</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
            <span className="text-foreground">Idle - Not actively working</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
            <span className="text-foreground">Distracted - Engaged in non-work activities</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
            <span className="text-foreground">Offline - Not available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;