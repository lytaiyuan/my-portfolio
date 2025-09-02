import React, { useState, useEffect } from 'react';
import { useTheme } from '../lib/useTheme';

// 根据主题动态切换图片的组件
const ThemeImage = ({ type, className = "", alt = "", ...props }) => {
  const { isLight, actualTheme } = useTheme();
  const [currentImageSrc, setCurrentImageSrc] = useState('');
  
  // 直接从DOM获取当前主题，确保一致性
  const getCurrentThemeFromDOM = () => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme');
    }
    return 'dark'; // 默认值
  };
  
  // 根据类型和主题返回对应的图片路径
  const getImageSrc = () => {
    const domTheme = getCurrentThemeFromDOM();
    console.log(`[ThemeImage] type: ${type}, isLight: ${isLight}, actualTheme: ${actualTheme}, DOM theme: ${domTheme}`);
    
    // 优先使用DOM中的主题状态
    const currentTheme = domTheme || actualTheme;
    const isLightTheme = currentTheme === 'light';
    
    let imagePath;
    switch (type) {
      case 'logo':
        imagePath = isLightTheme ? '/logob.png' : '/logo.png';
        break;
      case 'menu':
        imagePath = isLightTheme ? '/menub.png' : '/Menu.png';
        break;
      case 'close':
        imagePath = isLightTheme ? '/closeb.png' : '/close.png';
        break;
      default:
        imagePath = '/logo.png';
    }
    
    console.log(`[ThemeImage] ${type}: ${imagePath} (based on DOM theme: ${currentTheme})`);
    return imagePath;
  };
  
  // 监听主题变化并更新图片
  useEffect(() => {
    const updateImage = () => {
      const newSrc = getImageSrc();
      setCurrentImageSrc(newSrc);
    };
    
    // 初始设置
    updateImage();
    
    // 监听DOM属性变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateImage();
        }
      });
    });
    
    // 开始监听
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
    
    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [type, isLight, actualTheme]);
  
  // 使用状态中的图片路径
  const imageSrc = currentImageSrc || getImageSrc();
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      key={`${type}-${actualTheme}`}
      {...props}
    />
  );
};

export default ThemeImage;
