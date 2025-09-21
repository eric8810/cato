# Qwen3 Embedding Server

基于 llama.cpp 的 Qwen3-Embedding-0.6B 模型服务器，使用 Docker Compose 部署。

## 快速开始

### 1. 准备模型文件

```bash
# 创建模型目录
mkdir models

# 下载 Qwen3-Embedding-0.6B GGUF 模型
wget -O models/Qwen3-Embedding-0.6B-Q8_0.gguf \
  https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-Q8_0.gguf
```

### 2. 启动服务

```bash
# 启动服务
docker-compose -f qwen3-embedding-docker-compose.yml up -d

# 查看日志
docker-compose -f qwen3-embedding-docker-compose.yml logs -f

# 停止服务
docker-compose -f qwen3-embedding-docker-compose.yml down
```

### 3. 使用 API

服务启动后，可通过 `http://localhost:8080` 访问 embedding API。

#### 获取文本向量

```bash
curl -X POST http://localhost:8080/embedding \
  -H "Content-Type: application/json" \
  -d '{
    "content": "这是一段测试文本"
  }'
```

#### 健康检查

```bash
curl http://localhost:8080/health
```

## 配置说明

- **端口**: 8080
- **模型**: Qwen3-Embedding-0.6B-Q8_0.gguf
- **批处理大小**: 8192
- **池化方式**: last
- **启用详细提示**: 是

## 系统要求

- Docker 和 Docker Compose
- 至少 2GB 可用内存
- 约 640MB 磁盘空间（模型文件）

## 故障排除

### 模型下载失败

如果 wget 下载失败，可以尝试使用 git lfs：

```bash
git lfs clone https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF
cp Qwen3-Embedding-0.6B-GGUF/Qwen3-Embedding-0.6B-Q8_0.gguf models/
```

### 服务无法启动

检查日志输出：

```bash
docker-compose -f qwen3-embedding-docker-compose.yml logs
```

确保模型文件路径正确且文件完整。