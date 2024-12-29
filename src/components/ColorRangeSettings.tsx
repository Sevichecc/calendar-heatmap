"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2 } from "lucide-react";

interface ColorRange {
  minimum: number;
  cssClassName: string;
}

interface ColorRangeSettingsProps {
  ranges: ColorRange[];
  onRangesChange: (ranges: ColorRange[]) => void;
}

export function ColorRangeSettings({ ranges, onRangesChange }: ColorRangeSettingsProps) {
  const handleRangeChange = (index: number, value: number) => {
    const newRanges = [...ranges];
    newRanges[index].minimum = value;
    onRangesChange(newRanges);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Color Ranges</h4>
            <p className="text-sm text-muted-foreground">
              Adjust the minimum values for each color range.
            </p>
          </div>
          <div className="grid gap-4">
            {ranges.map((range, index) => (
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
      </PopoverContent>
    </Popover>
  );
} 