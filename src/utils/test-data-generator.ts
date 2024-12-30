import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 活动类型和对应的emoji
const ACTIVITIES = [
  { type: '运动', emoji: '🏃‍♂️', tags: ['健身', '跑步', '游泳', '瑜伽'] },
  { type: '工作', emoji: '💼', tags: ['会议', '编程', '写作', '设计'] },
  { type: '学习', emoji: '📚', tags: ['读书', '课程', '笔记', '研究'] },
  { type: '娱乐', emoji: '🎮', tags: ['游戏', '电影', '音乐', '聚会'] },
  { type: '休息', emoji: '😴', tags: ['睡觉', '冥想', '放松', '休闲'] }
];

// 生成随机时间 (HH:MM 格式)
function generateRandomTime(): string {
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 生成随机持续时间 (0.5-12小时)
function generateRandomDuration(): number {
  return Number((Math.random() * 11.5 + 0.5).toFixed(1));
}

// 生成随机标题
function generateRandomTitle(): string {
  const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
  const tag = activity.tags[Math.floor(Math.random() * activity.tags.length)];
  return `[${activity.emoji}#${activity.type}] ${tag}`;
}

// 生成随机笔记
function generateRandomNote(): string {
  const notes = [
    '今天感觉不错！',
    '需要继续保持',
    '有点累但值得',
    '下次继续加油',
    '达到目标了！',
    '还需要改进',
    '心情愉快~',
    '收获满满',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

// 生成测试数据
function generateTestData(rowCount: number, startDate: Date): string {
  const headers = ['Start date', 'End date', 'Duration', 'Title', 'Notes'];
  const rows: string[] = [headers.join(',')];

  for (let i = 0; i < rowCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i / 3)); // 每天最多3条记录
    
    const startTime = generateRandomTime();
    const duration = generateRandomDuration();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    
    const endDate = new Date(date);
    endDate.setHours(startHours + Math.floor(duration));
    endDate.setMinutes(startMinutes + (duration % 1) * 60);

    const row = [
      `${date.toISOString().split('T')[0]} ${startTime}`,
      `${endDate.toISOString().split('T')[0]} ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
      duration.toString(),
      generateRandomTitle(),
      generateRandomNote()
    ];

    rows.push(row.map(cell => `"${cell}"`).join(','));
  }

  return rows.join('\n');
}

// 生成测试文件
export function generateTestFiles() {
  const testDataDir = join(process.cwd(), 'test-data');
  if (!existsSync(testDataDir)) {
    mkdirSync(testDataDir);
  }

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // 从一年前开始

  // 生成3000行数据
  const data3000 = generateTestData(3000, startDate);
  writeFileSync(join(testDataDir, 'timeview_3000_rows.csv'), data3000);

  // 生成6000行数据
  const data6000 = generateTestData(6000, startDate);
  writeFileSync(join(testDataDir, 'timeview_6000_rows.csv'), data6000);

  console.log('Test data files generated successfully!');
} 