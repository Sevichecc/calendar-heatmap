"use client";

import { ThemePicker } from "@/components/ThemePicker"
import { ColorRangeSettings } from "@/components/ColorRangeSettings"
// import { ExportDialog } from "@/components/ExportDialog"
import { Input } from "@/components/ui/input"
import { Search, Timer } from "lucide-react"
import { useCallback } from "react"
import debounce from "lodash/debounce"

interface OperationPanelProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  durationRange: [number, number];
  onDurationRangeChange: (range: [number, number]) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  colorRanges: Array<{ minimum: number; cssClassName: string }>;
  onColorRangesChange: (ranges: Array<{ minimum: number; cssClassName: string }>) => void;
  selectedYear?: number;
}

export function OperationPanel({
  keyword,
  onKeywordChange,
  durationRange,
  onDurationRangeChange,
  theme,
  onThemeChange,
  colorRanges,
  onColorRangesChange,
}: OperationPanelProps) {
  const debouncedKeywordChange = useCallback(
    debounce((value: string) => onKeywordChange(value), 300),
    [onKeywordChange]
  )

  const debouncedDurationChange = useCallback(
    debounce((range: [number, number]) => onDurationRangeChange(range), 300),
    [onDurationRangeChange]
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="w-64 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Filter</span>
          </div>
          <Input
            value={keyword}
            onChange={(e) => {
              const value = e.target.value
              // 立即更新UI
              onKeywordChange(value)
              // 防抖更新父组件
              debouncedKeywordChange(value)
            }}
            placeholder="Search..."
          />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>Duration Range (hours)</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={24}
              value={durationRange[0]}
              onChange={(e) => {
                const newValue = Math.min(Math.max(0, Number(e.target.value)), durationRange[1]);
                const newRange: [number, number] = [newValue, durationRange[1]]
                // 立即更新UI
                onDurationRangeChange(newRange)
                // 防抖更新父组件
                debouncedDurationChange(newRange)
              }}
              className="w-20"
            />
            <span>to</span>
            <Input
              type="number"
              min={0}
              max={24}
              value={durationRange[1]}
              onChange={(e) => {
                const newValue = Math.max(Math.min(24, Number(e.target.value)), durationRange[0]);
                const newRange: [number, number] = [durationRange[0], newValue]
                // 立即更新UI
                onDurationRangeChange(newRange)
                // 防抖更新父组件
                debouncedDurationChange(newRange)
              }}
              className="w-20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemePicker currentTheme={theme} onSelectTheme={onThemeChange} />
          <ColorRangeSettings ranges={colorRanges} onRangesChange={onColorRangesChange} />
          {/* <ExportDialog elementId="heatmap-calendar" year={selectedYear} /> */}
        </div>
      </div>
    </div>
  )
} 