import { generateTestData } from '../src/utils/test-data-generator';
import { writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';

async function main() {
  // 确保测试数据目录存在
  const testDataDir = join(process.cwd(), 'test-data');
  await mkdir(testDataDir, { recursive: true });

  // 生成不同规模的测试数据
  const sizes = [3000, 6000];
  const startDate = new Date(2024, 0, 1); // 从2024年1月1日开始

  for (const size of sizes) {
    console.log(`Generating ${size} rows of test data...`);
    const csvContent = generateTestData(size, startDate);
    const filePath = join(testDataDir, `timeview_${size}_rows.csv`);
    writeFileSync(filePath, csvContent);
    console.log(`Generated ${filePath}`);
  }
}

main().catch(console.error); 