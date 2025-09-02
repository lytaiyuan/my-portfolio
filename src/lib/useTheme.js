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
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const isLight = mediaQuery.matches;
    console.log('[Theme Debug] System theme detected:', isLight ? 'light' : 'dark');
    return isLight ? 'light' : 'dark';
  }
  console.log('[Theme Debug] No matchMedia support, defaulting to dark');
  return 'dark'; // 默认深色
};

// 获取当前主题（从sessionStorage）
const getCurrentTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = sessionStorage.getItem('theme');
    // 只返回有效的主题设置，否则返回 null 让调用方处理
    if (savedTheme && Object.values(THEME_TYPES).includes(savedTheme)) {
      return savedTheme;
    }
  }
  // 返回 null 表示没有保存的主题设置
  return null;
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
    
    console.log('[Theme Debug] Applying theme:', theme, '-> actual:', actualTheme);
    
    // 应用主题类
    root.classList.add(`theme-${actualTheme}`);
    
    // 设置data属性供CSS使用
    root.setAttribute('data-theme', actualTheme);
    
    console.log('[Theme Debug] DOM updated, data-theme =', root.getAttribute('data-theme'));
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(THEME_TYPES.SYSTEM);
  const [actualTheme, setActualTheme] = useState(() => {
    // 初始化时立即检测系统主题
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark'; // 默认深色
  });

  // 初始化主题
  useEffect(() => {
    const savedTheme = getCurrentTheme();
    if (!savedTheme) {
      setTheme(THEME_TYPES.SYSTEM);
      const systemTheme = getSystemTheme();
      setActualTheme(systemTheme);
      applyTheme(THEME_TYPES.SYSTEM);
    } else {
      setTheme(savedTheme);
      setActualTheme(savedTheme);
      applyTheme(savedTheme);
    }
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      console.log('[Theme Debug] System theme change detected!');
      // 检查当前保存的主题设置
      const currentSavedTheme = localStorage.getItem('theme') || THEME_TYPES.SYSTEM;
      console.log('[Theme Debug] Current saved theme:', currentSavedTheme);
      if (currentSavedTheme === THEME_TYPES.SYSTEM) {
        console.log('[Theme Debug] Following system theme change');
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        applyTheme(THEME_TYPES.SYSTEM);
      } else {
        console.log('[Theme Debug] Not following system theme, using saved theme:', currentSavedTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    console.log('[Theme Debug] System theme listener added');
    
    // 添加 polling 机制（每秒检查一次）
    const interval = setInterval(() => {
      if (theme === THEME_TYPES.SYSTEM) {
        const currentSystemTheme = getSystemTheme();
        if (currentSystemTheme !== actualTheme) {
          setActualTheme(currentSystemTheme);
          applyTheme(THEME_TYPES.SYSTEM);
          console.log('[Theme Debug] Polling detected system change to:', currentSystemTheme);
        }
      }
    }, 1000);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearInterval(interval);
    };
  }, [theme]); // 移除 theme 依赖，避免无限循环

  // 切换主题时使用sessionStorage
  const toggleTheme = () => {
    let newTheme = theme === THEME_TYPES.LIGHT ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;
    setTheme(newTheme);
    setActualTheme(newTheme);
    sessionStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // 设置特定主题
  const setSpecificTheme = (newTheme) => {
    if (Object.values(THEME_TYPES).includes(newTheme)) {
      setTheme(newTheme);
      setActualTheme(newTheme === THEME_TYPES.SYSTEM ? getSystemTheme() : newTheme);
      
      if (typeof window !== 'undefined') {
        if (newTheme === THEME_TYPES.SYSTEM) {
          localStorage.removeItem('theme'); // 跟随系统时清除保存的设置
        } else {
          localStorage.setItem('theme', newTheme);
        }
      }
      
      applyTheme(newTheme);
    }
  };

  // 移除resetToSystem函数

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
