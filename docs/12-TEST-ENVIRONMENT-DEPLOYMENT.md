# Test Environment Deployment

## Purpose and boundary

This is an internal acceptance environment, not the production environment.

- Web: Vercel project with root directory `apps/web`
- API: Railway service built from the repository root using `apps/api/Dockerfile`
- Database: a Railway PostgreSQL service created only for this test environment
- File storage: private Cloudflare R2 Bucket `palmpay-design-hub-test`
- Authentication: `AUTH_MODE=test`, a deliberately isolated, server-signed test session adapter

Do not use `AUTH_MODE=development` on any Internet-facing API. The development adapter trusts an HTTP header and is local-only by design. Do not use the test adapter in the future production environment; production requires OIDC/SSO.

## 1. Railway API and PostgreSQL

1. Create a Railway project named `palmpay-design-hub-test`.
2. Add a PostgreSQL service.
3. Add a GitHub service from `lomi2026/palmpay-design-intelligence`, branch `codex/v1-project-handoff`.
4. Railway reads `railway.toml` and builds `apps/api/Dockerfile` from the repository root.
5. Set the API service variables below. Use Railway's PostgreSQL connection URL for `DATABASE_URL`.
6. Generate a public Railway domain for the API service. Record it as `API_TEST_ORIGIN`.
7. API startup runs `prisma migrate deploy`. Seed the system roles, taxonomy and approved bootstrap data once after the first successful deployment.

Required Railway API variables:

```dotenv
NODE_ENV="production"
DATABASE_URL="${{Postgres.DATABASE_URL}}"
AUTH_MODE="test"
AUTH_AUTO_PROVISION="false"
DEFAULT_ORGANIZATION_CODE="palmpay-experience-design"
TEST_AUTH_ACCESS_CODE="<at least 24 random characters; share only with approved testers>"
TEST_AUTH_SESSION_SECRET="<at least 32 random characters; never share>"
TEST_AUTH_SESSION_TTL_SECONDS="28800"
TEST_BOOTSTRAP_ADMIN_EMAIL="lomi2026@126.com"
TEST_BOOTSTRAP_ADMIN_NAME="PalmPay Test Administrator"
WEB_ORIGIN="https://<Vercel-test-domain>"
API_BASE_URL="https://<Railway-API-domain>"
FILE_STORAGE_DRIVER="r2"
R2_ENDPOINT="https://<Cloudflare-account-id>.r2.cloudflarestorage.com"
R2_BUCKET="palmpay-design-hub-test"
R2_ACCESS_KEY_ID="<Cloudflare R2 access key>"
R2_SECRET_ACCESS_KEY="<Cloudflare R2 secret key>"
R2_SIGNED_URL_TTL_SECONDS="300"
```

Do not set `NEXT_PUBLIC_API_BASE_URL` on Railway. It belongs to Vercel.

### Initial database data (run once)

After the Railway API reports healthy, open its Railway Shell and run the following from the image's repository root:

```bash
cd /app
pnpm --filter @palmpay/api prisma:seed
pnpm --filter @palmpay/api prisma:bootstrap:test
pnpm --filter @palmpay/api prisma:import:v9-1-projects
pnpm --filter @palmpay/api prisma:import:v9-1-ai-catalog
pnpm --filter @palmpay/api prisma:import:v9-1-design-assets
```

`prisma:bootstrap:test` creates or reactivates the configured administrator, makes that user the owner of the `palmpay-experience-design` team, and assigns both the organization-scoped `admin` and `member` roles. It is idempotent and must be used only in the isolated test database.

The three v9-1 import commands are also idempotent. Their expected first-run totals are 33 AI projects, 6 AI Skills, 4 AI cases and 8 design assets. Do not use a local database dump as a cloud-test restore: it could include unrelated local identities and historical data.

## 2. Vercel web project

1. Import the same GitHub repository into Vercel.
2. Select branch `codex/v1-project-handoff`.
3. Set Root Directory to `apps/web`.
4. Enable source files outside the Root Directory if Vercel asks; the pnpm workspace lockfile is in the repository root.
5. Add both variables below for the Preview/Test environment, then deploy.

```dotenv
AUTH_MODE="test"
API_BASE_URL="https://<Railway-API-domain>"
NEXT_PUBLIC_API_BASE_URL="https://<Railway-API-domain>"
```

The server-only `API_BASE_URL` lets Next.js server components call the API. `NEXT_PUBLIC_API_BASE_URL` is used by browser-side upload code.

## 3. Exact-origin CORS updates

After Vercel creates the test URL:

1. Set Railway `WEB_ORIGIN` to the exact HTTPS Vercel origin, with no trailing slash.
2. In R2 Bucket CORS, retain `http://localhost:3000` and add the exact Vercel test origin:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://<Vercel-test-domain>"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD", "DELETE"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. Test identity and acceptance

- The initial administrator is the value in `TEST_BOOTSTRAP_ADMIN_EMAIL` (`lomi2026@126.com` for this acceptance environment). Sign in with that email and the shared test access code after the Vercel deployment is live.
- Each additional tester must first be created as an active user and assigned member, reviewer, manager or administrator roles through the formal administration surface.
- Share the test access code only through an approved internal channel. It is not an account password and must be rotated after the acceptance period.
- Verify member upload/submission, reviewer assignment/decision, administrator publication, signed attachment download and unauthorized-access rejection.

## 5. Production boundary

Never promote this database, shared test code, R2 Bucket or credentials directly to production. Production uses its own PostgreSQL database, production R2 Bucket and enterprise OIDC/SSO integration.
