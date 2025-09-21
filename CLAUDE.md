# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains Docker Compose configurations for deploying Qwen language models using llama.cpp server. It includes three main services:
- **Qwen3-Embedding-0.6B**: An embedding model service for text vectorization
- **Qwen3-4B**: A 4B parameter language model for text generation
- **Qwen3-1.7B**: A 1.7B parameter language model for lightweight text generation

## Common Commands

### Starting Services

```bash
# Start embedding service
docker-compose -f qwen3-embedding-docker-compose.yml up -d

# Start 4B model service
docker-compose -f qwen3-4b-docker-compose.yml up -d

# Start 1.7B model service
docker-compose -f qwen3-1.7b-docker-compose.yml up -d

# View logs
docker-compose -f qwen3-embedding-docker-compose.yml logs -f
docker-compose -f qwen3-4b-docker-compose.yml logs -f
docker-compose -f qwen3-1.7b-docker-compose.yml logs -f

# Stop services
docker-compose -f qwen3-embedding-docker-compose.yml down
docker-compose -f qwen3-4b-docker-compose.yml down
docker-compose -f qwen3-1.7b-docker-compose.yml down
```

### Model Setup

```bash
# Create models directory (required before first run)
mkdir models

# Download embedding model
wget -O models/Qwen3-Embedding-0.6B-q4_k_m.gguf \
  https://huggingface.co/Mungert/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-q4_k_m.gguf

# Download 4B model
wget -O models/Qwen3-4B-Q4_K_M.gguf \
  https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf

# Download 1.7B model
wget -O models/Qwen3-1.7B-Q4_K_M.gguf \
  https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf
```

## Architecture

The project uses Docker Compose to orchestrate llama.cpp server instances:

- **qwen3-embedding-docker-compose.yml**: Configures embedding service on port 8080
  - Runs in embedding mode with `--embedding` flag
  - Uses last token pooling for vector generation
  - Batch size of 8192 for efficient processing

- **qwen3-4b-docker-compose.yml**: Configures generation service on port 8081
  - Supports chat and completion APIs
  - Context window of 32768 tokens
  - Temperature 0.6, top-k 20, top-p 0.95 for balanced generation

- **qwen3-1.7b-docker-compose.yml**: Configures lightweight generation service on port 8082
  - Supports chat and completion APIs
  - Context window of 32768 tokens
  - Temperature 0.7, top-k 40, top-p 0.9 for creative generation

Both services:
- Use the official `ghcr.io/ggml-org/llama.cpp:server` image
- Mount local `./models` directory for model files
- Include health check endpoints
- Can be configured for GPU acceleration (currently commented out)

## API Endpoints

### Embedding Service (port 8080)
- `POST /embedding` - Get text embeddings
- `GET /health` - Health check

### Generation Service (port 8081)
- `POST /v1/chat/completions` - Chat completion API
- `POST /v1/completions` - Text completion API
- `GET /health` - Health check

### Lightweight Generation Service (port 8082)
- `POST /v1/chat/completions` - Chat completion API
- `POST /v1/completions` - Text completion API
- `GET /health` - Health check

## Important Notes

- Model files (*.gguf) are gitignored and must be downloaded separately
- Services run in CPU-only mode by default; GPU sections are commented out
- The embedding model filename differs between README and docker-compose (Q8_0 vs q4_k_m)
- 这个项目使用pnpm