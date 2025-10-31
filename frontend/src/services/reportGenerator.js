class ReportGeneratorService {
  generateDailyReport(date) {
    return {
      date,
      totalHours: Math.random() * 8 + 4,
      productivityScore: Math.floor(Math.random() * 30) + 70,
      tasksCompleted: Math.floor(Math.random() * 15) + 5,
      breakTime: Math.random() * 2,
      focusTime: Math.random() * 6 + 2,
    };
  }

  generateWeeklyReport(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dailyBreakdown.push(this.generateDailyReport(date));
    }

    const totalHours = dailyBreakdown.reduce((sum, day) => sum + day.totalHours, 0);
    const avgProductivityScore =
      dailyBreakdown.reduce((sum, day) => sum + day.productivityScore, 0) / 7;
    const totalTasksCompleted = dailyBreakdown.reduce(
      (sum, day) => sum + day.tasksCompleted,
      0
    );

    return {
      weekStart,
      weekEnd,
      totalHours,
      avgProductivityScore,
      totalTasksCompleted,
      dailyBreakdown,
    };
  }

  getRecentDailyReports(count = 7) {
    const reports = [];
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      reports.push(this.generateDailyReport(date));
    }
    return reports;
  }

  getRecentWeeklyReports(count = 4) {
    const reports = [];
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7 + today.getDay()));
      reports.push(this.generateWeeklyReport(weekStart));
    }
    return reports;
  }
}

export const reportGeneratorService = new ReportGeneratorService();
