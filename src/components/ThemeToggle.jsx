import React from 'react';
import { useTheme } from '../lib/useTheme';

// 太阳图标组件
const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
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
const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// 主题切换按钮组件
const ThemeToggle = ({ variant = 'desktop', className = '' }) => {
  const { isLight, toggleTheme } = useTheme();
  
  // 桌面端样式
  if (variant === 'desktop') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isLight 
            ? 'border-gray-300/20 bg-white/20 text-gray-700 hover:bg-white/30 focus:ring-blue-500' 
            : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 focus:ring-blue-400'
        } ${className}`}
        title={isLight ? '切换到深色模式' : '切换到浅色模式'}
        aria-label={isLight ? '切换到深色模式' : '切换到浅色模式'}
      >
        {isLight ? <MoonIcon /> : <SunIcon />}
      </button>
    );
  }
  
  // 手机端样式 - 与菜单关闭按钮保持一致
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isLight 
          ? 'border-gray-300/20 bg-white/20 text-gray-700 hover:bg-white/30 focus:ring-blue-500' 
          : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 focus:ring-blue-400'
      } ${className}`}
      title={isLight ? '切换到深色模式' : '切换到浅色模式'}
      aria-label={isLight ? '切换到深色模式' : '切换到浅色模式'}
    >
      {isLight ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </button>
  );
};

export default ThemeToggle;
