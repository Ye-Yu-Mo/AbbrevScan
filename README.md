# 文档缩写提取工具 - 部署指南

GitHub 仓库: [https://github.com/Ye-Yu-Mo/AbbrevScan](https://github.com/Ye-Yu-Mo/AbbrevScan)

本文档提供从零开始部署文档缩写提取工具（AbbrevScan）的完整流程。

## 系统要求

- Python 3.10+
- Node.js 14+
- npm 或 yarn

## 1. 后端部署 (FastAPI)

### 1.1 环境准备

```bash
# 克隆或下载项目代码
cd /path/to/project

# 创建Python虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 安装依赖包
pip install fastapi uvicorn python-docx textract python-multipart
```

### 1.2 启动后端服务器

```bash
# 在项目根目录运行
venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端服务器将在 `http://localhost:8000` 启动，支持热重载。

## 2. 前端部署 (React + Tailwind CSS)

### 2.1 环境准备

```bash
# 进入前端目录
cd doc-abbr-web

# 安装依赖
npm install

# 安装Tailwind CSS及相关依赖
npm install -D tailwindcss@^3.4.0 postcss autoprefixer

# 初始化Tailwind配置
npx tailwindcss init -p
```

### 2.2 配置检查

确保以下配置文件正确：

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**postcss.config.js**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.3 启动前端服务器

```bash
# 在前端目录运行
npm start
```

前端服务器将在 `http://localhost:3000` 启动。

## 3. 完整部署流程

### 3.1 一次性部署脚本

创建部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 后端部署
echo "正在部署后端..."
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-docx textract python-multipart

# 前端部署
echo "正在部署前端..."
cd doc-abbr-web
npm install
npm install -D tailwindcss@^3.4.0 postcss autoprefixer

echo "部署完成！"
echo "启动后端: venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "启动前端: cd doc-abbr-web && npm start"
```

### 3.2 生产环境部署

对于生产环境，建议使用：

**后端生产部署：**
```bash
# 使用Gunicorn作为生产服务器
venv/bin/pip install gunicorn
venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

**前端生产构建：**
```bash
cd doc-abbr-web
npm run build
# 构建后的文件在 build/ 目录，可部署到任何静态文件服务器
```

## 4. 故障排除

### 4.1 常见问题

1. **端口冲突**：确保8000和3000端口未被占用
2. **Python包安装失败**：尝试使用较旧版本的textract
   ```bash
   pip install textract==1.6.3
   ```
3. **CORS错误**：确保后端已正确配置CORS中间件

### 4.2 文件处理问题

- 确保系统已安装textract所需的依赖（如antiword用于.doc文件）
- 对于大型文件，textract可能比python-docx更稳定

## 5. 使用说明

1. 同时启动后端和前端服务器
2. 在浏览器中打开 `http://localhost:3000`
3. 上传.doc或.docx文件
4. 查看提取的缩写结果（支持中英文等Unicode字符）
5. 使用搜索框实时过滤结果
6. 可选择多种导出格式：
   - TXT：纯文本格式
   - JSON：结构化数据格式
   - CSV：逗号分隔值格式
   - Excel：Microsoft Excel格式
   - Word：Microsoft Word表格格式
   - 复制：一键复制到剪贴板
7. 可随时清除结果重新上传文件

## 6. 项目结构

```
AbbrevScan/
├── main.py                 # FastAPI后端主文件
├── requirements.txt        # Python依赖
├── DEPLOYMENT_GUIDE.md    # 本部署指南
├── uploads/               # 临时文件上传目录
└── doc-abbr-web/          # React前端项目
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    └── src/
        ├── App.js         # 主组件
        └── index.css      # Tailwind样式
```

## 7. 维护与更新

### 更新依赖
```bash
# 后端
venv/bin/pip install -U fastapi uvicorn python-docx textract python-multipart

# 前端
cd doc-abbr-web
npm update
```

### 日志查看
后端日志直接显示在控制台，包含错误详情和处理结果。

## 8. 新增功能

### 8.1 Unicode支持
- 后端完全支持中英文及其他Unicode字符的缩写提取
- 前端搜索功能支持多语言实时过滤
- 改进了正则表达式算法，支持非ASCII字符识别

### 8.2 增强的用户界面
- **实时搜索**：在结果表格上方添加搜索框，支持中英文关键词过滤
- **数字筛选**：新增"仅显示包含数字的结果"复选框，可过滤出包含数字的缩写
- **多种导出格式**：
  - TXT：纯文本格式下载
  - JSON：结构化数据格式下载
  - CSV：逗号分隔值格式下载
  - Excel：Microsoft Excel格式下载
  - Word：Microsoft Word表格格式下载
  - 复制：一键复制所有结果到剪贴板
- **清除功能**：一键清除当前结果，方便重新上传文件
- **视觉反馈**：
  - 上传按钮加载动画
  - 搜索输入框实时指示器
  - 错误信息友好提示

### 8.3 性能优化
- 异步文件处理，避免界面卡顿
- 智能过滤算法，提高处理效率
- 内存优化，支持处理较大文档文件

## 9. 扩展建议

1. **数据库集成**：添加SQLite或PostgreSQL存储处理历史
2. **用户认证**：添加JWT或OAuth认证
3. **批量处理**：支持批量上传多个文件
4. **API文档**：FastAPI自动生成API文档在 `/docs` 端点
5. **更多格式支持**：扩展支持PDF、RTF等文档格式
6. **高级搜索**：添加正则表达式搜索和过滤选项

## TODO

---
*最后更新: 2025年8月23日*
