# Cato - RAG聊天应用

Cato是一个基于检索增强生成(RAG)的聊天应用，集成了Qwen3语言模型、向量数据库和现代化的Web界面。

## 项目架构

### 后端服务
- **Qwen3-Embedding-0.6B**: 文本向量化服务 (端口8080)
- **Qwen3-4B**: 主要语言模型服务 (端口8081)
- **Qwen3-1.7B**: 轻量化语言模型服务 (端口8082)
- **Qdrant**: 向量数据库 (端口6333)
- **Node.js后端**: API服务器和RAG逻辑 (端口3000)

### 前端应用
- **Vue 3 + TypeScript**: 现代化聊天界面
- **Tailwind CSS**: 样式框架
- **Reka UI**: 组件库

## 系统要求

### 硬件要求
- **内存**:
  - Qwen3-1.7B (32k上下文): ~5GB
  - Qwen3-4B: ~8GB
  - Qwen3-Embedding: ~600-800MB
  - Qdrant: ~500MB
  - **总计建议内存**: 16GB以上

- **存储空间**:
  - 模型文件: ~10GB
  - 项目代码: ~500MB
  - Docker镜像: ~2GB

- **CPU**: 支持AVX2指令集的现代处理器 (纯CPU推理)

### 软件要求
- Docker 和 Docker Compose
- Node.js ^20.19.0 或 >=22.12.0
- pnpm (包管理器)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd cato
```

### 2. 下载模型文件

```bash
# 创建模型目录
mkdir -p models

# 下载Qwen3-Embedding模型 (~640MB)
wget -O models/Qwen3-Embedding-0.6B-q4_k_m.gguf \
  https://huggingface.co/Mungert/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-q4_k_m.gguf

# 下载Qwen3-4B模型 (~2.4GB)
wget -O models/Qwen3-4B-Q4_K_M.gguf \
  https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf

# 下载Qwen3-1.7B模型 (~1GB)
wget -O models/Qwen3-1.7B-Q4_K_M.gguf \
  https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf
```

### 3. 启动服务

```bash
# 启动向量数据库
docker-compose -f qdrant-docker-compose.yml up -d

# 启动embedding服务
docker-compose -f qwen3-embedding-docker-compose.yml up -d

# 启动语言模型服务 (选择其一)
docker-compose -f qwen3-1.7b-docker-compose.yml up -d  # 轻量版本
# 或
docker-compose -f qwen3-4b-docker-compose.yml up -d     # 完整版本

# 启动后端API服务
cd server
pnpm install
pnpm dev

# 启动前端应用 (新终端)
cd web
pnpm install
pnpm dev
```

### 4. 访问应用

- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:3000
- **Qdrant管理界面**: http://localhost:6333/dashboard

## API接口

### 嵌入服务 (端口8080)
```bash
curl -X POST http://localhost:8080/embedding \
  -H "Content-Type: application/json" \
  -d '{"content": "测试文本"}'
```

### 聊天完成 (端口8081/8082)
```bash
curl -X POST http://localhost:8081/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}],
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

### 文档管理 (端口3000)
```bash
# 上传文档
curl -X POST http://localhost:3000/api/documents \
  -F "file=@document.txt" \
  -F "title=Document Title"

# RAG聊天
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "问题内容",
    "documentIds": ["doc-id-1", "doc-id-2"]
  }'
```

## 服务配置

### 模型参数
- **Qwen3-1.7B**: 上下文32k, 温度0.7, top-k=40, top-p=0.9
- **Qwen3-4B**: 上下文32k, 温度0.6, top-k=20, top-p=0.95
- **Embedding**: 批处理8192, last token pooling

### 向量检索
- **向量维度**: 512 (Qwen3-Embedding)
- **相似度度量**: 余弦相似度
- **检索数量**: 可配置 (默认5个相关文档)

## 开发命令

```bash
# 前端开发
cd web
pnpm dev          # 开发服务器
pnpm build        # 构建生产版本
pnpm type-check   # 类型检查

# 后端开发
cd server
pnpm dev          # 开发服务器
pnpm start        # 生产服务器
pnpm typecheck    # 类型检查

# 查看服务日志
docker-compose -f qwen3-embedding-docker-compose.yml logs -f
docker-compose -f qwen3-1.7b-docker-compose.yml logs -f
docker-compose -f qdrant-docker-compose.yml logs -f
```

## 故障排除

### 常见问题

1. **内存不足**
   - 使用1.7B模型代替4B模型
   - 减少上下文长度配置
   - 关闭其他占用内存的应用

2. **模型下载失败**
   ```bash
   # 使用git lfs下载
   git lfs install
   git clone https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
   cp Qwen3-1.7B-GGUF/*.gguf models/
   ```

3. **服务启动失败**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep -E '(8080|8081|8082|6333|3000)'

   # 查看详细日志
   docker-compose -f <compose-file> logs
   ```

4. **向量检索无结果**
   - 确认文档已成功上传并处理
   - 检查Qdrant中是否有对应的collection
   - 验证embedding服务是否正常运行

### 性能优化

- **CPU优化**: 确保使用支持AVX2的CPU
- **内存管理**: 监控各服务内存使用，必要时重启
- **并发控制**: 根据硬件配置调整llama.cpp的并发参数

## 许可证

本项目基于MIT许可证开源。