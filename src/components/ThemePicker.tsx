"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Theme {
  name: string;
  color: string;
}

interface ThemePickerProps {
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
}

const themes: {
  dark: Theme[];
  light: Theme[];
} = {
  dark: [
    { name: 'bright-blue', color: '#4A90E2' },
    { name: 'bright-orange', color: '#FF9F40' },
    { name: 'bright-purple', color: '#B07FDD' },
    { name: 'bright-yellow', color: '#FFD93D' },
    { name: 'cadmium-red', color: '#E74C3C' },
    { name: 'github', color: '#196127' }
  ],
  light: [
    { name: 'orange', color: '#FFA500' },
    { name: 'purple', color: '#9B59B6' },
    { name: 'gamboge', color: '#E49B0F' },
    { name: 'neon-blue', color: '#1E90FF' },
    { name: 'red', color: '#E74C3C' },
    { name: 'shamrock-green', color: '#2ECC71' }
  ]
};

const formatThemeName = (themeName: string) => {
  return themeName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  // 一次性加载所有主题
  useEffect(() => {
    const loadAllThemes = () => {
      let container = document.getElementById('theme-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'theme-container';
        document.head.appendChild(container);

        // 加载所有主题
        const allThemes = [
          ...themes.dark.map(theme => ({ name: theme.name, type: 'dark' })),
          ...themes.light.map(theme => ({ name: theme.name, type: 'light' }))
        ];

        allThemes.forEach(({ name, type }) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `/heat.js/themes/${type}/${name}.css`;
          link.dataset.theme = `${type}/${name}`;
          link.disabled = true;
          // 确保 container 不为 null
          if (container) {
            container.appendChild(link);
          }
        });
      }

      if (container) {
        // 禁用所有主题
        container.querySelectorAll('link').forEach(link => {
          link.disabled = true;
        });

        // 启用当前主题
        const currentThemeLink = container.querySelector(`[data-theme="${currentTheme}"]`) as HTMLLinkElement;
        if (currentThemeLink) {
          currentThemeLink.disabled = false;
        }
      }
    };

    loadAllThemes();

    return () => {
      const container = document.getElementById('theme-container');
      if (container) {
        document.head.removeChild(container);
      }
    };
  }, [currentTheme]);

  return (
    <Select value={currentTheme} onValueChange={onSelectTheme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a theme">
          {currentTheme && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ 
                  backgroundColor: themes[currentTheme.split('/')[0] as 'dark' | 'light']
                    .find(t => t.name === currentTheme.split('/')[1])?.color 
                }} 
              />
              {formatThemeName(currentTheme.split('/')[1])}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="px-2">
          <SelectLabel className="font-semibold">Light Themes</SelectLabel>
          {themes.light.map(theme => (
            <SelectItem key={theme.name} value={`light/${theme.name}`}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: theme.color }} 
                />
                {formatThemeName(theme.name)}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        <div className="h-px bg-gray-100 my-2" />
        <SelectGroup className="px-2">
          <SelectLabel className="font-semibold">Dark Themes</SelectLabel>
          {themes.dark.map(theme => (
            <SelectItem key={theme.name} value={`dark/${theme.name}`}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: theme.color }} 
                />
                {formatThemeName(theme.name)}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
} 