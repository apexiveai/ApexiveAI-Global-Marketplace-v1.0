# Production deployment

## Backend on Ownkube

- Build from the repository root with the root `Dockerfile` and repository root as the build context.
- Expose the container's configured `PORT` (defaults to `8000`) over HTTPS.
- Configure the variables in `backend/.env.example` in Ownkube's secret/environment settings. Keep `DEBUG=False`; generate a unique `SECRET_KEY`; set `DATABASE_URL` to a reachable PostgreSQL database URL. Do not commit real credentials.
- Set `ALLOWED_HOSTS` to `api-marketplace.apexiveai.com`.
- Set `CORS_ALLOWED_ORIGINS` to `https://apexive-ai-global-marketplace-v1-0.vercel.app` (origin only, no trailing slash or API path). Credentials are enabled for this allowlisted origin.
- Set `CSRF_TRUSTED_ORIGINS` to both `https://apexive-ai-global-marketplace-v1-0.vercel.app` and `https://api-marketplace.apexiveai.com`.
- The HTTPS ingress must overwrite `X-Forwarded-Proto` with the original request scheme; Django trusts that header for secure redirects.
- The container runs migrations and collects static assets before starting Gunicorn. Confirm the database is reachable before deploying.
- `MEDIA_ROOT` is local container storage. Attach persistent storage at `/app/backend/media_uploads` or move uploads to durable object storage before relying on uploaded marketplace media in production.

## Frontend on Vercel

Set `NEXT_PUBLIC_API_BASE_URL` to `https://api-marketplace.apexiveai.com/api/v1` in the Vercel project's production environment, then rebuild and redeploy the frontend. The value is public and is compiled into the Next.js build.

## DNS and TLS

After Ownkube provisions the backend service, map `api-marketplace.apexiveai.com` to the exact hostname or static IP it provides:

- Use a `CNAME` for a provider hostname, or the provider-specified `A`/`AAAA` records for static addresses.
- Do not guess the destination or create both record types. DNS cannot be finalized until Ownkube supplies the target.
- Enable an HTTPS certificate for `api-marketplace.apexiveai.com` in Ownkube and wait for it to become active before testing the API.

The Vercel frontend hostname is already `https://apexive-ai-global-marketplace-v1-0.vercel.app/`; no change to that hostname is required.

## Go-live checks

1. Verify the production variables are present without exposing their values.
2. Verify the app can connect to PostgreSQL and completes migrations.
3. Check `https://api-marketplace.apexiveai.com/api/schema/` and the frontend in a browser.
4. Confirm browser requests from the Vercel origin succeed and unrelated origins are rejected.
5. Verify the API hostname resolves to Ownkube and its TLS certificate is valid.
