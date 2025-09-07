Li Yang Studio · 个人影像与设计作品集
==================================

深浅双主题 · 响应式 · 本地/远程可切换内容源（Hybrid）
当前代码版本：v2.1.0

一、特性（Features）
---------------------
- 主题与视觉
  - 深/浅双主题，统一变量与过渡；工具栏及内部元素颜色切换统一 0.5s
  - 莫兰迪配色体系与连续背景设计，卡片/按钮描线与衬底一致化
  - Hero 首屏：图片加载完成后，标题、字幕、桌面端按钮按序渐显；底部渐变随主题渐显/渐隐

- 导航与菜单
  - 顶部固定毛玻璃工具栏（桌面：左菜单/中 Logo/右主题切换）
  - 移动端菜单：采用 height 过渡的下拉展开/收回，非线性曲线更顺滑；背景模糊随开合渐变
  - 内联 SVG 图标（菜单/关闭/主题切换），减少图片依赖

- 页面与转场
  - 路由级淡出/预取/淡入流程：点击菜单项触发旧页淡出 → 预取目标页关键资源 → 目标页就绪后淡入
  - 各列表页在首屏容器就绪后即可结束转场；页脚最后渐显
  - 自定义事件：app:pageTransition / app:routeReady / app:menuOpen

- 内容与数据源（Hybrid）
  - 本地/远程内容源一键切换（默认本地优先）；JSON 支持同时提供 url 与 localurl 字段
  - 自动构造 GitHub Raw 地址（buildRawAssetUrl），确保 remote 模式稳定读取

- 图片（Photos）
  - Masonry 瀑布流：每张卡片按图片 onLoad 独立渐显；Lightbox 采用稳定尺寸计算（竖图无黑边）
  - 标签筛选 + 标题搜索；移动端搜索框文本 16px 规避 iOS 自动放大；浅色下字幕半透明底

- 视频（Videos）
  - 列表卡片独立渐显；详情页支持封面、描述文件与段落格式

- 音乐（Music）
  - 列表卡片独立渐显；详情页内联 B 站播放器；支持多页乐谱展示（score/ 目录）

- 设计（Design）
  - 平面/VI/包装/产品摄影四板块；产品摄影并入设计页并采用瀑布流布局
  - 产品摄影卡片与 Lightbox 交互完全对齐图片页，浅/深模式样式一致

- 性能与体验
  - 关键动画使用非线性曲线；工具栏高度过渡设置 will-change: height 提示合成优化
  - 图片/封面在导航前预加载，减少页面抖动；避免布局重排导致的明显卡顿

二、技术栈
----------
- React + Vite（前端构建）
- React Router v6（多页面路由）
- Tailwind CSS（样式）
- Framer Motion（动效）
- GitHub Raw API（内容数据源，可切换 local/remote）

说明：本地 Node 版本建议使用 v22 系列（例如 v22.18.0）。

二-1、本地/远程内容源切换（重要）
---------------------
目前支持两种来源：
- 本地 public/ 目录（默认）：延迟低，稳定性高
- 远程 GitHub（备选）：无需重新部署即可更新内容

