# 文档缩写提取工具 - AbbrevScan

GitHub 仓库: [https://github.com/Ye-Yu-Mo/AbbrevScan](https://github.com/Ye-Yu-Mo/AbbrevScan)

本文档提供文档缩写提取工具（AbbrevScan）的完整文档，包括系统设计、功能说明和部署指南。

## 项目概述

AbbrevScan 是一个智能文档处理工具，能够从 .doc 和 .docx 文档中自动提取缩写及其全称。支持中英文及其他Unicode字符，提供多种导出格式和实时搜索功能。

## 功能特性

### 核心功能
- **文件上传**: 支持 .doc 和 .docx 格式文档上传
- **智能提取**: 自动识别文档中的缩写和全称对
- **Unicode支持**: 完全支持中英文及其他Unicode字符
- **去重排序**: 自动去除重复结果并按字典序排序

### 用户界面功能
- **实时搜索**: 支持中英文关键词实时过滤结果
- **数字筛选**: 可选择仅显示包含数字的缩写结果
- **年份筛选**: 可选择去除包含年份(1900-2100)的项
- **多语言支持**: 支持简体中文、繁体中文、英文界面切换
- **等待时游戏**: 可选择在文件处理时玩贪吃蛇游戏消遣
- **多种导出格式**:
  - TXT：纯文本格式下载
  - JSON：结构化数据格式下载
  - CSV：逗号分隔值格式下载
  - Excel：Microsoft Excel格式下载
  - Word：Microsoft Word表格格式下载
  - 复制：一键复制所有结果到剪贴板
- **清除功能**: 一键清除当前结果，方便重新上传文件

### 技术特性
- **异步处理**: 避免界面卡顿，提高用户体验
- **内存优化**: 支持处理较大文档文件
- **错误处理**: 完善的错误提示和异常处理机制
- **多语言国际化**: 完整的翻译系统支持三种语言
- **游戏集成**: 内置贪吃蛇游戏，支持多语言界面

## 系统架构

```
[ 前端 React ] —— 文件上传 ——> [ 后端 API ] ——> [ 文档解析 & 文本处理 ] ——> [ 结果返回 ]
```

### 模块划分

**前端 (React + Tailwind CSS)**
- 文件上传表单组件
- 结果展示页面（支持实时搜索）
- 多种下载选项组件
- 用户交互和视觉反馈
- **多语言支持**：简体中文、繁体中文、英文
- **等待时游戏**：贪吃蛇游戏（多语言支持）

**后端 API (Python FastAPI 或 Go)**
- 接收上传的文件
- 识别文件类型（.doc / .docx）
- 调用解析模块提取纯文本
- 调用缩写提取模块
- 返回 JSON 格式结果

**文档解析**
- .docx：使用 textract 或标准库提取文本
- .doc：使用 textract 提取文本
- 输出纯文本字符串

**缩写提取算法**
- 支持Unicode字符（中英文等）
- 正则匹配 (value, key) 格式
- 过滤规则：排除纯数字和空字符串
- 结果去重和字典序排序

## 部署指南

### 系统要求

- Python 3.10+ (Python后端)
- Go 1.18+ (Go后端)  
- Node.js 14+ (前端)
- npm 或 yarn

### 1. Python 后端部署

#### 1.1 环境准备

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

#### 1.2 启动后端服务器

```bash
# 在项目根目录运行
venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端服务器将在 `http://localhost:8000` 启动，支持热重载。

### 2. Go 后端部署

#### 2.1 环境准备

```bash
# 确保Go已安装
go version

# 安装依赖（如果需要）
go mod download
```

#### 2.2 启动Go后端服务器

```bash
# 直接运行
go run main.go

# 或编译后运行
go build -o abbrevscan-go
./abbrevscan-go
```

Go后端服务器同样在 `http://localhost:8000` 启动。

#### 2.3 Go后端特性

**优势**:
- 无外部依赖（仅使用标准库）
- 性能优异（编译语言）
- 内存使用更低

**当前限制**:
- 仅支持 .docx 文件（.doc 文件需要额外库支持）
- 需要网络访问来下载 unidoc/unioffice 库（已在 go.mod 中配置）

### 3. 前端部署 (React + Tailwind CSS)

#### 3.1 环境准备

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

#### 3.2 配置检查

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

#### 3.3 启动前端服务器

```bash
# 在前端目录运行
npm start
```

前端服务器将在 `http://localhost:3000` 启动。

### 4. 完整部署脚本

创建部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 后端部署 (Python)
echo "正在部署Python后端..."
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-docx textract python-multipart

# 前端部署
echo "正在部署前端..."
cd doc-abbr-web
npm install
npm install -D tailwindcss@^3.4.0 postcss autoprefixer

echo "部署完成！"
echo "启动Python后端: venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "启动Go后端: go run main.go"
echo "启动前端: cd doc-abbr-web && npm start"
```

### 5. 生产环境部署

**Python后端生产部署：**
```bash
# 使用Gunicorn作为生产服务器
venv/bin/pip install gunicorn
venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

**Go后端生产部署：**
```bash
# 编译为可执行文件
go build -o abbrevscan-go

# 运行编译后的程序
./abbrevscan-go
```

**前端生产构建：**
```bash
cd doc-abbr-web
npm run build
# 构建后的文件在 build/ 目录，可部署到任何静态文件服务器
```

## 使用说明

### 基本使用流程

1. 启动选择的后端（Python或Go）
2. 启动前端服务器
3. 在浏览器中打开 `http://localhost:3000`
4. 上传 .doc 或 .docx 文件
5. 查看提取的缩写结果
6. 使用搜索框实时过滤结果
7. 选择需要的导出格式下载结果

### API 接口

#### POST /upload
上传文件提取缩写。

**请求:**
- Content-Type: multipart/form-data
- Body: 包含 .doc/.docx 文件的表单字段

**响应:**
```json
{
  "result": [
    {"key": "BPA", "value": "bisphenol A"},
    {"key": "WHO", "value": "World Health Organization"},
    {"key": "中文", "value": "中文全称"}
  ]
}
```

## 技术实现细节

### 缩写提取算法

使用正则表达式匹配文本中的缩写模式，支持格式：
- `全称 (缩写)`
- `缩写 (全称)`
- 其他包含逗号分隔的配对格式

**关键正则表达式**：
- 使用 `[^\W\d_]` 匹配任何语言的字母字符
- 支持非ASCII字符识别
- 排除纯数字和空字符串

### 文件解析技术

**Python版本**:
- 使用 `textract` 库处理 .doc 和 .docx 文件
- 依赖系统工具（如 antiword 用于 .doc 文件）

**Go版本**:
- 使用标准库处理 .docx 文件
- .doc 文件需要额外库支持

## 故障排除

### 常见问题

1. **端口冲突**: 确保8000和3000端口未被占用
2. **Python包安装失败**: 尝试使用较旧版本的textract
   ```bash
   pip install textract==1.6.3
   ```
3. **CORS错误**: 确保后端已正确配置CORS中间件
4. **文件处理问题**: 确保系统已安装textract所需的依赖

### 文件处理依赖

对于 .doc 文件处理，可能需要安装：
- antiword（Linux/Mac）
- 或其他文本提取工具

## 项目结构

```
AbbrevScan/
├── main.py                 # Python FastAPI后端主文件
├── main.go                 # Go后端主文件
├── go.mod                  # Go模块定义
├── go.sum                  # Go依赖校验
├── requirements.txt        # Python依赖
├── design.md               # 系统设计文档
├── README_GO.md            # Go后端说明文档
├── deploy.sh               # 部署脚本
├── uploads/                # 临时文件上传目录
├── venv/                   # Python虚拟环境
└── doc-abbr-web/           # React前端项目
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    └── src/
        ├── App.js         # 主组件（包含多语言支持）
        ├── SnakeGame.js   # 贪吃蛇游戏组件（多语言支持）
        └── index.css      # Tailwind样式
```

## 维护与更新

### 更新依赖

**Python后端:**
```bash
venv/bin/pip install -U fastapi uvicorn python-docx textract python-multipart
```

**Go后端:**
```bash
go mod tidy
go mod download
```

**前端:**
```bash
cd doc-abbr-web
npm update
```

### 日志查看

后端日志直接显示在控制台，包含错误详情和处理结果。

## 扩展建议

1. **数据库集成**: 添加SQLite或PostgreSQL存储处理历史
2. **用户认证**: 添加JWT或OAuth认证
3. **批量处理**: 支持批量上传多个文件
4. **API文档**: FastAPI自动生成API文档在 `/docs` 端点
5. **更多格式支持**: 扩展支持PDF、RTF等文档格式
6. **高级搜索**: 添加正则表达式搜索和过滤选项
7. **Go后端增强**: 添加 .doc 文件支持，完善功能

## 版本选择建议

| 需求场景 | 推荐版本 |
|---------|----------|
| 需要完整功能（.doc + .docx） | Python后端 |
| 追求高性能和低内存 | Go后端 |
| 生产环境部署 | Go后端（编译后部署） |
| 开发和测试 | Python后端（热重载方便） |

## 技术支持

如有问题请查看：
- GitHub Issues: [https://github.com/Ye-Yu-Mo/AbbrevScan/issues](https://github.com/Ye-Yu-Mo/AbbrevScan/issues)
- API文档: `http://localhost:8000/docs` (Python后端)

---
*最后更新: 2025年8月23日*
