"use client";
import { useEffect, useRef, useMemo } from 'react';
import type { PublicApi} from 'jheat.js/src/ts/api';
import type { BindingOptions } from 'jheat.js/src/ts/type';
import '@/styles/heat-override.css';

declare global {
  interface Window {
    $heat: PublicApi;
  }
}

interface HeatmapCalendarProps {
  data: Date[];
  year: number;
  colorRanges: Array<{
    minimum: number;
    cssClassName: string;
  }>;
}

export function HeatmapCalendar({ data, year, colorRanges }: HeatmapCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementId = 'heat-map';

  // 优化：对数据进行预处理和去重
  const processedDates = useMemo(() => {
    const dateSet = new Set<string>();
    const result: Date[] = [];
    
    data.forEach(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString();
      
      if (!dateSet.has(dateStr)) {
        dateSet.add(dateStr);
        result.push(d);
      }
    });

    // 按日期排序
    return result.sort((a, b) => a.getTime() - b.getTime());
  }, [data]);

  // 优化：批量处理数据
  const addDatesInBatches = async (dates: Date[], heatInstance: PublicApi, elementId: string) => {
    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(dates.length / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, dates.length);
      const batch = dates.slice(start, end);

      // 使用 requestAnimationFrame 来避免阻塞主线程
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          heatInstance.addDates(elementId, batch, undefined, true);
          resolve(undefined);
        });
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current || !window.$heat) return;

    let isComponentMounted = true;

    const initializeHeatmap = async () => {
      // Only initialize once when component mounts
      const isInitialized = containerRef.current?.getAttribute('data-initialized');
      
      if (!isInitialized && containerRef.current) {
        window.$heat.render(containerRef.current, {
          _currentView: "map",
          year: year,
          views: {
            map: {
              showDayNames: true,
              showMonthNames: true,
              showDayNumbers: false,
              showMonthDayGaps: false,
              placeMonthNamesOnTheBottom: false
            }
          },
          colorRanges,
          title: {
            showText: true,
            showYearSelector: true,
            showCurrentYearButton: true
          },
          guide: {
            enabled: true,
            showLessAndMoreLabels: true,
            showNumbersInGuide: true
          },
          tooltip: {
            delay: 300,
            dayText: "{d}{o} {mmmm} {yyyy}"
          }
        } as unknown as BindingOptions);
        containerRef.current.setAttribute('data-initialized', 'true');
      }

      // Reset and update data
      if (isComponentMounted) {
        window.$heat.reset(elementId, false);
        window.$heat.setYear(elementId, year);
        
        // 批量添加数据
        await addDatesInBatches(processedDates, window.$heat, elementId);
      }
    };

    initializeHeatmap();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      window.$heat.reset(elementId, false);
    };
  }, [processedDates, year, colorRanges]);

  return (
    <div id="heat-map" ref={containerRef} className="w-full mx-auto" />
  );
}

export default HeatmapCalendar;