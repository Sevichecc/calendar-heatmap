"use client";
import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!containerRef.current || !window.$heat) return;

    // Only initialize once when component mounts
    const isInitialized = containerRef.current.getAttribute('data-initialized');
    
    if (!isInitialized) {
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
    window.$heat.reset(elementId, false);
    window.$heat.setYear(elementId, year);
    
    // Convert date format
    const formattedDates = data.map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    
    window.$heat.addDates(elementId, formattedDates, undefined, true);

    // Cleanup function
    return () => {
      window.$heat.reset(elementId, false);
    };
  }, [data, year, colorRanges]);

  return (
    <div id="heat-map" ref={containerRef} className="w-full mx-auto" />
  );
}

export default HeatmapCalendar;