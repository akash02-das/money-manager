# Money Manager — NestJS Backend Service

Production-ready NestJS 11 backend service powered by Prisma ORM and PostgreSQL 16.

For full project instructions, see the main repository [README.md](../README.md).

---

## Quick Start (Terminal Commands)

### 1. Start PostgreSQL
```bash
sudo docker run -d --name money-manager-db \
  -e POSTGRES_USER=moneymanager \
  -e POSTGRES_PASSWORD=manager_secret_pass \
  -e POSTGRES_DB=moneymanager_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Push Schema & Seed
```bash
npx prisma db push
npx prisma db seed
```

### 3. Start Development Server
```bash
npm run start:dev
```
- API Base: `http://localhost:4000/api/v1`
- Swagger Docs: `http://localhost:4000/api/docs`
- Health: `http://localhost:4000/api/v1/health`

### 4. Run Tests
```bash
npm test
```

