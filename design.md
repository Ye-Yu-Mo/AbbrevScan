设计文档：文档缩写提取网站
1. 功能需求

用户可以上传 .doc 或 .docx 文件。

系统从文档中提取 纯文本。

系统分析文本内容，识别出 缩写 (key) 和 全称 (value)，例如 (bisphenol A, BPA) → BPA bisphenol A。

自动去除无效数据（如纯数字）。

去重并按字典序排序。

结果返回给用户（网页显示 + 下载 .txt）。

2. 系统架构
[ 前端 ] —— 文件上传 ——> [ 后端 API ] ——> [ 文档解析 & 文本处理 ] ——> [ 结果返回 ]

模块划分

前端

文件上传表单

结果展示页面

下载结果按钮

技术选型：React + Tailwind (简洁 UI)

后端 API

接收上传的文件

识别文件类型（.doc / .docx）

调用解析模块提取纯文本

调用缩写提取模块

返回 JSON（缩写-全称对）

技术选型：

Python FastAPI（生态成熟，支持文档处理库）

.docx → python-docx 提取段落文本

.doc → textract 或 antiword 提取纯文本

输出：纯文本字符串

缩写提取

正则匹配 (value, key)，要求：

必须有逗号

key/value 不能是纯数字

或者通过查找 , A → , Z 提取缩写

结果存入集合（去重 + 排序）

结果返回

JSON 格式，例如：

[
  {"key": "BPA", "value": "bisphenol A"},
  {"key": "WHO", "value": "World Health Organization"}
]


前端展示表格 + 下载 .txt

3. 技术选型

前端：React + Tailwind CSS

后端：Python FastAPI（快速开发 & 强大文档处理库）

文档解析：

.docx：python-docx

.doc：textract / antiword

缩写提取：正则表达式 + 集合去重（Python set 或 Rust BTreeSet）

存储：不需要数据库（只处理上传的单个文件）

部署：

Nginx + Gunicorn + FastAPI

或 Docker 化部署

4. 数据流程

用户上传文件 → POST /upload

后端保存临时文件

判断后缀 .docx or .doc

调用解析模块 → 纯文本

调用缩写提取模块 → 缩写对集合

返回 JSON → 前端展示

用户可点击“导出为 TXT”按钮，触发下载

5. 关键正则
\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)


捕获 (value, key)

跳过纯数字：^\d+$

6. 安全与性能

限制上传文件大小（例如 ≤ 5MB）

仅允许 .doc .docx 后缀

删除处理完的临时文件，避免存储泄露

使用队列或异步（FastAPI async）处理大文件

7. 示例用户流程

打开网站 → 上传 report.docx

系统提取：

BPA bisphenol A
WHO World Health Organization


网页展示结果表格：

缩写 (key)	全称 (value)
BPA	bisphenol A
WHO	World Health Organization

用户点击“导出 TXT” → 下载 result.txt