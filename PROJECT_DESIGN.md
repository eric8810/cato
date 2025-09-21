# RAG 对话系统项目设计文档

## 项目概述

基于 TypeScript 的本地 RAG (Retrieval-Augmented Generation) 对话系统，支持文档上传、预处理和智能对话。

## 技术栈 (经2024-2025最新技术验证)

### 后端 (./server)
- **框架**: Koa.js v2.15+ (现代async/await支持，轻量级)
- **语言**: TypeScript 5.0+
- **RAG引擎**: LlamaIndex TypeScript v0.12.0 (最新稳定版)
- **向量数据库**: Qdrant (本地部署，性能最优)
- **文档处理**: 支持 .txt, .md 格式
- **运行环境**: Node.js 18+ (LlamaIndex要求)

### 前端 (./web)
- **框架**: Vue.js 3.5+ (Composition API)
- **语言**: TypeScript 5.0+
- **状态管理**: Pinia (Vue 3原生支持)
- **UI组件**: shadcn-vue (基于Reka UI + Tailwind CSS)
- **样式框架**: Tailwind CSS v4
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 系统架构 (2024最佳实践)

```
┌─────────────────┐    HTTP API    ┌──────────────────┐
│   Vue.js 前端   │ ──────────────→ │   Koa.js 后端    │
│  (Composition)  │ ←────────────── │  (LlamaIndex)    │
└─────────────────┘                └──────────────────┘
                                            │
                                            ▼
┌─────────────────┐                ┌──────────────────┐
│  Qdrant Vector  │ ←─────────────→ │  Qwen 模型服务   │
│   Database      │    查询/存储    │  Embedding+Gen   │
│  (本地部署)     │                │  (llama.cpp)     │
└─────────────────┘                └──────────────────┘
```

### 架构优势
- **高性能**: Qdrant提供最优的向量检索性能
- **混合检索**: 支持向量搜索 + 传统过滤
- **本地部署**: 完全本地化，数据安全
- **现代化**: 使用最新的TypeScript生态

## 核心功能模块 (2024最佳实践)

### 1. 文档管理模块
- **文档上传**: 支持 .txt, .md 文件上传
- **智能分块**: 上下文感知分块 (chunk_size: 512, overlap: 50)
- **向量化存储**: 使用一致的embedding模型 (Qwen3-Embedding)
- **文档索引**: Qdrant向量数据库存储和管理

### 2. 高级RAG对话模块
- **混合检索**: 向量搜索 + 关键词过滤
- **两阶段检索**: 快速向量检索 + 精确重排序
- **上下文增强**: 为检索块添加文档标题等上下文信息
- **智能问答**: 基于检索内容的生成式回答

### 3. 模型服务集成
- **Embedding服务**: Qwen3-Embedding-0.6B (端口8080)
- **生成服务**: Qwen3-4B/1.7B (端口8081/8082)
- **参数优化**: temperature: 0.6-0.7, top-k: 20-40, top-p: 0.95
- **性能监控**: 响应时间和准确率追踪

## API 设计

### 文档相关
```typescript
POST /api/documents/upload     // 上传文档
GET  /api/documents           // 获取文档列表
DELETE /api/documents/:id     // 删除文档
```

### 对话相关
```typescript
POST /api/chat/message        // 发送消息
GET  /api/chat/history        // 获取对话历史
DELETE /api/chat/clear        // 清空对话历史
```

### 配置相关
```typescript
GET  /api/config/model        // 获取模型配置
PUT  /api/config/model        // 更新模型配置
```

## 数据结构

### 文档实体
```typescript
interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: Date;
  status: 'processing' | 'ready' | 'error';
}
```

### 消息实体
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}
```

## 部署要求 (2024最新配置)

### 环境依赖
- **Node.js**: 18+ (LlamaIndex TypeScript要求)
- **TypeScript**: 5.0+
- **Docker**: 用于Qdrant和Qwen模型服务
- **内存**: 4GB+ (向量数据库 + 模型推理)

### 服务部署
```bash
# 启动 Qdrant 向量数据库
docker run -p 6333:6333 qdrant/qdrant

