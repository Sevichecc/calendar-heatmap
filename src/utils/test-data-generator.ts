import { writeFileSync } from 'fs';

function generateRandomTime(): string {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateRandomDuration(): number {
  // 生成0.5到12小时之间的随机时长
  return Math.round((Math.random() * 11.5 + 0.5) * 10) / 10;
}

function generateRandomTitle(): string {
  const activities = [
    '睡眠', '深度睡眠', '午休',
    '工作', '编程', '开会', '写文档',
    '运动', '跑步', '游泳', '健身',
    '阅读', '学习', '看视频',
    '冥想', '休息', '散步'
  ];
  const tags = ['[#重要]', '[#日常]', '[#健康]', '[#工作]', '[#生活]', ''];
  
  const activity = activities[Math.floor(Math.random() * activities.length)];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  
  return `${tag} ${activity}`;
}

function generateRandomNote(): string {
  const notes = [
    '感觉不错',
    '需要改进',
    '继续保持',
    '有点累',
    '效率很高',
    '状态一般',
    ''
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

export function generateTestData(rowCount: number, startDate: Date = new Date(2024, 0, 1)): string {
  const header = 'Start date,End date,Duration,Title,Notes\n';
  const rows: string[] = [];

  for (let i = 0; i < rowCount; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + Math.floor(i / 8)); // 每天约8条记录
    
    const startTime = generateRandomTime();
    const duration = generateRandomDuration();
    const title = generateRandomTitle();
    const note = generateRandomNote();

    // 计算结束时间
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const endDate = new Date(currentDate);
    endDate.setHours(startHours);
    endDate.setMinutes(startMinutes);
    endDate.setHours(endDate.getHours() + Math.floor(duration));
    endDate.setMinutes(endDate.getMinutes() + Math.round((duration % 1) * 60));

    const row = [
      `${currentDate.toLocaleDateString('en-US')} ${startTime}`,
      `${endDate.toLocaleDateString('en-US')} ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
      duration.toString(),
      title,
      note
    ].map(field => `"${field}"`).join(',');

    rows.push(row);
  }

  return header + rows.join('\n');
}

// 生成不同规模的测试数据
const sizes = [3000, 6000];
const startDate = new Date(2024, 0, 1); // 从2024年1月1日开始

sizes.forEach(size => {
  const csvContent = generateTestData(size, startDate);
  writeFileSync(`test-data/timeview_${size}_rows.csv`, csvContent);
}); 