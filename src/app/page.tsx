"use client";

import { useState, useMemo } from "react";
import { HeatmapCalendar } from "@/components/HeatmapCalendar"
import { parseTimeviewJson, parseTimeviewCsv, parseICS } from "@/utils/parsers";
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

  // Filter data based on keyword and duration range
  const filteredData = useMemo(() => {
    return rawData
      .filter(entry => {
        const matchesKeyword = !keyword || [entry.title, entry.note, ...(entry.tags || []), entry.category]
          .filter(Boolean)
          .some(text => text?.toLowerCase().includes(keyword.toLowerCase()));

        const matchesDuration = entry.duration >= durationRange[0] && entry.duration <= durationRange[1];

        return matchesKeyword && matchesDuration;
      })
      .reduce((acc: Date[], entry) => {
        // Add multiple instances of the date based on duration
        const repeatTimes = Math.ceil(entry.duration);
        for (let i = 0; i < repeatTimes; i++) {
          acc.push(entry.date);
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
    <main className="min-h-screen bg-background">
      <div className="flex">
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
          onFileUpload={handleFileUpload}
        />

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-[1000px] mx-auto space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow">
              <HeatmapCalendar 
                data={filteredData} 
                year={selectedYear} 
                colorRanges={colorRanges}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
