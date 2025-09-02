import { useState, useEffect } from 'react';

// 主题类型
export const THEME_TYPES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
};

// 获取系统主题
const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark'; // 默认深色
};

// 获取当前主题
const getCurrentTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && Object.values(THEME_TYPES).includes(savedTheme)) {
      return savedTheme;
    }
  }
  return THEME_TYPES.SYSTEM;
};

// 应用主题到DOM
const applyTheme = (theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // 移除现有主题类
    root.classList.remove('theme-light', 'theme-dark');
    
    // 确定实际主题
    let actualTheme = theme;
    if (theme === THEME_TYPES.SYSTEM) {
      actualTheme = getSystemTheme();
    }
    
    // 应用主题类
    root.classList.add(`theme-${actualTheme}`);
    
    // 设置data属性供CSS使用
    root.setAttribute('data-theme', actualTheme);
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(THEME_TYPES.SYSTEM);
  const [actualTheme, setActualTheme] = useState('dark');

  // 初始化主题
  useEffect(() => {
    const savedTheme = getCurrentTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      if (theme === THEME_TYPES.SYSTEM) {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        applyTheme(THEME_TYPES.SYSTEM);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // 设置初始实际主题
    if (savedTheme === THEME_TYPES.SYSTEM) {
      setActualTheme(getSystemTheme());
    } else {
      setActualTheme(savedTheme);
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    let newTheme;
    if (theme === THEME_TYPES.SYSTEM) {
      newTheme = actualTheme === 'light' ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;
    } else if (theme === THEME_TYPES.LIGHT) {
      newTheme = THEME_TYPES.DARK;
    } else {
      newTheme = THEME_TYPES.LIGHT;
    }
    
    setTheme(newTheme);
    setActualTheme(newTheme === THEME_TYPES.SYSTEM ? getSystemTheme() : newTheme);
    
    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    
    applyTheme(newTheme);
  };

  // 设置特定主题
  const setSpecificTheme = (newTheme) => {
    if (Object.values(THEME_TYPES).includes(newTheme)) {
      setTheme(newTheme);
      setActualTheme(newTheme === THEME_TYPES.SYSTEM ? getSystemTheme() : newTheme);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
      
      applyTheme(newTheme);
    }
  };

  return {
    theme,
    actualTheme,
    toggleTheme,
    setSpecificTheme,
    isLight: actualTheme === 'light',
    isDark: actualTheme === 'dark',
    isSystem: theme === THEME_TYPES.SYSTEM
  };
};
