export const USER_STATUS = {
  ACTIVE: 'active',
  IDLE: 'idle',
  DISTRACTED: 'distracted',
  OFFLINE: 'offline'
};

export const STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'bg-green-500',
  [USER_STATUS.IDLE]: 'bg-yellow-500',
  [USER_STATUS.DISTRACTED]: 'bg-orange-500',
  [USER_STATUS.OFFLINE]: 'bg-gray-500'
};

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.IDLE]: 'Idle',
  [USER_STATUS.DISTRACTED]: 'Distracted',
  [USER_STATUS.OFFLINE]: 'Offline'
};

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];