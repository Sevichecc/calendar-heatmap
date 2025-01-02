"use client";

import { ThemePicker } from "@/components/ThemePicker"
import { Input } from "@/components/ui/input"
import { Search, Timer, Settings2, Menu, Upload } from "lucide-react"
import { useCallback } from "react"
import debounce from "lodash/debounce"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

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
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SidebarContent = ({
  keyword,
  onKeywordChange,
  durationRange,
  onDurationRangeChange,
  theme,
  onThemeChange,
  colorRanges,
  onColorRangesChange,
  onFileUpload,
  selectedYear,
}: OperationPanelProps) => {
  const debouncedKeywordChange = useCallback(
    debounce((value: string) => onKeywordChange(value), 300),
    [onKeywordChange]
  )

  const debouncedDurationChange = useCallback(
    debounce((range: [number, number]) => onDurationRangeChange(range), 300),
    [onDurationRangeChange]
  )

  const handleRangeChange = (index: number, value: number) => {
    const newRanges = [...colorRanges];
    newRanges[index].minimum = value;
    onColorRangesChange(newRanges);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          Calendar Heatmap
        </h1>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Upload className="h-4 w-4" />
          <span>Import Data</span>
        </div>
        <div>
          <Input
            type="file"
            onChange={onFileUpload}
            accept=".json,.csv,.ics"
            multiple
            id="file-upload"
            className="hidden"
          />
          <Label 
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-4 py-2 w-full border rounded-md hover:bg-accent cursor-pointer transition-colors text-sm"
          >
            Choose files (.json, .csv, .ics)
          </Label>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Filter Data</span>
        </div>
        <Input
          value={keyword}
          onChange={(e) => {
            const value = e.target.value
            onKeywordChange(value)
            debouncedKeywordChange(value)
          }}
          placeholder="Search..."
        />
      </div>

      <div className="space-y-1.5">
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
              onDurationRangeChange(newRange)
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
              onDurationRangeChange(newRange)
              debouncedDurationChange(newRange)
            }}
            className="w-20"
          />
        </div>
      </div>

      <div className="space-y-4">
        <ThemePicker currentTheme={theme} onSelectTheme={onThemeChange} />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Settings2 className="h-4 w-4" />
              <span>Color Ranges</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust the minimum values for each color range.
            </p>
          </div>
          <div className="grid gap-4">
            {colorRanges.map((range, index) => (
              <div key={index} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Level {index + 1}</Label>
                  <Input
                    type="number"
                    value={range.minimum}
                    onChange={(e) => handleRangeChange(index, parseInt(e.target.value))}
                    className="w-20"
                    min={1}
                    max={24}
                  />
                </div>
                <Slider
                  value={[range.minimum]}
                  onValueChange={(value) => handleRangeChange(index, value[0])}
                  min={1}
                  max={24}
                  step={1}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
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
  selectedYear,
  onFileUpload,
}: OperationPanelProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-80 border-r shrink-0 h-screen">
        <div className="h-full overflow-y-auto">
          <div className="p-4 space-y-6">
            <SidebarContent
              keyword={keyword}
              onKeywordChange={onKeywordChange}
              durationRange={durationRange}
              onDurationRangeChange={onDurationRangeChange}
              theme={theme}
              onThemeChange={onThemeChange}
              colorRanges={colorRanges}
              onColorRangesChange={onColorRangesChange}
              selectedYear={selectedYear}
              onFileUpload={onFileUpload}
            />
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-6">
              <SidebarContent
                keyword={keyword}
                onKeywordChange={onKeywordChange}
                durationRange={durationRange}
                onDurationRangeChange={onDurationRangeChange}
                theme={theme}
                onThemeChange={onThemeChange}
                colorRanges={colorRanges}
                onColorRangesChange={onColorRangesChange}
                selectedYear={selectedYear}
                onFileUpload={onFileUpload}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 