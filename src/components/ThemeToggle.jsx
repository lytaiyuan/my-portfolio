import React from 'react';
import { useTheme } from '../lib/useTheme';

// 太阳图标组件
const SunIcon = ({ className = "w-5 h-5", strokeWidth = 2 }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// 月亮图标组件
const MoonIcon = ({ className = "w-5 h-5", strokeWidth = 2 }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// 主题切换按钮组件
const ThemeToggle = ({ variant = 'desktop', className = '', useToolbarThemeStyle = false }) => {
  const { isLight, toggleTheme } = useTheme();
  
  // 与工具栏菜单按钮一致的样式
  const toolbarStyle = 'p-2 rounded-lg border border-theme-primary bg-theme-card/80';

  // 原桌面样式（保留以便在非工具栏场景使用）
  const desktopStyle = `p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    isLight 
      ? 'border-gray-300/20 bg-white/20 text-gray-700 hover:bg-white/30 focus:ring-blue-500' 
      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 focus:ring-blue-400'
  }`;

  const iconClass = useToolbarThemeStyle 
    ? 'w-4 h-4' // 与菜单图标一致 16px
    : (variant === 'desktop' ? 'w-5 h-5' : 'w-6 h-6');
  const iconStroke = useToolbarThemeStyle ? 1.5 : 2;

  // 桌面端样式
  if (variant === 'desktop') {
    return (
      <button
        onClick={toggleTheme}
        className={`${useToolbarThemeStyle ? toolbarStyle : desktopStyle} ${className}`}
        title={isLight ? '切换到深色模式' : '切换到浅色模式'}
        aria-label={isLight ? '切换到深色模式' : '切换到浅色模式'}
      >
        {isLight ? <MoonIcon className={iconClass} strokeWidth={iconStroke} /> : <SunIcon className={iconClass} strokeWidth={iconStroke} />}
      </button>
    );
  }
  
  // 手机端样式 - 工具栏按钮与菜单键对称
  return (
    <button
      onClick={toggleTheme}
      className={`${useToolbarThemeStyle ? toolbarStyle : desktopStyle} ${className}`}
      title={isLight ? '切换到深色模式' : '切换到浅色模式'}
      aria-label={isLight ? '切换到深色模式' : '切换到浅色模式'}
    >
      {isLight ? <MoonIcon className={iconClass} strokeWidth={iconStroke} /> : <SunIcon className={iconClass} strokeWidth={iconStroke} />}
    </button>
  );
};

export default ThemeToggle;
