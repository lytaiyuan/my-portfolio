# 前端集成指南

本指南说明如何将现有的React作品集网站从本地文件读取改为从GitHub仓库读取数据。

## 1. 安装GitHub数据访问工具

将 `utils/github-data.js` 文件复制到您的前端项目中。

## 2. 修改数据服务配置

在 `utils/github-data.js` 中，修改仓库信息：

```javascript
// 修改为您的GitHub用户名和仓库名
const defaultService = new GitHubDataService('your-username', 'my-portfolio-data');
```

## 3. 替换现有的数据获取逻辑

### 3.1 照片页面 (Photos.jsx)

**原来的代码:**
```javascript
import photosData from '../../public/photos.json';

// 在组件中使用
const photos = photosData.items;
```

**修改后的代码:**
```javascript
import { defaultService } from '../../utils/github-data';
import { useState, useEffect } from 'react';

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const data = await defaultService.getPhotos();
        setPhotos(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;

  // 渲染照片列表
  return (
    <div>
      {photos.map(photo => (
        <div key={photo.id}>
          <img 
            src={defaultService.getImageUrl(photo.url)} 
            alt={photo.title} 
          />
          <h3>{photo.title}</h3>
          <p>{photo.desc}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3.2 音乐页面 (Music.jsx)

**原来的代码:**
```javascript
import musicData from '../../public/music.json';

// 在组件中使用
const musicItems = musicData.items;
```

**修改后的代码:**
```javascript
import { defaultService } from '../../utils/github-data';
import { useState, useEffect } from 'react';

function Music() {
  const [musicItems, setMusicItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        const data = await defaultService.getMusic();
        setMusicItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;

  return (
    <div>
      {musicItems.map(item => (
        <div key={item.id}>
          <img 
            src={defaultService.getImageUrl(item.cover)} 
            alt={item.title} 
          />
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3.3 视频页面 (Videos.jsx)

**原来的代码:**
```javascript
import videosData from '../../public/videos.json';

// 在组件中使用
const videos = videosData.items;
```

**修改后的代码:**
```javascript
import { defaultService } from '../../utils/github-data';
import { useState, useEffect } from 'react';

function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await defaultService.getVideos();
        setVideos(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;

  return (
    <div>
      {videos.map(video => (
        <div key={video.id}>
          <img 
            src={defaultService.getImageUrl(video.poster)} 
            alt={video.title} 
          />
          <h3>{video.title}</h3>
          <p>{video.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3.4 设计页面 (Design.jsx)

**原来的代码:**
```javascript
import graphicContentData from '../../public/graphiccontent.json';
import packagingData from '../../public/packaging.json';
import viData from '../../public/vi.json';

// 在组件中使用
const graphicItems = graphicContentData.items;
const packagingItems = packagingData.items;
const viItems = viData.items;
```

**修改后的代码:**
```javascript
import { defaultService } from '../../utils/github-data';
import { useState, useEffect } from 'react';

function Design() {
  const [graphicItems, setGraphicItems] = useState([]);
  const [packagingItems, setPackagingItems] = useState([]);
  const [viItems, setViItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesignData = async () => {
      try {
        setLoading(true);
        const [graphicData, packagingData, viData] = await Promise.all([
          defaultService.getGraphicContent(),
          defaultService.getPackaging(),
          defaultService.getVI()
        ]);
        
        setGraphicItems(graphicData.items);
        setPackagingItems(packagingData.items);
        setViItems(viData.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesignData();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;

  return (
    <div>
      {/* 平面设计 */}
      <section>
        <h2>平面设计</h2>
        {graphicItems.map(item => (
          <div key={item.id}>
            <img 
              src={defaultService.getImageUrl(item.cover)} 
              alt={item.title} 
            />
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
          </div>
        ))}
      </section>

      {/* 包装设计 */}
      <section>
        <h2>包装设计</h2>
        {packagingItems.map(item => (
          <div key={item.id}>
            <img 
              src={defaultService.getImageUrl(item.cover)} 
              alt={item.title} 
            />
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
          </div>
        ))}
      </section>

      {/* VI设计 */}
      <section>
        <h2>VI设计</h2>
        {viItems.map(item => (
          <div key={item.id}>
            <img 
              src={defaultService.getImageUrl(item.cover)} 
              alt={item.title} 
            />
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 3.5 主页 (Home.jsx)

**原来的代码:**
```javascript
import heroData from '../../public/hero.json';

// 在组件中使用
const heroItems = heroData.items;
```

**修改后的代码:**
```javascript
import { defaultService } from '../../utils/github-data';
import { useState, useEffect } from 'react';

function Home() {
  const [heroItems, setHeroItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        setLoading(true);
        const data = await defaultService.getHero();
        setHeroItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;

  return (
    <div>
      {heroItems.map(item => (
        <div key={item.id}>
          <img 
            src={defaultService.getImageUrl(item.image)} 
            alt={item.title} 
          />
          <h1>{item.title}</h1>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 4. 处理媒体文件路径

使用 `defaultService.getImageUrl()`, `defaultService.getVideoUrl()` 等方法来获取完整的GitHub文件URL：

```javascript
// 原来的相对路径
<img src="/photos/image.jpg" alt="照片" />

// 修改后的GitHub URL
<img src={defaultService.getImageUrl("/photos/image.jpg")} alt="照片" />
```

## 5. 错误处理和加载状态

为所有数据获取添加适当的加载状态和错误处理：

```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// 在数据获取期间显示加载状态
if (loading) return <div>加载中...</div>;

// 在出错时显示错误信息
if (error) return <div>加载失败: {error}</div>;
```

## 6. 性能优化建议

1. **缓存数据**: 考虑使用React Query或SWR来缓存API响应
2. **懒加载**: 对于大量图片，实现懒加载
3. **错误重试**: 实现自动重试机制
4. **离线支持**: 考虑使用Service Worker缓存数据

## 7. 测试验证

1. 确保所有页面都能正确加载数据
2. 验证图片、音频、视频等媒体文件能正常显示
3. 测试网络错误情况下的错误处理
4. 检查移动端和桌面端的兼容性

## 8. 部署注意事项

1. 确保GitHub仓库是公开的，或者配置适当的访问权限
2. 检查GitHub的API限制（未认证用户每小时60次请求）
3. 考虑使用GitHub Pages来托管静态文件
4. 监控数据加载性能和用户体验

## 9. 故障排除

### 常见问题

1. **CORS错误**: 确保从正确的GitHub raw URL获取数据
2. **404错误**: 检查文件路径和分支名称是否正确
3. **API限制**: 如果遇到API限制，考虑增加认证或减少请求频率
4. **网络超时**: 实现适当的超时处理和重试机制

### 调试技巧

1. 使用浏览器开发者工具检查网络请求
2. 在控制台输出API响应数据
3. 验证GitHub文件URL是否可以直接访问
4. 检查文件路径和权限设置
