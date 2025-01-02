"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  onExport: () => void;
}

export function DownloadButton({ onExport }: DownloadButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={onExport}
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
} 