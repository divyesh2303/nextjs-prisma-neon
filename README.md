# 🚀 Multi-Tenant SaaS Dashboard

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Master DB     │    │  Project DB 1   │    │  Project DB 2   │
│  (Projects)     │    │    (Users)      │    │    (Users)      │
│                 │    │                 │    │                 │
│ - id            │    │ - id            │    │ - id            │
│ - name          │    │ - name          │    │ - name          │
│ - databaseUrl   │────┤ - email         │    │ - email         │
│ - createdAt     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

3. **Set up environment variables**

   ```bash
   mkdir .env
   ```

   Download npm

   ```bash
   npm install
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="your-main-database-url"
   PROJECT_DATABASE_URL="<do not add anything >"

   # Neon API (for creating project databases)
   NEON_API_KEY="your-neon-api-key"
   NEON_ORG_ID="your-neon-ORG-id"





   ```

4. **Set up the database**

   ```bash
   npx prisma generate --schema=prisma/schema.prisma
   npx prisma generate --schema=prisma-project/projectSchema.prisma

   ```

## 🛠️ Tech Stack

| Category       | Technology              |
| -------------- | ----------------------- |
| **Framework**  | Next.js 15 (App Router) |
| **Language**   | TypeScript              |
| **Database**   | Neon (PostgreSQL)       |
| **ORM**        | Prisma                  |
| **Styling**    | Tailwind CSS            |
| **Icons**      | Lucide React            |
| **Deployment** | Vercel (recommended)    |

## Demo Quetion

```
how many task is remaining?
```
