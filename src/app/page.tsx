"use client";

import { useState, useMemo, useEffect } from "react";
import { HeatmapCalendar } from "@/components/HeatmapCalendar"
import { parseTimeviewJson, parseTimeviewCsv, parseICS } from "@/utils/parsers";
import { OperationPanel } from "@/components/OperationPanel";
import { ExportDialog } from "@/components/ExportDialog";
import Fuse from 'fuse.js';

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

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/heat.js/themes/light/gamboge.css`;
    document.head.appendChild(link);
    document.documentElement.setAttribute('data-theme', 'light/gamboge');
  }, []);

  // Filter data based on keyword and duration range
  const filteredData = useMemo(() => {
    if (!keyword) {
      return rawData
        .filter(entry => entry.duration >= durationRange[0] && entry.duration <= durationRange[1])
        .reduce((acc: Date[], entry) => {
          const repeatTimes = Math.ceil(entry.duration);
          for (let i = 0; i < repeatTimes; i++) {
            acc.push(entry.date);
          }
          return acc;
        }, []);
    }

    const fuse = new Fuse(rawData, {
      keys: ['title', 'note', 'category', 'tags'],
      threshold: 0.4, // 0.0 = 精确匹配, 1.0 = 匹配所有
      includeScore: true,
      useExtendedSearch: true,
    });

    return fuse.search(keyword)
      .map(result => result.item)
      .filter(entry => entry.duration >= durationRange[0] && entry.duration <= durationRange[1])
      .reduce((acc: Date[], entry) => {
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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    
    // If the theme is not a custom theme, load the theme from the theme picker
    if (!newTheme.startsWith('custom/')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/heat.js/themes/${newTheme}.css`;
      
      // Remove old theme
      const oldLink = document.querySelector(`link[href*="/heat.js/themes/"]`);
      if (oldLink) {
        oldLink.remove();
      }
      
      document.head.appendChild(link);
    }
    
    document.documentElement.setAttribute('data-theme', newTheme);
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
          onThemeChange={handleThemeChange}
          colorRanges={colorRanges}
          onColorRangesChange={setColorRanges}
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
            <div className="flex justify-end">
              <ExportDialog elementId="heat-map" year={selectedYear || 2024} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
