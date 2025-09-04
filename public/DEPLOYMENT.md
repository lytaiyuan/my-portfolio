# 部署说明

本指南说明如何将my-portfolio-data数据仓库部署到GitHub，并配置前端应用从GitHub读取数据。

## 1. 创建GitHub仓库

### 1.1 在GitHub上创建新仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称：`my-portfolio-data`
4. 描述：`My Portfolio Data Repository - 作品集网站的数据仓库`
5. 选择 "Public"（公开）
6. 不要勾选 "Add a README file"（我们已经有了）
7. 点击 "Create repository"

### 1.2 获取仓库信息

创建完成后，记下以下信息：
- 仓库URL：`https://github.com/your-username/my-portfolio-data`
- 仓库所有者：`your-username`
- 仓库名称：`my-portfolio-data`

## 2. 配置本地仓库

### 2.1 添加远程仓库

```bash
# 在my-portfolio-data目录中执行
git remote add origin https://github.com/your-username/my-portfolio-data.git
```

### 2.2 推送到GitHub

```bash
# 推送主分支
git push -u origin main
```

## 3. 验证部署

### 3.1 检查文件访问

部署完成后，您可以通过以下URL访问文件：

- **配置文件**：
  - 照片：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/config/photos.json`
  - 音乐：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/config/music.json`
  - 视频：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/config/videos.json`
  - 平面设计：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/config/graphiccontent.json`
  - 包装设计：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/packaging.json`
  - VI设计：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/vi.json`
  - 产品照片：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/productphotos.json`
  - 主页配置：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/hero.json`

- **媒体文件**：
  - 照片：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/photos/`
  - 音乐：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/music/`
  - 视频：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/videos/`
  - 设计：`https://raw.githubusercontent.com/your-username/my-portfolio-data/main/design/`

### 3.2 测试API访问

在浏览器中访问配置文件URL，确保能正确返回JSON数据。

## 4. 配置前端应用

### 4.1 复制GitHub数据访问工具

将 `utils/github-data.js` 文件复制到您的前端项目中。

### 4.2 修改配置

在 `utils/github-data.js` 中，修改仓库信息：

```javascript
// 修改为您的GitHub用户名和仓库名
const defaultService = new GitHubDataService('your-username', 'my-portfolio-data');
```

### 4.3 更新前端代码

按照 `FRONTEND_INTEGRATION.md` 中的说明，修改前端组件以使用GitHub数据服务。

## 5. 数据更新流程

### 5.1 本地更新

1. 在本地修改内容文件
2. 更新对应的JSON配置文件
3. 测试本地功能

### 5.2 部署到GitHub

```bash
# 添加更改
git add .

# 提交更改
git commit -m "Update: 描述您的更改"

# 推送到GitHub
git push origin main
```

### 5.3 使用部署脚本

也可以使用提供的部署脚本：

```bash
./scripts/deploy.sh
```

## 6. 监控和维护

### 6.1 检查GitHub状态

定期检查GitHub仓库状态，确保：
- 文件能正常访问
- 没有损坏的文件
- 仓库大小在合理范围内

### 6.2 性能监控

监控前端应用的数据加载性能：
- 网络请求时间
- 文件加载速度
- 用户体验

### 6.3 备份策略

虽然GitHub提供了版本控制，但建议：
- 定期备份重要文件
- 保留本地副本
- 监控存储使用情况

## 7. 故障排除

### 7.1 常见问题

1. **文件无法访问**
   - 检查仓库是否为公开
   - 验证文件路径是否正确
   - 确认分支名称

2. **CORS错误**
   - 确保使用正确的GitHub raw URL
   - 检查浏览器控制台错误信息

3. **API限制**
   - GitHub未认证用户每小时60次请求限制
   - 考虑实现缓存机制
   - 监控请求频率

### 7.2 调试技巧

1. **网络请求检查**
   - 使用浏览器开发者工具
   - 检查Network标签页
   - 验证请求URL和响应

2. **文件路径验证**
   - 直接在浏览器中访问文件URL
   - 检查文件是否存在
   - 验证权限设置

3. **错误日志分析**
   - 查看浏览器控制台错误
   - 检查网络请求状态码
   - 分析错误信息

## 8. 安全考虑

### 8.1 仓库权限

- 确保仓库设置为公开（如果需要外部访问）
- 限制对敏感文件的访问
- 定期审查文件内容

### 8.2 内容安全

- 不要上传敏感信息
- 检查文件内容是否合适
- 考虑使用GitHub的敏感信息检测

## 9. 扩展功能

### 9.1 GitHub Pages

考虑使用GitHub Pages托管静态文件：
- 启用GitHub Pages功能
- 配置自定义域名
- 优化文件访问性能

### 9.2 自动化部署

设置自动化部署流程：
- 使用GitHub Actions
- 自动构建和部署
- 集成CI/CD流程

### 9.3 内容管理

开发内容管理工具：
- 批量上传功能
- 自动生成配置文件
- 内容预览和编辑

## 10. 联系和支持

如果在部署过程中遇到问题：

1. 检查GitHub文档
2. 查看错误日志
3. 参考故障排除指南
4. 寻求技术支持

---

**注意**：请将文档中的 `your-username` 替换为您的实际GitHub用户名。

