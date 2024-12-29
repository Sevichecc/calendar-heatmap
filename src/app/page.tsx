"use client";

import { useState, useMemo } from "react";
import { HeatmapCalendar } from "@/components/HeatmapCalendar"
import { parseTimeviewJson, parseTimeviewCsv, parseICS } from "@/utils/parsers";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { OperationPanel } from "@/components/OperationPanel";

export default function Home() {
  const [theme, setTheme] = useState('light/gamboge');
  const [rawData, setRawData] = useState<Array<{ date: Date; duration: number; title: string; note?: string; category?: string; tags?: string[] }>>([]);
  const [keyword, setKeyword] = useState('');
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 24]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [colorRanges, setColorRanges] = useState([
    { minimum: 1, cssClassName: 'day-color-1' },
    { minimum: 3, cssClassName: 'day-color-2' },
    { minimum: 5, cssClassName: 'day-color-3' },
    { minimum: 8, cssClassName: 'day-color-4' }
  ]);

  // Filter Data
  const filteredData = useMemo(() => {
    return rawData
      .filter(item => {
        const searchText = keyword.toLowerCase();
        const matchesKeyword = keyword === '' || 
          item.title.toLowerCase().includes(searchText) ||
          item.note?.toLowerCase().includes(searchText) ||
          item.category?.toLowerCase().includes(searchText) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchText));
        const matchesDuration = item.duration >= durationRange[0] && 
          item.duration <= durationRange[1];
        return matchesKeyword && matchesDuration;
      })
      .reduce((acc: Date[], item) => {
        // 根据持续时间添加多个日期实例
        const repeatTimes = Math.ceil(item.duration);
        for (let i = 0; i < repeatTimes; i++) {
          acc.push(item.date);
        }
        return acc;
      }, []);
  }, [rawData, keyword, durationRange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allData: Array<{ date: Date; duration: number; title: string; note?: string; category?: string; tags?: string[] }> = [];
    
    await Promise.all(
      Array.from(files).map(async (file) => {
        const text = await file.text();
        const fileName = file.name.toLowerCase();

        try {
          let data: Array<{ date: Date; duration: number; title: string; note?: string; category?: string; tags?: string[] }> = [];
          if (fileName.endsWith('.json')) {
            data = parseTimeviewJson(text);
          } else if (fileName.endsWith('.csv')) {
            data = parseTimeviewCsv(text);
          } else if (fileName.endsWith('.ics')) {
            data = parseICS(text);
          }
          allData.push(...data);
        } catch (error) {
          console.error(`Error parsing file ${fileName}:`, error);
        }
      })
    );

    // Set the year to the latest year in the data
    if (allData.length > 0) {
      const latestYear = Math.max(...allData.map(d => d.date.getFullYear()));
      setSelectedYear(latestYear);
    }
    setRawData(allData);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight font-mono">Calendar Heatmap</h1>
          <Input
            type="file"
            onChange={handleFileUpload}
            accept=".json,.csv,.ics"
            multiple
            id="file-upload"
            className="hidden"
          />
          <Label 
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </Label>
        </div>

        <OperationPanel
          keyword={keyword}
          onKeywordChange={setKeyword}
          durationRange={durationRange}
          onDurationRangeChange={setDurationRange}
          theme={theme}
          onThemeChange={setTheme}
          colorRanges={colorRanges}
          onColorRangesChange={setColorRanges}
          selectedYear={selectedYear}
        />
        
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <HeatmapCalendar 
            data={filteredData} 
            year={selectedYear} 
            colorRanges={colorRanges}
          />
        </div>
      </div>
    </main>
  );
}
