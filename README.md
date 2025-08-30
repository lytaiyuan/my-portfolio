Li Yang Studio · 个人影像与设计作品集
==================================

暗黑扁平风 · 响应式 · 内容由 JSON 驱动
当前代码版本：v1.5.1

一、特性
--------
- 暗黑扁平式设计，参考 Apple 官网的留白与质感
- Hero 首屏大图 + 顶部居中 Logo（移动端带抽屉式菜单）
- 图片：瀑布流 + Lightbox（支持竖图、放大、标题/标签/简介）
- 视频：列表（桌面端最多两列）→ 详情页（顶部B站视频播放器、下方长文案介绍）
- 模块化路由：主页 / 图片 / 视频 / 设计 / 音乐（新增设计与音乐板块）
- 内容即数据：所有作品来自 public/*.json，无需改代码即可更新
- 移动端优化：安全区域、抽屉菜单、触控体验

**v1.5.1 版本更新内容：**
- 完善照片与视频的框架结构，避免功能重叠
- 视频板块增加介绍模块，支持B站视频播放
- 新增设计板块：平面设计、VI设计、包装设计、产品摄影
- 新增音乐板块：音乐列表、详情页、乐谱展示
- 优化响应式布局，提升用户体验

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
├─ public/                    静态资源目录
│  ├─ logo.png                顶部 Logo
│  ├─ about.jpg               “关于我们”人物照片1
│  ├─ about2.jpg              “关于我们”人物照片2
│  ├─ photos/                 照片原图目录（含 hero.jpg）
│  ├─ covers/                 视频封面/设计封面等
│  ├─ videos/                 视频源文件目录（mp4 等）
│  ├─ design/                 设计相关资源目录
│  │  ├─ graphic/             平面设计资源
│  │  ├─ vi/                  VI设计资源
│  │  ├─ packaging/           包装设计资源
│  │  ├─ product/             产品摄影资源
│  │  └─ home/                首页设计展示资源
│  ├─ music/                  音乐相关资源目录
│  │  ├─ Epic/                音乐项目示例
│  │  │  ├─ cover.jpg         音乐封面
│  │  │  ├─ Epic.txt         音乐介绍文本
│  │  │  └─ score/            乐谱图片目录
│  │  └─ AnotherSong/         另一个音乐项目
│  ├─ photos.json             照片数据（瀑布流展示）
│  ├─ videos.json             视频数据（B站播放）
│  ├─ music.json              音乐数据（音乐列表）
│  ├─ content.json            综合内容数据
│  ├─ graphiccontent.json     平面设计内容数据
│  ├─ vi.json                 VI设计内容数据
│  ├─ packaging.json          包装设计内容数据
│  └─ productphotos.json      产品摄影内容数据
└─ src/                       源代码目录
   ├─ App.jsx                 主应用组件（路由、导航、全局框架）
   ├─ App.tsx                 照片管理工具主组件
   ├─ main.jsx                主入口文件
   ├─ main.tsx                照片管理工具入口
   ├─ index.css               主样式文件（Tailwind 引入）
   ├─ App.css                 应用样式文件
   ├─ types/                  类型定义目录
   │  └─ index.ts             TypeScript类型定义
   ├─ components/             组件目录
   │  ├─ HomeDesign.jsx       首页设计展示组件
   │  ├─ PhotoList.tsx        照片列表组件（支持拖拽排序）
   │  └─ Toolbar.tsx          工具栏组件
   ├─ pages/                  页面组件目录
   │  ├─ Home.jsx             首页
   │  ├─ Photos.jsx           照片页（瀑布流）
   │  ├─ Videos.jsx           视频列表页
   │  ├─ VideoDetail.jsx      视频详情页（/videos/:slug）
   │  ├─ Design.jsx           设计页
   │  ├─ design/              设计子页面目录
   │  │  ├─ GraphicDetail.jsx 平面设计详情页
   │  │  ├─ ViDetail.jsx      VI设计详情页
   │  │  ├─ PackagingDetail.jsx 包装设计详情页
   │  │  └─ Product.jsx       产品摄影页
   │  ├─ Music.jsx            音乐列表页
   │  └─ MusicDetail.jsx      音乐详情页（/music/:slug）
   ├─ lib/                    工具库目录
   └─ assets/                 资源文件目录
├─ dist/                      构建输出目录
├─ node_modules/              依赖包目录
├─ .vscode/                   VS Code配置目录
├─ package.json               项目配置文件
├─ package-lock.json          依赖锁定文件
├─ vite.config.ts             Vite配置文件
├─ vite.config.js             Vite配置文件（兼容）
├─ tsconfig.json              TypeScript配置
├─ tsconfig.node.json         Node.js TypeScript配置
├─ tailwind.config.js         Tailwind CSS配置
├─ tailwind.config.cjs        Tailwind CSS配置（兼容）
├─ postcss.config.js          PostCSS配置
├─ postcss.config.cjs         PostCSS配置（兼容）
├─ eslint.config.js           ESLint配置
├─ .gitignore                 Git忽略文件
└─ README.md                  项目说明文档

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

提示：这是一个前端单页应用（SPA）。若部署到 Nginx/静态服务器，需配置“所有子路由回退到 index.html”。
若托管在 GitHub Pages，建议使用 HashRouter（URL 形如 #/videos/slug），最省心不 404。

六、内容管理（JSON 约定）
-------------------------

1) public/photos.json
用于图片瀑布流 + Lightbox。新增字段 desc（约 30 字）只在点开大图时显示。

示例：
{
  "version": "2025.08.29-1",
  "hero": "/photos/hero.jpg",
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
- hero.jpg 也在 public/photos/；
- 文件名区分大小写（上线到 Linux/对象存储时尤为重要）。

2) public/videos.json
用于视频列表（桌面最多两列）与视频详情页（/videos/:slug）。支持B站视频播放。

3) public/design/ 相关JSON文件
用于设计板块的各个子分类：
- graphiccontent.json：平面设计内容
- vi.json：VI设计内容  
- packaging.json：包装设计内容
- productphotos.json：产品摄影内容

4) public/music.json
用于音乐板块，支持音乐列表和详情页展示：
- 音乐封面、标题、简介
- B站视频链接
- 乐谱图片展示
- 文字介绍内容

示例：
{
  "version": "2025.08.29-1",
  "items": [
    {
      "id": 1,
      "slug": "liuzhuan-2023",
      "title": "流转-2023",
      "poster": "/covers/2023.jpg",
      "src": "/videos/2023.mp4",
      "duration": "2:41",
      "excerpt": "一起回顾 2023 的高光与日常。",
      "body": "较长说明文案，支持换行。可写多段内容，讲拍摄契机、器材、地点等。"
    }
  ]
}

放置规则：
- 封面图 poster 放 public/covers/；视频放 public/videos/；
- slug 使用小写短横线，避免中文/空格，利于 SEO 与后端迁移。

七、版本管理（建议）
--------------------
- 代码版本（App）：语义化版本 MAJOR.MINOR.PATCH（例如 1.0.0）。
  用 Git 标签记录版本，例如 v1.0.0。
- 内容版本（JSON）：每个 JSON 顶层写 version（建议日历版：YYYY.MM.DD-N）。
  页面请求时可附带 ?v=版本号 规避缓存，比如：/photos.json?v=2025.08.29-1。

八、推送到 GitHub（GitHub Desktop）
----------------------------------
1) File → Add Local Repository… 选择项目目录
2) 若不是 Git 仓库，点击 Create a Repository（.gitignore 选 Node）
3) Commit → Push（首次会显示 Publish repository）
4) 打 Tag：Repository → Create Tag… → v1.0.0 → Push

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

十、路线图（Roadmap）
---------------------
- ✅ 设计页：平面/VI/包装/产品摄影四板块 + 详情（图片长图方案）
- ✅ 音乐页：封面 + 播放入口，按视频详情页复用布局
- 内容后台：后续可对接自托管 Headless CMS（Strapi/Directus）
- NAS 部署：Nginx 回退、对象存储、版本目录与回滚
- 照片JSON管理工具：开发Mac端GUI工具，支持拖拽排序、封面图管理
- 乐谱展示优化：支持多页乐谱、缩略图预览、放大查看

十一、许可
----------
如无特别声明，个人作品版权归 Li Yang Studio 所有；页面代码可按个人项目使用，不得用于侵犯作品权益的场景。