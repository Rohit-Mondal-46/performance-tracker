import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const generateDateRange = (days = 7) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), 'MMM dd'));
  }
  return dates;
};

export const generateRandomData = (length = 7, min = 50, max = 100) => {
  return Array.from({ length }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

export const calculateProductivityScore = (activeTime, totalTime) => {
  if (totalTime === 0) return 0;
  return Math.round((activeTime / totalTime) * 100);
};