开关位置：`src/lib/configSource.js`
```
export const ASSET_SOURCE = "local"; // 或 "remote"
```
读取配置：`getConfigUrl(name)`（自动返回本地 /config/*.json 或远程 URL）
选择资源：`pickUrl(remote, local)`（本地优先；remote 支持相对路径自动转 Raw）

说明：本项目为“动静结合”的混合模式（Hybrid）。默认读取本地 public 内容，亦可一键切换到远程 GitHub 数据源，二者并存且可回退。

二-2、GitHub 集成架构（remote 模式）
---------------------
本项目在 remote 模式下，采用“伪动态网站”架构，将内容数据与前端代码分离：

**前端代码仓库** (my-portfolio)
- 纯前端应用代码
- 通过 GitHub Raw 读取远程内容（或切换回本地）
- 支持 Cloudflare Pages 等静态托管服务

**内容数据仓库** (my-portfolio-data)
- 存放所有媒体与配置
- 公开仓库，支持直接访问
- 内容更新无需重新部署前端

**数据获取方式**
- 配置文件：`https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/*.json`
- 媒体文件：`https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/*`

**优势**
- 内容更新即时生效（无需重新部署）
- 支持版本控制和回滚
- 可独立管理内容和代码
- 支持多环境部署（开发/测试/生产）

二-3、设计理念（关键视觉与交互）
---------------------
- 莫兰迪配色（Morandi Palette）
  - 主页浅色模式采用偏灰、低饱和度的莫兰迪色系（如照片/视频/设计/音乐四板块的背景色），确保雅致、不刺眼的基调；
  - 深色模式下使用呼应的莫兰迪深色系，并提升文字与可操作元素的对比度；
  - 统一的描线与半透明衬底（如 bg-black/5 与边框）保证在两种主题下的视觉一致性。
- 二级页面连续背景
  - 图片/视频/设计/音乐等二级页面顶部均为统一高度（如 600px）的头部容器，并且背景与首页对应板块保持风格一致（同色系或同渐变）；
  - 顶部容器内采用低不透明度的纹理叠加与混合模式（mix-blend-mode: multiply），弱化噪点同时增强层次；
  - 头部标题置中、下方内容卡片使用半透明衬底 + 细描线的统一模块语言。
- 卡片与控件的一致化
  - 卡片：圆角 12~16px、半透明衬底、细描线，hover 时轻微提亮或放大（scale 1.02），避免强烈跳动；
  - 按钮：工具栏按钮与卡片按钮风格统一，深/浅模式下描线、衬底与 hover 明度按等级递进；
  - 标签与搜索：在图片页顶部容器内底部对齐，标签风格与首页 CTA 匹配，搜索采用半透明 + 毛玻璃以适配复杂背景。
- 排版与节奏
  - 统一容器宽度 1120px，保持舒适的阅读行长；
  - 文字层级清晰：标题（2xl~6xl）— 正文（sm~lg）— 辅助（xs），并控制行高提升可读性；
  - 动效克制：入场与 hover 采用 ease-out 0.18~0.30s 的细微动效，强调“轻量”和“连续”。

补充：菜单高度过渡采用 height + 非线性曲线，与背景模糊配合，确保在用户偏好“真实展开”视觉时的顺滑体验。

三、目录结构（详细）
--------------------
my-portfolio/ (前端代码仓库)
├─ src/                       前端源代码
│  ├─ App.jsx                 路由、导航、全局框架
│  ├─ main.jsx                入口
│  ├─ index.css               Tailwind 引入
│  └─ pages/                  页面组件
│     ├─ Home.jsx             主页（包含音乐板块展示）
│     ├─ Photos.jsx           照片瀑布流
│     ├─ Videos.jsx           视频列表
│     ├─ VideoDetail.jsx      视频详情页（/videos/:slug）
│     ├─ Design.jsx           设计作品展示
│     ├─ Music.jsx            音乐列表
│     └─ MusicDetail.jsx      音乐详情页（/music/:slug）
└─ public/                    本地内容源（与 remote 模式等价的目录结构）
   ├─ logo.png                顶部 Logo
   ├─ about.jpg               "关于我们"人物照片1（李洋）
   ├─ about2.jpg              "关于我们"人物照片2（王蒙）
   ├─ about3.jpg              "关于我们"人物照片3（原世芳）
   └─ covers/                 占位图片文件夹
      └─ placeholder.jpg      视频默认封面

my-portfolio-data/ (内容数据仓库)
├─ config/                    配置文件
│  ├─ photos.json             照片数据
│  ├─ videos.json             视频数据
│  ├─ music.json              音乐数据
│  ├─ hero.json               Hero图片配置
│  ├─ graphiccontent.json     平面设计数据
│  ├─ packaging.json          包装设计数据
│  ├─ productphotos.json      产品摄影数据
│  └─ vi.json                 VI设计数据
├─ photos/                    照片原图
├─ hero/                      Hero背景图片文件夹
├─ videos/                    视频文件夹
│  ├─ yuntingfinal/           视频项目1：包含封面和描述文件
│  ├─ 2023/                   视频项目2：包含封面和描述文件
│  └─ weishan/                视频项目3：包含封面和描述文件
├─ music/                     音乐资源文件夹
│  ├─ Epic/                   音乐作品1
│  │  ├─ cover.jpg            封面图片
│  │  ├─ score/               乐谱文件夹
│  │  │  ├─ 01.jpg            乐谱第1页
│  │  │  ├─ 02.jpg            乐谱第2页
│  │  │  └─ 03.jpg            乐谱第3页
│  │  └─ Epic.txt             音乐介绍文本
│  └─ AnotherSong/            音乐作品2
│     ├─ cover.jpg            封面图片
│     ├─ score/               乐谱文件夹
│     │  ├─ 01.jpg            乐谱第1页
│     │  └─ 02.jpg            乐谱第2页
│     └─ AnotherSong.txt      音乐介绍文本
├─ design/                    设计作品文件夹
│  ├─ graphic/                平面设计
│  ├─ vi/                     VI设计
│  ├─ packaging/              包装设计
│  └─ product/                产品摄影
└─ FRONTEND_README.md         前端集成说明文档
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

六、内容管理
--------------------------------
本地模式（默认）：所有配置位于 `public/config/*.json`，媒体文件位于 `public/*` 对应目录。

远程模式（可选）：从 `my-portfolio-data` 仓库读取相同结构的配置与媒体。

**配置文件位置（两种模式一致）**：
- 照片数据：`config/photos.json`
- 视频数据：`config/videos.json`
- 音乐数据：`config/music.json`
- 设计数据：`config/*.json`
- Hero配置：`hero.json`

**媒体文件位置**：
- 照片：`photos/` 文件夹
- 视频：`videos/` 文件夹
- 音乐：`music/` 文件夹
- 设计：`design/` 文件夹

**JSON 配置约定**：

1) config/photos.json
用于图片瀑布流 + Lightbox。字段：
- id, title, desc, tags[]
- url（远程，GitHub Raw）
- localurl（本地，public 路径）
- w/h（可选，原始尺寸，利于稳定布局与 Lightbox 拟合）

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

2) config/videos.json
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

3) config/music.json
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

4) config/graphiccontent.json / config/packaging.json / config/vi.json / config/productphotos.json
用于存放设计各分类与产品摄影的数据。字段约定：
- id, title, desc
- url（远程，GitHub Raw）
- localurl（本地，public 路径）
- 可选：cover/poster/descriptionFile/scoreFolder 等按类别扩展

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

- 图片/视频加载 404（GitHub集成后）
  检查 `my-portfolio-data` 仓库中文件是否存在；确保JSON中的路径正确；查看浏览器Console中的URL构建日志。

- GitHub内容更新不生效
  确保内容已推送到 `my-portfolio-data` 仓库的main分支；检查GitHub Raw URL是否正确；清除浏览器缓存。

- URL重复问题（如出现两次GitHub地址）
  这是路径转换问题，检查Console日志中的URL构建过程；确保JSON中的路径格式正确。

- 移动端抽屉关闭按钮错位
  关闭按钮放在抽屉容器内的 absolute top-2 right-4，与触发按钮保持镜像位置；层级 z-[80] 保证在遮罩之上。

- 乐谱图片不显示
  确保乐谱图片文件真实存在于 `my-portfolio-data` 仓库中；检查 scoreFolder 路径配置是否正确。

- GitHub API限制问题
  如果遇到API限制，可考虑将 `my-portfolio-data` 仓库设为公开，使用直接访问方式。

十、路线图（Roadmap）
---------------------
✅ 设计页：平面/VI/包装/产品摄影四板块 + 详情（图片长图方案）
✅ 音乐页：封面 + 播放入口，按视频详情页复用布局
✅ 视频详情页：支持从外部txt文件读取详细介绍，支持首行缩进和段落间距
✅ 音乐详情页：支持B站视频嵌入、乐谱展示、封面图片播放控制
✅ 伪动态网站：GitHub数据仓库驱动，内容更新无需重新部署
✅ GitHub集成：所有页面通过GitHub Raw API获取数据
- 内容管理工具：本地内容编辑工具，支持批量上传到GitHub
- 自动化部署：GitHub Actions自动构建和部署
- 乐谱展示优化：支持更多图片格式，添加乐谱预览功能
- 性能优化：图片懒加载、CDN加速、缓存策略

十一、v2.0.0 版本更新内容
--------------------------
- 内容源开关：新增 `ASSET_SOURCE`（local/remote）与 `getConfigUrl`、`pickUrl` 工具，支持本地/远程一键切换
- 全面本地优先：主页/图片/视频/音乐/设计各页与详情均改为本地优先加载
- 资源回迁：hero 与所有静态资源迁回 public，弱网环境稳定性显著提升
- 工具栏重构：移动端左侧为主题切换，中间 LOGO 居中，右侧菜单对称
- 视觉统一：按钮/卡片描线与浅色/深色模式统一优化
- 文档更新：README 重写内容源章节与目录结构说明

十二、v1.7.0 版本更新内容（保留）
--------------------------
- 架构重构：从本地JSON驱动改为GitHub数据仓库驱动
- 内容分离：创建独立的`my-portfolio-data`仓库管理所有内容
- 伪动态网站：支持内容更新无需重新部署前端代码
- GitHub集成：所有页面通过GitHub Raw API获取数据
- 路径转换：智能URL构建，避免重复路径问题
- 设计板块：修复所有设计详情页的GitHub数据获取
- 音乐详情页：修复封面、描述、乐谱的GitHub加载
- 主页优化：修复特色内容的GitHub图片加载
- 调试功能：添加详细的console.log用于URL构建调试
- 错误处理：改进GitHub API调用的错误处理机制

十二、v1.6.1 版本更新内容
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

十三、v2.1.0 版本更新内容
--------------------------
- 菜单动画：恢复 height 过渡方案，使用非线性曲线并优化合成层（will-change: height），显著提升展开/收回流畅度
- 转场与预取：完善点击菜单后的淡出→预取→淡入流程，四个二级页面首屏容器就绪即可结束转场
- 列表动画：图片/视频/音乐/产品摄影卡片独立 onLoad 渐显，视觉过渡更平滑
- Hero 顺序动画：背景图→标题→副标题→桌面端按钮按序出现，底部渐变在主题切换时渐显/渐隐
- 内容源：补充 JSON 约定与示例，强调 url/localurl 混合策略与 Raw URL 构造
- 文档与版本：README 特性全面补充，版本号提升至 v2.1.0