# TAPI – Internal API

API interna multi-tenant con TypeScript, Express, arquitectura modular Clean/Hexagonal, RBAC por empresa y almacenamiento de documentos en Supabase Storage.

## Stack

- **Node** 20+
- **TypeScript**, **Express**
- **PostgreSQL** (Supabase) + **Prisma**
- **Auth**: Clerk (SDK `@clerk/express`). Identidad en Clerk; autorización en DB.
- **Storage**: Supabase Storage (bucket privado, URLs firmadas).
- **Validación**: zod. **Logging**: pino + pino-http. **Seguridad**: helmet + cors.
- **Tests**: vitest + supertest. **Lint/Format**: eslint + prettier.

## Requisitos

- Node 20+
- Cuenta Supabase (Postgres + Storage)
- Cuenta Clerk (Secret Key desde Dashboard → API Keys)
- Variables de entorno (ver `.env.example`)

## Subir a GitHub

- **No hagas commit de `.env`** ni de credenciales reales. El repositorio incluye `.gitignore` que excluye `.env`, `node_modules/`, `dist/` y archivos sensibles.
- Usa **`.env.example`** como plantilla (solo placeholders). Cada desarrollador o entorno clona el repo, copia `.env.example` a `.env` y rellena sus propias claves.
- Más medidas: ver [SECURITY.md](SECURITY.md).

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con DATABASE_URL, CLERK_*, SUPABASE_*
```

## Base de datos

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

El seed crea:

- Usuario **superadmin** con `clerkUserId=clerk_test_superadmin`, `isSuperAdmin=true`
- **Demo Company**
- **Membership** OWNER para `clerk_test_owner`

## Desarrollo

```bash
npm run dev
```

Servidor en `http://localhost:3000` (o el `PORT` de `.env`).

### Documentación OpenAPI (Lovable-friendly)

- **GET /docs** — Swagger UI (sin auth). Abre en el navegador para explorar y probar la API.
- **GET /openapi.json** — Especificación OpenAPI 3 en JSON.

Todas las rutas están documentadas con ejemplos de request/response y el header opcional **x-company-id** donde aplica.

### CORS

Configurable por env para frontends (p. ej. Lovable):

- **CORS_ORIGINS**: lista separada por comas. Soporta wildcards, ej. `https://*.lovable.app`.
- Si está vacío en **development** se permite `*`; en **production** vacío restringe (no CORS).
- Headers permitidos: `Authorization`, `Content-Type`, `x-company-id`.
- Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS.

Ejemplo en `.env`:

```env
CORS_ORIGINS=http://localhost:3000,https://*.lovable.app,https://tu-dominio.com
```

## Build y producción

```bash
npm run build
npm run start
```

## Despliegue en Azure Web App (GitHub Actions)

El workflow `.github/workflows/main_tohuapi.yml` hace build y deploy a Azure en cada push a `main`.

### 1. En Azure Portal

- Crea un **App Service** (Web App), runtime **Node 20** (LTS).
- En **Configuration** → **Application settings** añade:
  - Variables de entorno (igual que tu `.env`): `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET`, `CORS_ORIGINS`, etc.
  - **SCM_DO_BUILD_DURING_DEPLOYMENT** = `false` — así Azure no vuelve a hacer `npm install`/`npm run build`; usa el artefacto ya compilado por el workflow.
  - (Opcional) **WEBSITE_NODE_DEFAULT_VERSION** = `~20` para fijar Node 20.
- **General settings** → **Startup Command**: exactamente `npm start` (o vacío). No duplicar comandos para evitar `EADDRINUSE`.
- En **Deployment Center** (o **Overview**): descarga el **Publish profile** del Web App.

### 2. En GitHub

- **Settings** → **Secrets and variables** → **Actions**:
  - **New repository secret**: nombre `AZURE_WEBAPP_PUBLISH_PROFILE`, valor = contenido del archivo Publish profile descargado.
- **Settings** → **Secrets and variables** → **Actions** → **Variables**:
  - **New repository variable**: nombre `AZURE_WEBAPP_NAME`, valor = nombre de tu Web App en Azure (ej. `tapi-api`).

### 3. Migraciones de base de datos

Las migraciones no se ejecutan en el workflow. Una vez desplegado, puedes:

- Ejecutarlas a mano desde tu máquina: `npx prisma migrate deploy` (con `DATABASE_URL` apuntando a la DB de producción), o
- Añadir un paso en el workflow después del build (ej. run con un script que use la `DATABASE_URL` del secret) si quieres que se apliquen en cada deploy.

