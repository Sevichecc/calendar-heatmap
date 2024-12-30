"use client";

import React, { useState, useRef, useEffect } from "react";
import { exportComponentAsPNG } from "react-component-export-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportDialogProps {
  elementId: string;
  year: number;
}

type SizeKey = 'small' | 'medium' | 'large' | 'original';

type SizeConfig = {
  scale: number;
};

const SIZES: Record<SizeKey, SizeConfig> = {
  'small': { scale: 1 },
  'medium': { scale: 1.5 },
  'large': { scale: 2 },
  'original': { scale: 2 }
};

const ExportComponent = React.forwardRef<HTMLDivElement, { title: string; userId?: string; children: React.ReactNode }>(
  ({ title, userId, children }, ref) => (
    <div ref={ref} className="p-8 bg-white">
      <div className="mb-6 text-[1.75rem] font-semibold font-mono text-[#1a1a1a]">
        {title}
      </div>
      {userId && (
        <div className="mb-4 text-lg text-gray-600 font-mono">
          @{userId}
        </div>
      )}
      <div className="export-content">
        {children}
      </div>
    </div>
  )
);
ExportComponent.displayName = 'ExportComponent';

export function ExportDialog({ elementId, year }: ExportDialogProps) {
  const [title, setTitle] = useState(`Calendar Heatmap ${year}`);
  const [userId, setUserId] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<SizeKey>('medium');
  const exportRef = useRef<HTMLDivElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    setPreviewHtml(document.getElementById(elementId)?.outerHTML || '');
  }, [elementId]);

  const handleExport = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    try {
      await exportComponentAsPNG(exportRef as React.RefObject<HTMLDivElement>, {
        fileName: title.toLowerCase().replace(/\s+/g, "-"),
        html2CanvasOptions: {
          backgroundColor: "white",
          scale: SIZES[size].scale,
          useCORS: true,
          logging: true,
          allowTaint: true,
          foreignObjectRendering: true
        }
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export Heatmap</DialogTitle>
            <DialogDescription>
              Customize and export your heatmap as an image
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userId">User ID (optional)</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Size</Label>
              <Select value={size} onValueChange={(value: SizeKey) => setSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="original">Original Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Preview</Label>
              <div className="w-full border rounded-lg overflow-auto bg-background">
                <ExportComponent ref={exportRef} title={title} userId={userId}>
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </ExportComponent>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <span className="mr-2">Exporting...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                'Export'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 