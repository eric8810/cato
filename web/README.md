# Cato - 前端

基于 Vue 3 + TypeScript + shadcn-vue 的现代化 Cato 前端应用。

## 技术栈

- **框架**: Vue.js 3.5+ (Composition API)
- **语言**: TypeScript 5.0+
- **状态管理**: Pinia
- **UI组件**: shadcn-vue (基于 Reka UI + Tailwind CSS)
- **样式框架**: Tailwind CSS v4
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **通知系统**: vue-sonner

## 功能特性

### 📄 文档管理
- 支持 `.txt` 和 `.md` 文件上传
- 实时显示文档处理状态
- 文档列表管理和删除功能
- 文件大小和格式验证

### 💬 智能对话
- 基于 Cato 的智能问答
- 支持流式响应（SSE）
- 消息历史记录
- 引用来源显示
- Markdown 内容渲染

### 🎨 现代化界面
- 响应式设计，支持桌面和移动端
- 深色/浅色主题支持
- 流畅的动画效果
- 直观的用户交互

## 开发环境

### 环境要求
- Node.js 20.19.0+ 或 22.12.0+
- pnpm 10+

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## API 集成

前端与后端通过 RESTful API 和 Server-Sent Events (SSE) 进行通信：

### 主要 API 端点
- `POST /api/documents/upload` - 文档上传
- `GET /api/documents` - 获取文档列表
- `DELETE /api/documents/:id` - 删除文档
- `POST /api/chat/message` - 发送消息（支持流式）
- `GET /api/chat/history` - 获取对话历史
- `DELETE /api/chat/clear` - 清空对话历史

### 配置

默认 API 基础地址：`http://localhost:3000/api`

可在 `src/services/api.ts` 中修改配置。