Con eso, cada push a `main` hará build (install, prisma generate, npm run build) y deploy del artefacto a la Web App.

## Tests

- **GET /health** no requiere base de datos y siempre puede ejecutarse.
- El resto de tests (auth RBAC, documents, prefill) necesitan **PostgreSQL** en marcha y que hayas ejecutado `prisma:migrate` y `prisma:seed` (y opcionalmente que exista la DB de test indicada en `DATABASE_URL`).

```bash
# Con .env configurado y Postgres/Supabase disponible:
npm run prisma:migrate
npm run prisma:seed
npm run test
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con tsx watch |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Ejecuta `dist/main.js` |
| `npm run test` | Tests con vitest |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (escribir) |
| `npm run format:check` | Prettier (solo verificar) |
| `npm run prisma:generate` | Genera Prisma Client |
| `npm run prisma:migrate` | Migraciones en desarrollo |
| `npm run prisma:seed` | Ejecuta seed |
| `npm run prisma:studio` | Abre Prisma Studio |

## Endpoints (MVP)

- **GET /health** – Público. `{ ok: true, data: { status, timestamp } }`.
- **GET /api/me** – Usuario actual y empresas. Requiere auth. Devuelve `{ user: { id, clerkUserId, email, name, isSuperAdmin }, companies: [{ companyId, name, role }] }`. Útil para que el frontend seleccione empresa y guarde `x-company-id`.
- **Companies** (solo SUPERADMIN):
  - **POST /api/companies** – `{ name }` → crea empresa.
  - **GET /api/companies** – Lista empresas.
- **Memberships** (ADMIN/OWNER por empresa o SUPERADMIN):
  - **POST /api/companies/:companyId/memberships** – `{ clerkUserId, email?, name?, role }`. Crea usuario si no existe; upsert membership.
  - **DELETE /api/companies/:companyId/memberships/:membershipId**
- **Documents** (OPERATOR+ o SUPERADMIN, `x-company-id` obligatorio):
  - **POST /api/documents** – Multipart: `type` (PDF|IMAGE|XML), `file`. Devuelve `{ documentId, storageKey, type, originalName, size, mimeType }`.
  - **POST /api/documents/:documentId/signed-url** – Body opcional: `{ ttlSeconds }`. Devuelve `{ url, expiresIn }`.
- **Prefill XML** (OPERATOR+):
  - **POST /api/prefill/xml** – Multipart: `product` (IMSS|RCV|INFONAVIT), `xml`. Devuelve `{ fields, warnings, source }`.

## Autenticación

- En producción: **Authorization: Bearer &lt;token&gt;** (JWT de Clerk). Se valida con JWKS y se extrae `subject` como `clerkUserId`.
- En tests: con `NODE_ENV=test` y `TEST_AUTH_BYPASS=true` se usa el header **x-test-clerk-user-id** (por defecto `clerk_test_superadmin`).

## Contexto de empresa

- **x-company-id** (header) o **:companyId** (param) definen la empresa del request.
- **req.ctx** incluye: `auth.clerkUserId`, `user.id` / `user.isSuperAdmin`, `companyId`, `membership.id` / `membership.role`.

## Roles

- **SUPERADMIN** (global, en `User.isSuperAdmin`): crea empresas y asigna primeros admins.
- Por empresa (en `Membership.role`): **OWNER**, **ADMIN**, **OPERATOR**, **VIEWER**. Orden: VIEWER &lt; OPERATOR &lt; ADMIN &lt; OWNER &lt; SUPERADMIN.

## Respuesta estándar

- Éxito: `{ ok: true, data: ... }`
- Error: `{ ok: false, error: { code, message, details? } }`

## Flujo frontend (ej. Lovable)

1. **Login** con Clerk en el frontend → obtienes el token (session).
2. **GET /api/me** con `Authorization: Bearer <token>` → devuelve usuario y lista de empresas con rol. El usuario elige empresa.
3. En requests siguientes enviar **x-company-id** (header) con el `companyId` elegido.
4. **POST /api/documents** (multipart: `type`, `file`) para subir; luego **POST /api/documents/:id/signed-url** para obtener URL de descarga.

## Seguridad

- **SUPABASE_SECRET_KEY** (clave Secret, no la Publishable) solo en backend; nunca en frontend.
- Bucket de documentos privado; acceso solo mediante URLs firmadas con TTL configurable.
