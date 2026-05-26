const fs = require('fs');
const path = require('path');

// Get week start date (Monday)
function getWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Generate report
function generateReport() {
  const weekStart = getWeekStart();
  
  // Try to read task tracker data from file (you'll sync this from localStorage)
  let trackerData = {
    categories: [],
    tasks: [],
    daily: {}
  };

  const dataFile = path.join(__dirname, '../../data/tracker-data.json');
  if (fs.existsSync(dataFile)) {
    try {
      trackerData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (e) {
      console.log('No tracker data found, creating empty report');
    }
  }

  // Calculate week totals
  const weekTotals = {};
  
  trackerData.categories.forEach(cat => {
    weekTotals[cat.id] = {
      name: cat.name,
      emoji: cat.emoji,
      total: 0,
      tasks: {}
    };
  });

  trackerData.tasks.forEach(task => {
    if (!weekTotals[task.category]) {
      weekTotals[task.category] = {
        name: task.category,
        emoji: '📌',
        total: 0,
        tasks: {}
      };
    }
    weekTotals[task.category].tasks[task.id] = {
      name: task.name,
      emoji: task.emoji,
      budget: task.budget * 7,
      logged: 0
    };
  });

  // Sum daily logs for the week
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = trackerData.daily[dateStr] || {};
    
    trackerData.tasks.forEach(task => {
      const logged = dayData[task.id] || 0;
      if (weekTotals[task.category].tasks[task.id]) {
        weekTotals[task.category].tasks[task.id].logged += logged;
      }
      weekTotals[task.category].total += logged;
    });
  }

  // Generate markdown
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);
  const endDateStr = endDate.toISOString().split('T')[0];

  let markdown = `# Weekly Report: ${weekStart} → ${endDateStr}\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;

  Object.entries(weekTotals).forEach(([catId, catData]) => {
    markdown += `## ${catData.emoji} ${catData.name}\n\n`;
    markdown += `**Total: ${catData.total.toFixed(1)}h**\n\n`;
    
    markdown += '| Task | Logged | Budget | Progress |\n';
    markdown += '|------|--------|--------|----------|\n';
    
    Object.entries(catData.tasks).forEach(([taskId, taskData]) => {
      const percent = Math.round((taskData.logged / taskData.budget) * 100);
      const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
      markdown += `| ${taskData.emoji} ${taskData.name} | ${taskData.logged.toFixed(1)}h | ${taskData.budget.toFixed(1)}h | ${bar} ${percent}% |\n`;
    });
    
    markdown += '\n';
  });

  // Summary
  const totalWeek = Object.values(weekTotals).reduce((sum, cat) => sum + cat.total, 0);
  markdown += `## 📊 Weekly Summary\n\n`;
  markdown += `**Total Hours Logged:** ${totalWeek.toFixed(1)}h\n\n`;

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Write report
  const reportFile = path.join(reportsDir, `week-of-${weekStart}.md`);
  fs.writeFileSync(reportFile, markdown);
  
  console.log(`✓ Report generated: ${reportFile}`);
}

// Run
generateReport();