# 启动 Qwen 模型服务 (已有配置)
docker-compose -f qwen3-embedding-docker-compose.yml up -d
docker-compose -f qwen3-4b-docker-compose.yml up -d
```

### 配置文件
```typescript
// server/config.ts
export const config = {
  server: {
    port: 3000,
    uploadDir: './uploads'
  },
  qdrant: {
    url: 'http://localhost:6333',
    collectionName: 'documents'
  },
  models: {
    embedding: 'http://localhost:8080',
    generation: 'http://localhost:8081'
  },
  rag: {
    chunkSize: 512,
    chunkOverlap: 50,
    topK: 5,
    hybridSearch: true,
    rerankingEnabled: true
  }
};
```

### 前端UI配置 (shadcn-vue)
```bash
# 初始化 shadcn-vue
npx shadcn-vue@latest init

# 添加核心组件
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
npx shadcn-vue@latest add input
npx shadcn-vue@latest add textarea
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add table
npx shadcn-vue@latest add toast
```

```typescript
// web/tailwind.config.js (Tailwind v4 配置)
import { theme } from '@tailwindcss/theme'

export default {
  content: ['./src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'oklch(47.78% 0.111 257.67)',
          foreground: 'oklch(98.37% 0.002 257.67)'
        }
      }
    }
  }
}
```

## 项目结构

```
./
├── server/                 # 后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   ├── utils/          # 工具函数
│   │   └── app.ts          # 应用入口
│   ├── uploads/            # 文件上传目录
│   └── package.json
│
├── web/                    # 前端应用 (Vue 3 + shadcn-vue)
│   ├── src/
│   │   ├── components/     # Vue组件
│   │   │   └── ui/         # shadcn-vue组件
│   │   ├── views/          # 页面视图
│   │   ├── services/       # API服务
│   │   ├── lib/            # 工具函数
│   │   └── main.ts         # 应用入口
│   ├── tailwind.config.js  # Tailwind配置
│   ├── components.json     # shadcn-vue配置
│   └── package.json
│
└── PROJECT_DESIGN.md       # 项目设计文档
```

## 关键技术选择决策 (基于2024-2025研究)

### 1. LlamaIndex TypeScript v0.12.0
- **选择原因**: 官方TypeScript支持，活跃维护，完整的RAG功能
- **优势**: 类型安全、与现有Qwen模型兼容、丰富的数据连接器

### 2. Qdrant 向量数据库
- **选择原因**: 性能benchmarks显示最优RPS和最低延迟
- **优势**: Rust实现的高性能、支持混合搜索、本地部署友好

### 3. Koa.js (而非Express)
- **选择原因**: 更好的async/await支持、轻量级架构
- **优势**: 现代JavaScript模式、更清洁的中间件系统、性能优势

### 4. Vue 3 Composition API + Pinia + shadcn-vue
- **选择原因**: 2024年最佳TypeScript集成、现代响应式架构
- **优势**: 强类型支持、更好的代码组织、生态系统成熟

### 5. shadcn-vue UI组件系统
- **选择原因**: 2024年Vue生态最受欢迎的现代UI解决方案
- **独特优势**:
  - **非依赖性**: 组件直接复制到项目，完全可控
  - **定制性**: 基于Tailwind CSS，无限定制能力
  - **可访问性**: 遵循现代无障碍标准
  - **TypeScript原生**: 完整类型支持
  - **Tailwind v4**: 支持最新的OKLCH颜色和@theme指令

## 开发流程

1. **环境搭建**: Docker部署Qdrant + Qwen模型服务
2. **后端开发**: Koa + LlamaIndex + Qdrant集成
3. **前端开发**: Vue 3 + Composition API + Pinia
4. **RAG优化**: 实现混合检索和重排序
5. **性能调优**: 向量检索性能和响应时间优化