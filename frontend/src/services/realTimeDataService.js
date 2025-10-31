class RealTimeDataService {
  constructor() {
    this.users = new Map();
    this.listeners = new Set();
    this.updateInterval = null;
    this.startUpdates();
  }

  initializeUser(user) {
    const realTimeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: 'active',
      lastActive: new Date(),
      productivityScore: Math.floor(Math.random() * 30) + 70,
      hoursToday: Math.random() * 8,
      tasksCompleted: Math.floor(Math.random() * 10),
    };
    this.users.set(user.id, realTimeUser);
    this.notifyListeners();
  }

  addUser(user) {
    this.initializeUser(user);
  }

  removeUser(userId) {
    this.users.delete(userId);
    this.notifyListeners();
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getStats() {
    const users = Array.from(this.users.values());
    const activeUsers = users.filter(u => u.status === 'active').length;
    const idleUsers = users.filter(u => u.status === 'idle').length;
    const awayUsers = users.filter(u => u.status === 'away').length;
    const avgProductivity = users.length > 0
      ? users.reduce((sum, u) => sum + u.productivityScore, 0) / users.length
      : 0;
    const totalHoursToday = users.reduce((sum, u) => sum + u.hoursToday, 0);

    return {
      totalUsers: users.length,
      activeUsers,
      idleUsers,
      awayUsers,
      avgProductivity,
      totalHoursToday,
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  startUpdates() {
    this.updateInterval = window.setInterval(() => {
      this.users.forEach((user) => {
        const rand = Math.random();
        if (rand > 0.95) {
          user.status = user.status === 'active' ? 'idle' : 'active';
        }
        if (rand > 0.98) {
          user.productivityScore = Math.max(0, Math.min(100, user.productivityScore + (Math.random() - 0.5) * 10));
        }
        if (rand > 0.99) {
          user.hoursToday += 0.1;
        }
        user.lastActive = new Date();
      });
      this.notifyListeners();
    }, 5000);
  }

  stopUpdates() {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const realTimeDataService = new RealTimeDataService();
