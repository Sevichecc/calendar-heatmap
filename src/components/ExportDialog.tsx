"use client";

import React, { useState } from "react";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Divide, Download, Image as ImageIcon, FileImage } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import "@/app/globals.css";
import "@/styles/heat-override.css";

interface ExportDialogProps {
  elementId: string;
  year: number;
}

const getExportStyles = (withBackground: boolean) => `
  .title-bar {
    display: none;      
  }

  #heat-map {
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    ${!withBackground ? 'background-color: transparent !important;' : ''}
  }

  .guide {
    display: none !important;
  }

  div.days {
    ${!withBackground ? 'background-color: transparent !important;' : ''}
  }

  div.map {
    ${!withBackground ? 'background-color: transparent !important;' : ''}
    padding: 20px !important;
  }

  div.heat-js {
    padding: 20px !important;
    margin: 0 !important;
    ${!withBackground ? 'background: transparent !important;' : ''}
  }

  div.month-name {
    padding: 4px !important;
    min-width: 30px !important;
    color: #64748b !important;
  }

  .export-userid {
    position: absolute !important;
    bottom: 15px !important;
    right: 20px !important;
    font-family: system-ui, -apple-system, sans-serif !important;
    font-size: 12px !important;
    color: #64748b !important;
    font-style: italic !important;
  }
`;

export function ExportDialog({ elementId, year }: ExportDialogProps) {
  const [userId, setUserId] = useState("");
  const [filename, setFilename] = useState(`heatmap-${year}`);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"png" | "jpeg" | "svg" | "avif">("png");
  const [withBackground, setWithBackground] = useState(true);
  const [showUserId, setShowUserId] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = 'auto';
    container.style.height = 'auto';
    container.style.backgroundColor = 'transparent';
    container.style.borderRadius = '8px';
    
    const clone = element.cloneNode(true) as HTMLElement;
    
    const style = document.createElement('style');
    style.textContent = getExportStyles(withBackground);
    container.appendChild(clone);
    container.appendChild(style);    

    if (showUserId && userId) {
      const userIdElement = document.createElement('div');
      userIdElement.className = 'export-userid';
      userIdElement.textContent = `@${userId}`;
      container.appendChild(userIdElement);
    }

    document.body.appendChild(container);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(container, {
        scale: scale,
        backgroundColor: 'transparent',
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${filename}${userId ? '-' + userId : ''}.${format}`;

      if (format === 'svg') {
        const svgData = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${container.innerHTML}
              </div>
            </foreignObject>
          </svg>
        `;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
      } else if (format === 'avif') {
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            'image/avif',
            0.8
          );
        });
        link.href = URL.createObjectURL(blob);
      } else {
        link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined);
      }
      
      link.click();
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Heatmap</DialogTitle>
          <DialogDescription>
            Configure the export settings and download your heatmap as a PNG image.
          </DialogDescription>
        </DialogHeader>
        <hr/>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label>Filename</Label>
              <Input
                placeholder="heatmap-2024"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label>User ID</Label>
              <Input
                placeholder="@username"
                value={userId}
                onChange={(e) => setUserId(e.target.value.replace(/^@/, ""))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label>Scale</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    min={1}
                    max={4}
                    step={1}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    × original size
                  </span>
                </div>
              </div>

              <div className="grid w-full gap-1.5">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>PNG</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="jpeg">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        <span>JPEG</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="svg">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        <span>SVG</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="avif">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>AVIF</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid w-full gap-2">
              <Label>Options</Label>
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="background"
                    checked={withBackground}
                    onCheckedChange={(checked) => setWithBackground(checked as boolean)}
                  />
                  <Label htmlFor="background" className="text-sm font-normal">
                    Include white background
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-userid"
                    checked={showUserId}
                    onCheckedChange={(checked) => setShowUserId(checked as boolean)}
                  />
                  <Label htmlFor="show-userid" className="text-sm font-normal">
                    Show user ID
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download {format.toUpperCase()}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 