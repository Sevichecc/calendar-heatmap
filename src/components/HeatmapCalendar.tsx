"use client";
import { useEffect, useRef } from 'react';
import type { PublicApi} from 'jheat.js/src/ts/api';
import type { BindingOptions, BindingOptionsCurrentView } from 'jheat.js/src/ts/type';
import '@/styles/heat-override.css';

declare global {
  interface Window {
    $heat: PublicApi;
  }
}

interface HeatmapCalendarProps {
  data: Date[];
  year: number;
  theme?: string;
  colorRanges: Array<{
    minimum: number;
    cssClassName: string;
  }>;
}

export function HeatmapCalendar({ data, year, theme = 'light/orange', colorRanges }: HeatmapCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementId = 'heat-map';

  useEffect(() => {
    if (!containerRef.current || !window.$heat) return;

    // Only initialize once when component mounts
    const isInitialized = containerRef.current.getAttribute('data-initialized');
    
    if (!isInitialized) {
      window.$heat.render(containerRef.current, {
        year: year,
        views: {
          map: {
            showDayNames: true,
            showMonthNames: true,
            showDayNumbers: false,
            showMonthDayGaps: true,
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
          delay: 500,
          dayText: "{d}{o} {mmmm} {yyyy}"
        }
      } as BindingOptions);
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