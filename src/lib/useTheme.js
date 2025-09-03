import { useState, useEffect, useRef } from 'react';

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
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  // 初始化主题 & 监听系统主题变化
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
    
    // 监听系统主题变化（仅当当前为 system 模式时响应）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      console.log('[Theme Debug] System theme change detected!');
      if (themeRef.current === THEME_TYPES.SYSTEM) {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        applyTheme(THEME_TYPES.SYSTEM);
        console.log('[Theme Debug] Applied system theme change to:', newActualTheme);
      } else {
        console.log('[Theme Debug] Ignored system change because current theme is:', themeRef.current);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    console.log('[Theme Debug] System theme listener added');

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 切换主题时使用sessionStorage
  const toggleTheme = () => {
    let newTheme;
    if (theme === THEME_TYPES.SYSTEM) {
      // 如果是系统模式，切换到相反的明确主题
      newTheme = actualTheme === 'light' ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;
    } else {
      // 在 LIGHT/DARK 之间切换
      newTheme = theme === THEME_TYPES.LIGHT ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;
    }
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
          sessionStorage.setItem('theme', THEME_TYPES.SYSTEM); // 显式写入 system，避免读取不一致
        } else {
          sessionStorage.setItem('theme', newTheme);
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
