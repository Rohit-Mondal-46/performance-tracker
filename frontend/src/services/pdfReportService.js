import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class PDFReportService {
  async generateDailyPDF(report, userName) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Daily Productivity Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`User: ${userName}`, 20, 35);
    doc.text(`Date: ${report.date.toLocaleDateString()}`, 20, 45);

    doc.text(`Total Hours: ${report.totalHours.toFixed(2)}`, 20, 65);
    doc.text(`Productivity Score: ${report.productivityScore.toFixed(0)}%`, 20, 75);
    doc.text(`Tasks Completed: ${report.tasksCompleted}`, 20, 85);
    doc.text(`Break Time: ${report.breakTime.toFixed(2)} hours`, 20, 95);
    doc.text(`Focus Time: ${report.focusTime.toFixed(2)} hours`, 20, 105);

    doc.save(`daily-report-${report.date.toISOString().split('T')[0]}.pdf`);
  }

  async generateWeeklyPDF(report, userName) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Weekly Productivity Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`User: ${userName}`, 20, 35);
    doc.text(
      `Week: ${report.weekStart.toLocaleDateString()} - ${report.weekEnd.toLocaleDateString()}`,
      20,
      45
    );

    doc.text(`Total Hours: ${report.totalHours.toFixed(2)}`, 20, 65);
    doc.text(`Avg Productivity: ${report.avgProductivityScore.toFixed(0)}%`, 20, 75);
    doc.text(`Tasks Completed: ${report.totalTasksCompleted}`, 20, 85);

    doc.setFontSize(14);
    doc.text('Daily Breakdown:', 20, 105);

    doc.setFontSize(10);
    let yPos = 115;
    report.dailyBreakdown.forEach((day, index) => {
      doc.text(
        `${day.date.toLocaleDateString()}: ${day.totalHours.toFixed(1)}h, ${day.productivityScore.toFixed(0)}%, ${day.tasksCompleted} tasks`,
        25,
        yPos + index * 10
      );
    });

    doc.save(
      `weekly-report-${report.weekStart.toISOString().split('T')[0]}.pdf`
    );
  }

  async captureElementAsPDF(elementId, fileName) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(fileName);
  }
}

export const pdfReportService = new PDFReportService();
