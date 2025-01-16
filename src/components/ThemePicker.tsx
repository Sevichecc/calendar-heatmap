"use client";

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"
import { CustomThemeDialog } from "./CustomThemeDialog"
import { useState } from "react"

interface ThemePickerProps {
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
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
      [key: number]: {
        background: string;
        border: string;
        text: string;
      };
    };
  };
}

interface PresetTheme {
  name: string;
  value: string;
  preview: string;
}

interface SavedCustomTheme extends PresetTheme {
  colors: CustomTheme['colors'];
}

type ThemeType = 'light' | 'dark';

const PRESET_THEMES = {
  light: [
    { 
      name: "Gamboge", 
      value: "light/gamboge",
      preview: "rgba(228, 155, 15, 0.75)"
    },
    { 
      name: "Orange", 
      value: "light/orange",
      preview: "rgba( 255, 172, 28, 1 )"
    },
    { 
      name: "Purple", 
      value: "light/purple",
      preview: "rgba( 191, 64, 191, 1 )"
    },
    { 
      name: "Neon Blue", 
      value: "light/neon-blue",
      preview: "rgba( 31, 81, 255, 1 )"
    },
    { 
      name: "Red", 
      value: "light/red",
      preview: "rgba( 255, 0, 0, 1 )"
    },
    { 
      name: "Shamrock Green", 
      value: "light/shamrock-green",
      preview: "rgba( 0, 158, 96, 1 )"
    },
  ],
  dark: [
    { 
      name: "Bright Blue", 
      value: "dark/bright-blue",
      preview: "rgba( 0, 150, 255, 1 )"
    },
    { 
      name: "Bright Orange", 
      value: "dark/bright-orange",
      preview: "rgba( 255, 172, 28, 1 )"
    },
    { 
      name: "Bright Purple", 
      value: "dark/bright-purple",
      preview: "rgba( 191, 64, 191, 1 )"
    },
    { 
      name: "Bright Yellow", 
      value: "dark/bright-yellow",
      preview: "rgba( 255, 234, 0, 1 )"
    },
    { 
      name: "Cadmium Red", 
      value: "dark/cadmium-red",
      preview: "rgba( 210, 43, 43, 1 )"
    },
    { 
      name: "Github", 
      value: "dark/github",
      preview: "rgba( 57, 211, 83, 1 )"
    },
  ]
};

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  const [customThemes, setCustomThemes] = useState<SavedCustomTheme[]>([]);

  const handleSaveCustomTheme = (theme: CustomTheme) => {
    const themeValue = `custom/${theme.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    const cssVars = `
      [data-theme="${themeValue}"] {
        /* Colors */
        --heat-js-color-black: ${theme.colors.black};
        --heat-js-color-white: ${theme.colors.white};
        --heat-js-color-gray: ${theme.colors.gray};
        --heat-js-color-snow-white: ${theme.colors.black};

        /* Containers */
        --heat-js-container-background-color: ${theme.colors.container.background};
        --heat-js-container-border-color: ${theme.colors.container.border};

        /* ToolTip */
        --heat-js-tooltip-background-color: var(--heat-js-container-background-color);
        --heat-js-tooltip-border-color: var(--heat-js-container-border-color);
        --heat-js-tooltip-text-color: var(--heat-js-color-white);

        /* Year */
        --heat-js-years-background-color: var(--heat-js-container-background-color);
        --heat-js-years-border-color: var(--heat-js-container-border-color);
        --heat-js-years-text-color: var(--heat-js-color-black);
        --heat-js-years-background-color-hover: var(--heat-js-color-gray);
        --heat-js-years-text-color-hover: var(--heat-js-color-white);

        /* Title */
        --heat-js-title-opener-text-color-hover: rgb(109, 108, 108);
        --heat-js-title-background-color: var(--heat-js-container-background-color);
        --heat-js-title-border-color: var(--heat-js-container-border-color);
        --heat-js-title-text-color: var(--heat-js-color-black);
        --heat-js-title-background-color-hover: var(--heat-js-color-gray);
        --heat-js-title-text-color-hover: var(--heat-js-color-white);

        /* Days */
        --heat-js-day-background-color: var(--heat-js-color-black);
        --heat-js-day-border-color: var(--heat-js-color-gray);
        --heat-js-day-background-color-hover: var(--heat-js-container-border-color);

        /* Days - Colors */
        --heat-js-day-color-1-background-color: ${theme.colors.levels[1].background};
        --heat-js-day-color-1-border-color: ${theme.colors.levels[1].border};
        --heat-js-day-color-1-text-color: ${theme.colors.levels[1].text};
        --heat-js-day-color-2-background-color: ${theme.colors.levels[2].background};
        --heat-js-day-color-2-border-color: ${theme.colors.levels[2].border};
        --heat-js-day-color-2-text-color: ${theme.colors.levels[2].text};
        --heat-js-day-color-3-background-color: ${theme.colors.levels[3].background};
        --heat-js-day-color-3-border-color: ${theme.colors.levels[3].border};
        --heat-js-day-color-3-text-color: ${theme.colors.levels[3].text};
        --heat-js-day-color-4-background-color: ${theme.colors.levels[4].background};
        --heat-js-day-color-4-border-color: ${theme.colors.levels[4].border};
        --heat-js-day-color-4-text-color: ${theme.colors.levels[4].text};
      }
    `;

    const styleId = `theme-${themeValue}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = cssVars;

    setCustomThemes(prev => [...prev, {
      name: theme.name,
      value: themeValue,
      preview: theme.colors.levels[3].background,
      colors: theme.colors
    }]);
    
    onSelectTheme(themeValue);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Palette className="h-4 w-4" />
          <span>Theme</span>
        </div>
        <CustomThemeDialog onSave={handleSaveCustomTheme} />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start space-x-2 mt-0">
            <div className="flex items-center gap-2 w-full  ">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ 
                  backgroundColor: currentTheme.startsWith('custom/') 
                    ? customThemes.find(t => t.value === currentTheme)?.preview
                    : PRESET_THEMES[currentTheme.split('/')[0] as ThemeType]?.find(t => t.value === currentTheme)?.preview
                }}
              />
              <span>
                {currentTheme.split('/')[1].charAt(0).toUpperCase() + currentTheme.split('/')[1].slice(1)}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 max-h-[300px] overflow-y-auto" 
          align="start"
          side="right"
        >
          <div className="px-2 py-1.5 text-sm font-semibold">Light Themes</div>
          {PRESET_THEMES.light.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => onSelectTheme(theme.value)}
            >
              <div className="flex items-center gap-2 w-full">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: theme.preview }}
                />
                <span>{theme.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
          
          <div className="px-2 py-1.5 text-sm font-semibold mt-2">Dark Themes</div>
          {PRESET_THEMES.dark.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => onSelectTheme(theme.value)}
            >
              <div className="flex items-center gap-2 w-full">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: theme.preview }}
                />
                <span>{theme.name}</span>
              </div>
            </DropdownMenuItem>
          ))}

          {customThemes.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold mt-2">Custom Themes</div>
              {customThemes.map((theme) => (
                <DropdownMenuItem
                  key={theme.value}
                  onClick={() => onSelectTheme(theme.value)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: theme.colors.levels[3].background }}
                    />
                    <span>{theme.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 