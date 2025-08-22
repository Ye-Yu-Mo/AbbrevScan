# 设计文档：文档缩写提取网站

## 1. 功能需求

用户可以上传 .doc 或 .docx 文件。

系统从文档中提取纯文本。

系统分析文本内容，识别出缩写 (key) 和全称 (value)，支持中英文及其他Unicode字符。

自动去除无效数据（如纯数字）。

去重并按字典序排序。

结果返回给用户（网页显示 + 多种下载格式 + 搜索功能）。

## 2. 系统架构
[ 前端 ] —— 文件上传 ——> [ 后端 API ] ——> [ 文档解析 & 文本处理 ] ——> [ 结果返回 ]

### 模块划分

**前端**
- 文件上传表单
- 结果展示页面（支持实时搜索）
- 多种下载选项（TXT、JSON）
- 复制到剪贴板功能
- 清除结果功能
- 加载动画和用户反馈
- 技术选型：React + Tailwind CSS

**后端 API**
- 接收上传的文件
- 识别文件类型（.doc / .docx）
- 调用解析模块提取纯文本
- 调用缩写提取模块
- 返回 JSON（缩写-全称对）
- 技术选型：Python FastAPI

**文档解析**
- .docx：textract 提取文本
- .doc：textract 提取文本
- 输出：纯文本字符串

**缩写提取**
- 支持Unicode字符（中英文等）
- 正则匹配 (value, key)，要求：
  - 必须有逗号
  - key/value 不能是纯数字
  - 支持非ASCII字符
- 结果存入集合（去重 + 排序）

**结果返回**
JSON 格式，例如：
```json
[
  {"key": "BPA", "value": "bisphenol A"},
  {"key": "WHO", "value": "World Health Organization"},
  {"key": "中文", "value": "中文全称"}
]
```

## 3. 技术选型

**前端**：React + Tailwind CSS + 现代浏览器API

**后端**：Python FastAPI + textract + python-docx

**文档解析**：
- .docx：textract
- .doc：textract

**缩写提取**：正则表达式 + 集合去重（Python set）

**部署**：
- Nginx + Gunicorn + FastAPI
- 或 Docker 化部署

## 4. 数据流程

用户上传文件 → POST /upload

后端保存临时文件

判断后缀 .docx or .doc

调用解析模块 → 纯文本

调用缩写提取模块 → 缩写对集合

返回 JSON → 前端展示

用户可进行：
- 实时搜索过滤
- 下载TXT文件
- 下载JSON文件  
- 复制到剪贴板
- 清除结果重新上传

## 5. 关键正则与算法

**Unicode支持**：使用 `[^\W\d_]` 匹配任何语言的字母字符

**缩写提取**：基于逗号分割，支持非ASCII字符

**过滤规则**：排除纯数字和空字符串

## 6. 安全与性能

限制上传文件大小（例如 ≤ 5MB）

仅允许 .doc .docx 后缀

删除处理完的临时文件，避免存储泄露

使用异步处理（FastAPI async）提高并发性能

## 7. 用户体验增强

**视觉反馈**：
- 上传按钮加载动画
- 搜索输入框实时过滤指示器
- 错误信息清晰展示

**功能增强**：
- 实时搜索（支持中英文）
- 多种导出格式（TXT、JSON）
- 一键复制到剪贴板
- 清除结果功能

## 8. 示例用户流程

打开网站 → 上传 report.docx

系统提取：
```
BPA bisphenol A
WHO World Health Organization
中文 中文全称
```

网页展示结果表格（支持搜索过滤）：

| 缩写 (key) | 全称 (value)         |
|------------|----------------------|
| BPA        | bisphenol A          |
| WHO        | World Health Organization |
| 中文       | 中文全称             |

用户可进行：
- 在搜索框输入关键词实时过滤
- 点击"TXT"按钮下载文本文件
- 点击"JSON"按钮下载JSON文件
- 点击"复制"按钮复制到剪贴板
- 点击"清除"按钮重新开始
