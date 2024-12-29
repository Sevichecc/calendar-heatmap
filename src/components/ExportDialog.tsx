"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
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
  width: number | null;
  scale: number;
};

const SIZES: Record<SizeKey, SizeConfig> = {
  'small': { width: 800, scale: 1 },
  'medium': { width: 1200, scale: 1.5 },
  'large': { width: 1600, scale: 2 },
  'original': { width: null, scale: 2 }
};

export function ExportDialog({ elementId, year }: ExportDialogProps) {
  const [title, setTitle] = useState(`Calendar Heatmap ${year}`);
  const [userId, setUserId] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<SizeKey>('medium');
  const exportWrapperRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(elementId);
      if (!element || !exportWrapperRef.current) return;

      const wrapper = exportWrapperRef.current;
      wrapper.innerHTML = '';
      
      // 创建导出容器
      const exportContainer = document.createElement("div");
      exportContainer.style.padding = "2rem";
      exportContainer.style.backgroundColor = "white";
      exportContainer.style.position = "relative";
      
      // 添加标题
      const titleElement = document.createElement("div");
      titleElement.style.marginBottom = "1.5rem";
      titleElement.style.fontSize = "1.75rem";
      titleElement.style.fontWeight = "600";
      titleElement.style.fontFamily = "var(--font-mono)";
      titleElement.style.color = "#1a1a1a";
      titleElement.textContent = title;
      exportContainer.appendChild(titleElement);

      // 添加用户ID（如果有）
      if (userId) {
        const userIdElement = document.createElement("div");
        userIdElement.style.marginBottom = "1rem";
        userIdElement.style.fontSize = "1.125rem";
        userIdElement.style.color = "#666";
        userIdElement.style.fontFamily = "var(--font-mono)";
        userIdElement.textContent = `@${userId}`;
        exportContainer.appendChild(userIdElement);
      }

      // 添加热图容器
      const heatmapContainer = document.createElement("div");
      heatmapContainer.style.position = "relative";
      
      // 克隆地图内容和图例
      const mapContents = element.querySelector('.map-contents');
      const guide = element.querySelector('.guide');
      
      if (!mapContents || !guide) {
        console.error('Required elements not found');
        return;
      }

      const mapClone = mapContents.cloneNode(true) as HTMLElement;
      const guideClone = guide.cloneNode(true) as HTMLElement;
      
      // 确保地图内容可见
      mapClone.style.display = 'block';
      mapClone.style.minHeight = 'unset';
      
      heatmapContainer.appendChild(mapClone);
      heatmapContainer.appendChild(guideClone);
      exportContainer.appendChild(heatmapContainer);
      wrapper.appendChild(exportContainer);

      // 等待样式和图像加载
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(exportContainer, {
        backgroundColor: "white",
        scale: SIZES[size].scale,
        useCORS: true,
        logging: true,
        allowTaint: true,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // 确保所有样式都被复制
          const styles = document.getElementsByTagName('style');
          Array.from(styles).forEach(style => {
            clonedDoc.head.appendChild(style.cloneNode(true));
          });
        }
      });

      // 下载图片
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Generate preview
      const generatePreview = () => {
        const element = document.getElementById(elementId);
        if (!element || !previewRef.current) return;
    
        previewRef.current.innerHTML = '';
        
        // 创建预览容器
        const previewContainer = document.createElement("div");
        previewContainer.style.padding = "2rem";
        previewContainer.style.backgroundColor = "white";
        previewContainer.style.width = "100%";
        previewContainer.style.height = "100%";
        
        // 添加标题
        const titleElement = document.createElement("div");
        titleElement.style.marginBottom = "1.5rem";
        titleElement.style.fontSize = "1.25rem";
        titleElement.style.fontWeight = "600";
        titleElement.style.fontFamily = "var(--font-mono)";
        titleElement.style.color = "#1a1a1a";
        titleElement.textContent = title;
        previewContainer.appendChild(titleElement);
    
        // 添加用户ID（如果有）
        if (userId) {
          const userIdElement = document.createElement("div");
          userIdElement.style.marginBottom = "1rem";
          userIdElement.style.fontSize = "0.875rem";
          userIdElement.style.color = "#666";
          userIdElement.style.fontFamily = "var(--font-mono)";
          userIdElement.textContent = `@${userId}`;
          previewContainer.appendChild(userIdElement);
        }
    
        // 添加热图容器
        const heatmapContainer = document.createElement("div");
        const width = SIZES[size].width;
        if (width !== null) {
          const scale = Math.min(1, previewRef.current.offsetWidth / element.offsetWidth * 0.8);
          heatmapContainer.style.transform = `scale(${scale})`;
          heatmapContainer.style.transformOrigin = 'top left';
        }
        
        const heatmapClone = element.cloneNode(true) as HTMLElement;
        heatmapContainer.appendChild(heatmapClone);
        previewContainer.appendChild(heatmapContainer);
        previewRef.current.appendChild(previewContainer);
      };

      generatePreview();
    }
  }, [isOpen, title, userId, size, elementId]);

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
                  <SelectItem value="small">Small (800px)</SelectItem>
                  <SelectItem value="medium">Medium (1200px)</SelectItem>
                  <SelectItem value="large">Large (1600px)</SelectItem>
                  <SelectItem value="original">Original Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Preview</Label>
              <div 
                ref={previewRef} 
                className="w-full h-[300px] border rounded-lg overflow-auto bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <div ref={exportWrapperRef} className="hidden" />
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

      <div 
        ref={exportWrapperRef}
        id="export-wrapper"
        className="fixed left-[-9999px] p-8 bg-white rounded-lg"
        style={{ width: 'fit-content' }}
      />
    </>
  );
} 