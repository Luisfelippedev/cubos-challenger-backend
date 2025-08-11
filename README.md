## Panda Filmes — Cubos.io Challenge (Backend)

API para gerenciamento de filmes, autenticação e notificações, desenvolvida para o desafio técnico da Cubos. Permite cadastro e listagem de filmes por usuário, upload de capa para S3, autenticação via JWT, paginação e filtros, além de notificações por e-mail em estreias diárias.

### 🚀 Deploy
- Backend API: `https://cubos-challenger-backend-production.up.railway.app`
- Documentação Swagger: `https://cubos-challenger-backend-production.up.railway.app/docs`

### Sobre
Backend do teste técnico da Cubos.io para gerenciamento de filmes.

### Stack
- NestJS 11 (TypeScript)
- Prisma ORM + PostgreSQL
- JWT (autenticação)
- Class-Validator / Class-Transformer
- Swagger (OpenAPI)
- AWS S3 (upload de imagens)
- Multer (upload memory storage)
- Nodemailer + MailHog (dev/test)
- Cron (nestjs/schedule)

### Arquitetura e padrões
- Camadas por módulo (`user`, `auth`, `movie`)
- DTOs com validação
- Middlewares de autenticação e logger
- Filtro global de exceções com payload consistente
- Serviço dedicado para S3

### Rotas principais
- Autenticação
  - POST `/auth/login`
  - POST `/auth/refresh`
- Usuários
  - POST `/user`
  - GET `/user/:id`
- Filmes
  - POST `/movie`
  - GET `/movie`
  - GET `/movie/:id`
  - PATCH `/movie/:id`
  - DELETE `/movie/:id`
  - POST `/movie/cover`
    - multipart/form-data, campo `file`
    - erros claros em português: formato inválido, arquivo ausente e tamanho excedido

Campos do filme
- `title` (string, obrigatório)
- `originalTitle` (string, opcional)
- `description` (string, obrigatório)
- `duration` (number, obrigatório)
- `releaseDate` (date YYYY-MM-DD, obrigatório)
- `genres` (string[], obrigatório)
- `coverImageUrl` (string URL, opcional)

### Upload de capa (S3)
- Cada usuário possui seu próprio prefixo: `users/{userId}/covers/arquivo`.
- Tamanho máximo: 10MB.
- Formatos aceitos: JPEG, PNG, WEBP.
- Resposta do upload: `{ key, url }`.

Exemplo `curl`:
```bash
curl -X POST "https://<seu-backend>.up.railway.app/movie/cover" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/caminho/para/capa.jpg"
```

Mensagens de erro previsíveis:
- "Formato de imagem inválido. Envie um arquivo JPEG, PNG ou WEBP."
- "Arquivo inválido ou ausente."
- "Arquivo muito grande. O tamanho máximo permitido é 10MB."
- "Falha ao enviar arquivo ao S3"

## Como rodar localmente

### Pré-requisitos
- Node.js >= 20
- Docker e Docker Compose
- Yarn (ou npm)

### Passo a passo
1. Clone o repositório e instale dependências:

```bash
git clone <repo>
cd cubos-challenger-backend
yarn install
```

2. Configure variáveis de ambiente criando `.env` na raiz (exemplo abaixo).

3. Suba Postgres e MailHog com Docker:

```bash
docker compose up -d db mailhog
```

4. Execute as migrações do Prisma:

```bash
yarn prisma:deploy
```

5. Rode a aplicação:

```bash
yarn start:dev
```

6. Acesse a documentação:

```text
http://localhost:3000/docs
```

7. Painel do MailHog (local):

```text
http://localhost:8025
```

### Variáveis de ambiente (.env)

```bash
# App
PORT=3000

# Banco
DATABASE_URL="postgresql://teste:teste@localhost:5432/cubos-database?schema=public"

# Segurança
SECURITY_JWT="<jwt-secret>"

# E-mail (dev/test com MailHog)
EMAIL_FROM="Cubos <no-reply@example.com>"
SMTP_HOST=127.0.0.1
SMTP_PORT=1025

# AWS S3
AWS_ACCESS_KEY_ID=<acess-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=<ex: sa-east-1>
AWS_S3_BUCKET=<nome-do-bucket>
```
