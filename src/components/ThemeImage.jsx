import React, { useState, useEffect } from 'react';

// 根据主题动态切换图片的组件
const ThemeImage = ({ type, className = "", alt = "" }) => {
  const [imageSrc, setImageSrc] = useState('');

  // 根据DOM主题选择图片
  const updateImage = () => {
    const domTheme = document.documentElement.getAttribute('data-theme');
    const isLightTheme = domTheme === 'light';

    let path;
    switch (type) {
      case 'logo':
        path = isLightTheme ? '/logob.png' : '/logo.png';
        break;
      case 'menu':
        path = isLightTheme ? '/menub.png' : '/Menu.png';
        break;
      case 'close':
        path = isLightTheme ? '/closeb.png' : '/close.png';
        break;
      default:
        path = '/logo.png';
    }
    setImageSrc(path);
    console.log(`[ThemeImage] Updated ${type}: ${path} (domTheme: ${domTheme})`);
  };

  useEffect(() => {
    // 初始更新
    updateImage();

    // 监听DOM变化
    const observer = new MutationObserver(updateImage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 清理
    return () => observer.disconnect();
  }, [type]);

  return (
    <img
      src={imageSrc || null}
      alt={alt}
      className={className}
      key={`${type}-${imageSrc}`}
    />
  );
};

export default ThemeImage;
