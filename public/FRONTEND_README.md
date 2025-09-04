# 前端集成指南 - 公开仓库版本

## 🎯 项目概述

这是一个React作品集网站的数据仓库，所有内容数据已迁移到GitHub公开仓库。前端可以直接通过GitHub的raw文件URL访问数据，无需认证。

## 🌐 仓库信息

- **仓库**: `lytaiyuan/my-portfolio-data`
- **类型**: 公开仓库
- **分支**: `main`
- **访问方式**: 直接通过GitHub raw文件URL

## 📁 文件结构

```
my-portfolio-data/
├── config/                    # 配置文件目录
│   ├── photos.json           # 照片配置 (24张照片)
│   ├── music.json            # 音乐配置 (2首音乐)
│   ├── videos.json           # 视频配置 (3个视频)
│   └── graphiccontent.json   # 平面设计配置 (1个项目)
├── photos/                    # 照片文件目录
│   ├── 1.jpg, 2.jpg, 3.jpg... # 24张照片文件
│   └── DSC*.jpg              # 原始相机文件
├── music/                     # 音乐相关文件
│   ├── Epic/                 # Epic音乐项目
│   │   ├── cover.jpg         # 封面
│   │   ├── Epic.txt          # 描述文件
│   │   └── score/            # 乐谱图片
│   └── AnotherSong/          # Another Song项目
│       ├── cover.jpg         # 封面
│       ├── AnotherSong.txt   # 描述文件
│       └── score/            # 乐谱图片
├── videos/                    # 视频相关文件
│   ├── yuntingfinal/         # 听见自己，听见你
│   ├── 2023/                 # 流转2023
│   └── weishan/              # 巍山烟雨
├── graphic/                   # 平面设计文件
│   └── km/                   # 春城湖畔度假村项目
├── packaging/                 # 包装设计文件
│   ├── bupin/                # 补品包装设计
│   └── oufen/                # 藕粉包装设计
├── vi/                        # VI设计文件
│   └── km/                   # 品牌视觉手册
├── home/                      # 主页相关文件
│   └── design/               # 主页设计元素
├── hero.json                  # 主页英雄区域配置
├── packaging.json             # 包装设计配置
├── vi.json                    # VI设计配置
└── productphotos.json         # 产品照片配置
```

## 🔗 直接访问URL

### 配置文件
- **照片配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/photos.json`
- **音乐配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/music.json`
- **视频配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/videos.json`
- **平面设计配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/graphiccontent.json`
- **英雄区域配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/hero.json`
- **包装设计配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/packaging.json`
- **VI设计配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/vi.json`
- **产品照片配置**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/productphotos.json`

### 媒体文件
- **照片**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/photos/`
- **音乐**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/music/`
- **视频**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/videos/`
- **设计**: `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/graphic/`

## 📊 数据格式

### 照片配置示例 (photos.json)
```json
{
  "version": "2025.08.29-1",
  "items": [
    {
      "id": 1,
      "url": "/photos/DSC01227.jpg",
      "title": "仰望",
      "tags": ["女人","民族","室内"],
      "w": 4314,
      "h": 6471,
      "desc": "位于云南省红河彝族哈尼族自治州，via：王默涵。"
    }
  ]
}
```

### 音乐配置示例 (music.json)
```json
{
  "version": "2025.01.29-1",
  "items": [
    {
      "id": 1,
      "slug": "epic",
      "title": "Epic",
      "hottitle": "史诗级配乐",
      "cover": "/music/Epic/cover.jpg",
      "duration": "3:45"
    }
  ]
}
```

## 🔧 前端集成步骤

### 1. 替换数据获取逻辑

将原来的静态导入改为fetch API调用：

**原来:**
```javascript
import photosData from '../../public/photos.json';
const photos = photosData.items;
```

**改为:**
```javascript
const [photos, setPhotos] = useState([]);

useEffect(() => {
  const fetchPhotos = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/photos.json'
      );
      const data = await response.json();
      setPhotos(data.items);
    } catch (error) {
      console.error('获取照片失败:', error);
    }
  };
  
  fetchPhotos();
}, []);
```

### 2. 修改媒体文件路径

将JSON中的相对路径改为完整的GitHub raw URL：

```javascript
// 原来的相对路径
<img src="/photos/image.jpg" alt="照片" />

// 改为完整的GitHub URL
<img src="https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/photos/image.jpg" alt="照片" />
```

### 3. 创建路径转换函数

```javascript
const getGitHubUrl = (path) => {
  if (path.startsWith('http')) {
    return path; // 如果是外部链接，直接返回
  }
  return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${path}`;
};

// 使用示例
<img src={getGitHubUrl(photo.url)} alt={photo.title} />
```

## 📝 具体页面修改示例

### Photos.jsx
```javascript
import { useState, useEffect } from 'react';

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/photos.json'
        );
        const data = await response.json();
        setPhotos(data.items);
      } catch (error) {
        console.error('获取照片失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const getGitHubUrl = (path) => {
    return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${path}`;
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {photos.map(photo => (
        <div key={photo.id}>
          <img 
            src={getGitHubUrl(photo.url)} 
            alt={photo.title} 
          />
          <h3>{photo.title}</h3>
          <p>{photo.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default Photos;
```

### Music.jsx
```javascript
import { useState, useEffect } from 'react';

function Music() {
  const [musicItems, setMusicItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/music.json'
        );
        const data = await response.json();
        setMusicItems(data.items);
      } catch (error) {
        console.error('获取音乐失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  const getGitHubUrl = (path) => {
    return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${path}`;
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {musicItems.map(item => (
        <div key={item.id}>
          <img 
            src={getGitHubUrl(item.cover)} 
            alt={item.title} 
          />
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

export default Music;
```

## ✅ 优势

1. **简单直接**: 无需认证，直接访问文件
2. **性能更好**: 通过GitHub CDN加速
3. **易于维护**: 本地修改后推送到GitHub即可更新
4. **无限制**: 没有API请求频率限制

## 🚀 部署步骤

1. 在GitHub上将仓库改为公开
2. 推送所有数据文件
3. 修改前端代码使用GitHub raw URL
4. 测试所有页面功能

---

**注意**: 这是一个公开仓库，所有内容对公众可见，适合作品集展示使用。
