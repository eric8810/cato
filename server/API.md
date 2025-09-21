# API Documentation

Base URL: `http://localhost:3000/api`

## Documents

### Upload Document
```
POST /documents/upload
Content-Type: multipart/form-data
Body: file (supports .txt, .md)
Response: { message, document: { id, name, type, size, uploadTime, status } }
```

### List Documents
```
GET /documents
Response: { documents: [{ id, name, type, size, uploadTime, status }] }
```

### Delete Document
```
DELETE /documents/:id
Response: { message }
```

## Chat

### Send Message
```
POST /chat/message
Body: { message: string, stream?: boolean }
Response: { message: { id, role, content, timestamp, sources }, success }
```

### Send Message (Streaming)
```
POST /chat/message
Body: { message: string, stream: true }
Content-Type: text/event-stream
Response: SSE events
- start: { type: 'start', id, role, timestamp }
- token: { type: 'token', id, content }
- end: { type: 'end', message: { id, role, content, timestamp, sources } }
- error: { type: 'error', error }
```

### Get History
```
GET /chat/history
Response: { history: [{ id, role, content, timestamp, sources }], success }
```

### Clear History
```
DELETE /chat/clear
Response: { message, success }
```

## Configuration

### Get Model Config
```
GET /config/model
Response: { config: { embedding, generation, rag }, success }
```

### Update Model Config
```
PUT /config/model
Body: { embedding?, generation?, rag? }
Response: { message, config, success }
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error