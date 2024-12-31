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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import "@/app/globals.css";
import "@/styles/heat-override.css";
interface ExportDialogProps {
  elementId: string;
  year: number;
}

export function ExportDialog({ elementId, year }: ExportDialogProps) {
  const [userId, setUserId] = useState("");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(600);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // 创建一个临时容器
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = `${width}px`;
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '20px';
    container.style.borderRadius = '8px';
    
    // 克隆整个元素
    const clone = element.cloneNode(true) as HTMLElement;
    
    // 添加基础样式
    const style = document.createElement('style');
    style.textContent = `
      .title-bar {
        display: none;      
      }

      #heat-map {
        background-color: transparent;
        border: none;
      }

      .guide {
        display: none !important;
      }

      div.days {
        background-color: transparent !important;
      }

      div.map {
        background-color: transparent !important;
      }

    `;
    container.appendChild(clone);
    container.appendChild(style);    
    // 如果有用户 ID，添加到底部
    if (userId) {
      const userIdElement = document.createElement('div');
      userIdElement.style.position = 'absolute';
      userIdElement.style.bottom = '15px';
      userIdElement.style.right = '20px';
      userIdElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      userIdElement.style.fontSize = '14px';
      userIdElement.style.color = '#020617';
      userIdElement.textContent = `@${userId}`;
      container.appendChild(userIdElement);
    }

    document.body.appendChild(container);

    try {
      // 等待样式应用
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: 'transparent',
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `heatmap-${year}${userId ? '-' + userId : ''}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Heatmap</DialogTitle>
          <DialogDescription>
            Configure the export settings and download your heatmap as a PNG image.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>User ID</Label>
                <Input
                  placeholder="@username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/^@/, ""))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Size</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={800}
                    max={2400}
                    step={100}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">×</span>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={400}
                    max={1200}
                    step={100}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 