"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Upload, Download, Palette, Brush, Code } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";
import { useMediaQuery } from "../hooks/use-media-query"

interface CustomThemeDialogProps {
  onSave: (theme: CustomTheme) => void;
}

interface CustomTheme {
  name: string;
  colors: {
    black: string;
    white: string;
    gray: string;
    container: {
      background: string;
      border: string;
    };
    levels: {
      1: { background: string; border: string; text: string };
      2: { background: string; border: string; text: string };
      3: { background: string; border: string; text: string };
      4: { background: string; border: string; text: string };
    };
  };
}

type LevelKey = 1 | 2 | 3 | 4;

export function CustomThemeDialog({ onSave }: CustomThemeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("base");
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [theme, setTheme] = useState<CustomTheme>({
    name: "Custom Theme",
    colors: {
      black: "#F5F5F5",
      white: "#3b3a3a",
      gray: "#AAAAAA",
      container: {
        background: "#e8e6e6",
        border: "#3b3a3a",
      },
      levels: {
        1: {
          background: "rgba(228, 155, 15, 0.25)",
          border: "rgba(228, 155, 15, 0.15)",
          text: "#3b3a3a",
        },
        2: {
          background: "rgba(228, 155, 15, 0.50)",
          border: "rgba(228, 155, 15, 0.25)",
          text: "#3b3a3a",
        },
        3: {
          background: "rgba(228, 155, 15, 0.75)",
          border: "rgba(228, 155, 15, 0.50)",
          text: "#F5F5F5",
        },
        4: {
          background: "rgba(228, 155, 15, 1)",
          border: "rgba(228, 155, 15, 0.75)",
          text: "#F5F5F5",
        },
      },
    },
  });

  const ColorInput = ({ label, value, onChange }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void 
  }) => (
    <div className="grid w-full gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 p-1 h-9"
        />
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Custom Theme</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Customize your heatmap colors.
          </p>
        </div>
        <div className="space-y-1 p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("base")}
          >
            <Palette className="h-4 w-4" />
            Base Colors
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("levels")}
          >
            <Brush className="h-4 w-4" />
            Level Colors
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setActiveTab("preview")}
          >
            <Code className="h-4 w-4" />
            Custom CSS
          </Button>
        </div>
      </div>
      
      <div className="p-2 space-y-2 border-t">
        <Input
          type="file"
          accept=".json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const text = await file.text();
              const themeData = JSON.parse(text);
              setTheme(themeData);
            } catch (error) {
              console.error('Failed to parse theme file:', error);
            }
          }}
          className="hidden"
          id="theme-import"
        />
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => document.getElementById('theme-import')?.click()}
        >
          <Upload className="h-4 w-4" />
          Import Theme
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            const themeJson = JSON.stringify(theme, null, 2);
            const blob = new Blob([themeJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4" />
          Export Theme
        </Button>
      </div>
    </div>
  );

  const Content = () => (
    <div className="flex-1 h-[600px] overflow-y-auto p-6">
      {activeTab === "base" && (
        <div className="space-y-6">
          <div className="grid w-full gap-1.5">
            <Label>Theme Name</Label>
            <Input
              value={theme.name}
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4">
            <ColorInput
              label="Background Color"
              value={theme.colors.container.background}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    container: {
                      ...theme.colors.container,
                      background: value,
                    },
                  },
                })
              }
            />
            <ColorInput
              label="Border Color"
              value={theme.colors.container.border}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    container: {
                      ...theme.colors.container,
                      border: value,
                    },
                  },
                })
              }
            />
            <ColorInput
              label="Text Color"
              value={theme.colors.white}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    white: value,
                  },
                })
              }
            />
            <ColorInput
              label="Secondary Text Color"
              value={theme.colors.gray}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    gray: value,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {activeTab === "levels" && (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Level {level}</Label>
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{ 
                    backgroundColor: theme.colors.levels[level as LevelKey].background,
                    border: `1px solid ${theme.colors.levels[level as LevelKey].border}`
                  }}
                />
              </div>
              <div className="grid gap-4">
                <ColorInput
                  label="Background Color"
                  value={theme.colors.levels[level as LevelKey].background}
                  onChange={(value) =>
                    setTheme({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        levels: {
                          ...theme.colors.levels,
                          [level]: {
                            ...theme.colors.levels[level as LevelKey],
                            background: value,
                          },
                        },
                      },
                    })
                  }
                />
                <ColorInput
                  label="Border Color"
                  value={theme.colors.levels[level as LevelKey].border}
                  onChange={(value) =>
                    setTheme({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        levels: {
                          ...theme.colors.levels,
                          [level]: {
                            ...theme.colors.levels[level as LevelKey],
                            border: value,
                          },
                        },
                      },
                    })
                  }
                />
                <ColorInput
                  label="Text Color"
                  value={theme.colors.levels[level as LevelKey].text}
                  onChange={(value) =>
                    setTheme({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        levels: {
                          ...theme.colors.levels,
                          [level]: {
                            ...theme.colors.levels[level as LevelKey],
                            text: value,
                          },
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base">Custom CSS</Label>
            <div className="grid gap-2">
              <Textarea
                placeholder="Paste your CSS here..."
                className="h-32 font-mono"
                onChange={(e) => {
                  const text = e.target.value;
                  const vars = text.match(/--heat-js-[^:]+:\s*[^;]+/g);
                  if (!vars) return;

                  const newTheme = { ...theme };
                  vars.forEach(v => {
                    const [name, value] = v.split(/:\s*/);
                    const cleanValue = value.trim().replace(/;$/, '');

                    if (name.includes('day-color')) {
                      const level = name.match(/day-color-(\d)/)?.[1];
                      const type = name.includes('background') ? 'background' 
                        : name.includes('border') ? 'border' 
                        : 'text';
                      
                      if (level && newTheme.colors.levels[level as unknown as LevelKey]) {
                        newTheme.colors.levels[level as unknown as LevelKey][type] = cleanValue;
                      }
                    } else if (name === '--heat-js-container-background-color') {
                      newTheme.colors.container.background = cleanValue;
                    } else if (name === '--heat-js-container-border-color') {
                      newTheme.colors.container.border = cleanValue;
                    } else if (name === '--heat-js-color-white') {
                      newTheme.colors.white = cleanValue;
                    } else if (name === '--heat-js-color-gray') {
                      newTheme.colors.gray = cleanValue;
                    }
                  });

                  setTheme(newTheme);
                }}
              />
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const themeData = JSON.parse(text);
                      setTheme(themeData);
                    } catch (error) {
                      console.error('Failed to parse theme file:', error);
                    }
                  }}
                  className="hidden"
                  id="theme-import"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('theme-import')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Import Theme
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const themeJson = JSON.stringify(theme, null, 2);
                    const blob = new Blob([themeJson], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export Theme
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DialogFooter className="mt-6">
        <Button onClick={() => {
          onSave(theme);
          setIsOpen(false);
        }}>
          Save Theme
        </Button>
      </DialogFooter>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Custom Theme Settings</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col h-[80vh]">
            <Sidebar />
            <Content />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0">
        <DialogHeader>
          <DialogTitle>Custom Theme Settings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          <div className="w-[200px] border-r shrink-0 flex flex-col">
            <Sidebar />
          </div>
          <Content />
        </div>
      </DialogContent>
    </Dialog>
  );
} 