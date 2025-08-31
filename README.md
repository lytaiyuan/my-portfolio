Li Yang Studio · 个人影像与设计作品集
==================================

暗黑扁平风 · 响应式 · 内容由 JSON 驱动
当前代码版本：v1.6.1

一、特性
--------
- 暗黑扁平式设计，参考 Apple 官网的留白与质感
- Hero 首屏大图 + 顶部居中 Logo（移动端带抽屉式菜单）
- 图片：瀑布流 + Lightbox（支持竖图、放大、标题/标签/简介）
- 视频：列表（桌面端最多两列）→ 详情页（顶部视频、下方长文案）
- 音乐：列表（桌面端最多两列）→ 详情页（顶部封面+播放按钮、B站视频、乐谱展示）
- 设计：平面/VI/包装/产品摄影四板块展示
- 模块化路由：主页 / 图片 / 视频 / 设计 / 音乐
- 内容即数据：所有作品来自 public/*.json，无需改代码即可更新
- 移动端优化：安全区域、抽屉菜单、触控体验

二、技术栈
----------
- React + Vite（前端构建）
- React Router v6（多页面路由）
- Tailwind CSS（样式）
- Framer Motion（动效）

说明：本地 Node 版本建议使用 v22 系列（例如 v22.18.0）。

三、目录结构（详细）
--------------------
my-portfolio/
├─ public/
│  ├─ logo.png                顶部 Logo
│  ├─ about.jpg               "关于我们"人物照片1（李洋）
│  ├─ about2.jpg              "关于我们"人物照片2（王蒙）
│  ├─ about3.jpg              "关于我们"人物照片3（原世芳）
│  ├─ photos/                 照片原图（含 hero.jpg）
│  ├─ hero/                   Hero背景图片文件夹（支持随机展示）
│  ├─ videos/                 视频文件夹
│  │  ├─ yuntingfinal/        视频项目1：包含封面和描述文件
│  │  ├─ 2023/                视频项目2：包含封面和描述文件
│  │  └─ weishan/             视频项目3：包含封面和描述文件
│  ├─ music/                  音乐资源文件夹
│  │  ├─ Epic/                音乐作品1
│  │  │  ├─ cover.jpg         封面图片
│  │  │  ├─ score/            乐谱文件夹
│  │  │  │  ├─ 01.jpg         乐谱第1页
│  │  │  │  ├─ 02.jpg         乐谱第2页
│  │  │  │  └─ 03.jpg         乐谱第3页
│  │  │  └─ Epic.txt          音乐介绍文本
│  │  └─ AnotherSong/         音乐作品2
│  │     ├─ cover.jpg         封面图片
│  │     ├─ score/            乐谱文件夹
│  │     │  ├─ 01.jpg         乐谱第1页
│  │  │  └─ 02.jpg         乐谱第2页
│  │     └─ AnotherSong.txt   音乐介绍文本
│  ├─ design/                 设计作品文件夹
│  ├─ photos.json             照片数据
│  ├─ videos.json             视频数据
│  ├─ music.json              音乐数据
│  ├─ vi.json                 设计数据
│  └─ site.json               站点级配置（可选：hero、站点标题等）
└─ src/
   ├─ App.jsx                 路由、导航、全局框架
   ├─ main.jsx                入口
   ├─ index.css               Tailwind 引入
   └─ pages/
      ├─ Home.jsx              主页（包含音乐板块展示）
      ├─ Photos.jsx            照片瀑布流
      ├─ Videos.jsx            视频列表
      ├─ VideoDetail.jsx       视频详情页（/videos/:slug）
      ├─ Design.jsx            设计作品展示
      ├─ Music.jsx             音乐列表
      └─ MusicDetail.jsx       音乐详情页（/music/:slug）

四、本地开发
------------
1) 安装依赖
   npm i

2) 开发调试
   npm run dev
   打开 http://localhost:5173

五、构建与预览
--------------
1) 生产构建
   npm run build

2) 本地预览构建产物
   npm run preview
   打开 http://localhost:4173

提示：这是一个前端单页应用（SPA）。若部署到 Nginx/静态服务器，需配置"所有子路由回退到 index.html"。
若托管在 GitHub Pages，建议使用 HashRouter（URL 形如 #/videos/slug），最省心不 404。

六、内容管理（JSON 约定）
-------------------------

1) public/photos.json
用于图片瀑布流 + Lightbox。新增字段 desc（约 30 字）只在点开大图时显示。

2) public/hero/ 文件夹
用于存放网站首页背景图片。支持.jpg和.JPG格式，系统会自动随机选择展示。
添加新图片后，运行 `npm run update-hero` 来更新配置文件。

示例：
{
  "version": "2025.08.29-1",
  "items": [
    {
      "id": 1,
      "url": "/photos/1.jpg",
      "title": "雪山峡谷",
      "tags": ["风光", "自然", "山"],
      "desc": "在高海拔薄暮时分拍摄，风与雪的层次勾勒出峡谷的脊线。"
    }
  ]
}

放置规则：
- 图片放 public/photos/，路径在 JSON 里以 /photos/xxx.jpg 引用；
- hero背景图片放 public/hero/，支持.jpg和.JPG格式，系统自动随机选择；
- 文件名区分大小写（上线到 Linux/对象存储时尤为重要）。

2) public/videos.json
用于视频列表（桌面最多两列）与视频详情页（/videos/:slug）。支持从外部txt文件读取详细介绍。

示例：
{
  "version": "2025.08.29-4",
  "items": [
    {
      "id": 1,
      "slug": "yuntingfinal",
      "title": "云听",
      "poster": "/videos/yuntingfinal/yuntingfinal.jpg",
      "src": "/videos/yuntingfinal.mp4",
      "duration": "2:41",
      "hottitle": "云听",
      "hotintro": "一起回顾 2023 的高光与日常。",
      "descriptionFile": "/videos/yuntingfinal/yuntingfinal.txt"
    }
  ]
}

放置规则：
- 封面图 poster 放 public/videos/[项目名]/；视频放 public/videos/；
- 详细介绍文本放 public/videos/[项目名]/ 下的 .txt 文件；
- slug 使用小写短横线，避免中文/空格，利于 SEO 与后端迁移。

3) public/music.json
用于音乐列表与音乐详情页（/music/:slug）。支持B站视频嵌入和乐谱展示。

示例：
{
  "version": "2025.01.29-1",
  "items": [
    {
      "id": 1,
      "slug": "epic",
      "title": "Epic",
      "hottitle": "史诗级配乐",
      "hotintro": "震撼人心的史诗配乐，融合古典与现代元素",
      "cover": "/music/Epic/cover.jpg",
      "embed": {
        "playerUrl": "https://player.bilibili.com/player.html?bvid=BV1xx411c7mu",
        "iframe": "<iframe src=\"https://player.bilibili.com/player.html?bvid=BV1xx411c7mu\" scrolling=\"no\" border=\"0\" frameborder=\"no\" framespacing=\"0\" allowfullscreen=\"true\" width=\"100%\" height=\"100%\"> </iframe>"
      },
      "descriptionFile": "/music/Epic/Epic.txt",
      "scoreFolder": "/music/Epic/score/",
      "duration": "3:45"
    }
  ]
}

放置规则：
- 封面图 cover 放 public/music/{音乐名}/cover.jpg；
- 乐谱图片放 public/music/{音乐名}/score/ 文件夹，命名格式为 01.jpg, 02.jpg...；
- 音乐介绍文本放 public/music/{音乐名}/{音乐名}.txt；
- B站视频通过 embed.playerUrl 或 embed.iframe 字段配置。

4) public/design/ 文件夹
用于存放设计作品，支持平面设计、VI设计、包装设计、产品摄影等分类。

七、版本管理（建议）
--------------------
- 代码版本（App）：语义化版本 MAJOR.MINOR.PATCH（例如 1.5.1）。
  用 Git 标签记录版本，例如 v1.5.1。
- 内容版本（JSON）：每个 JSON 顶层写 version（建议日历版：YYYY.MM.DD-N）。
  页面请求时可附带 ?v=版本号 规避缓存，比如：/photos.json?v=2025.08.29-1。

八、推送到 GitHub（GitHub Desktop）
----------------------------------
1) File → Add Local Repository… 选择项目目录
2) 若不是 Git 仓库，点击 Create a Repository（.gitignore 选 Node）
3) Commit → Push（首次会显示 Publish repository）
4) 打 Tag：Repository → Create Tag… → v1.5.1 → Push

九、常见问题（FAQ）
-------------------
- 构建后菜单栏半透明失效
  确保半透明使用了稳定的类（如固定的 glass 或行内 bg-neutral-950/50 backdrop-blur），避免被构建时优化掉。

- 直接访问 /videos/某个slug 404
  这是 SPA 的服务端回退问题。Nginx/静态服务需配置回退到 index.html；或改用 HashRouter。

- 图片/视频加载 404
  路径必须以 / 开头且大小写严格匹配；确保文件真实存在于 public/ 下对应位置。

- JSON 改了不生效
  开发期可用 fetch(..., { cache: 'no-cache' })；上线附带 ?v=内容版本 规避缓存；或刷新 CDN。

- 移动端抽屉关闭按钮错位
  关闭按钮放在抽屉容器内的 absolute top-2 right-4，与触发按钮保持镜像位置；层级 z-[80] 保证在遮罩之上。

- 乐谱图片不显示
  确保乐谱图片文件真实存在且为有效的图片格式；检查 scoreFolder 路径配置是否正确。

十、路线图（Roadmap）
---------------------
✅ 设计页：平面/VI/包装/产品摄影四板块 + 详情（图片长图方案）
✅ 音乐页：封面 + 播放入口，按视频详情页复用布局
✅ 视频详情页：支持从外部txt文件读取详细介绍，支持首行缩进和段落间距
✅ 音乐详情页：支持B站视频嵌入、乐谱展示、封面图片播放控制
- 内容后台：后续可对接自托管 Headless CMS（Strapi/Directus）
- NAS 部署：Nginx 回退、对象存储、版本目录与回滚
- 乐谱展示优化：支持更多图片格式，添加乐谱预览功能

十一、v1.6.1 版本更新内容
--------------------------
- Bug修复：修复了hero图片动态扫描功能不工作的问题
- 改进方案：改用配置文件驱动的方式管理hero图片列表
- 新增功能：添加了`npm run update-hero`命令来自动更新hero配置
- 工具优化：创建了专门的更新脚本来管理hero图片配置
- 用户体验：现在添加新图片后，运行更新命令即可立即生效
- 可靠性提升：解决了Vite开发服务器不支持目录浏览的问题

十二、v1.6.0 版本更新内容
--------------------------
- 视频区路径重构：为每个视频创建独立子文件夹，包含封面和描述文件
- Hero图片系统重构：创建专门的hero文件夹，支持随机展示多张背景图
- 数据结构优化：移除老旧的content.json，使用专门的配置文件管理不同类型内容
- 支持多种图片格式：hero文件夹同时支持.jpg和.JPG扩展名
- 代码架构优化：useContent hook重构，支持并行数据加载和智能错误处理
- 文件组织优化：videos文件夹结构从扁平改为层级，便于管理
- 性能提升：减少不必要的数据请求，优化加载流程

十二、v1.5.1 版本更新内容
--------------------------
- 新增音乐板块：完整的音乐列表和详情页功能
- 音乐详情页支持B站视频嵌入，点击封面后播放
- 乐谱展示功能：支持多页乐谱图片，自动检测文件存在性
- 视频详情页优化：支持从外部txt文件读取详细介绍
- 文本格式优化：支持首行缩进、段落间距、响应式布局
- 主页音乐板块：动态显示第一条音乐信息
- 新增"关于我们"成员：原世芳
- 完善设计板块：支持多种设计类型展示
- 响应式优化：移动端和桌面端体验统一

十二、许可
----------
如无特别声明，个人作品版权归 Li Yang Studio 所有；页面代码可按个人项目使用，不得用于侵犯作品权益的场景。