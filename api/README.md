# Sebby Windows — quote intake API

Node service on Railway. Handles `POST /quote` from the form on sebbywindows.com.

1. Writes the lead to the Supabase `leads` table (same table the six9builder CRM reads,
   `source = 'sebbywindows.com'`, `status = 'new'`).
2. Emails the lead to the owner via Resend and auto-replies to the visitor.

The Supabase write is the source of truth. Email is best-effort: if `RESEND_API_KEY` is
absent or Resend fails, the lead is still saved and the visitor still gets a success
response. That means the form can go live before the Resend domain is verified.

Replaced the Cloudflare Worker that used to live in `worker/`.

## Endpoints

| Method | Path      | Purpose                                   |
| ------ | --------- | ----------------------------------------- |
| GET    | `/health` | `{ok, supabase, resend}` — config check   |
| POST   | `/quote`  | lead intake                               |

`POST /quote` body: `{name, phone, email, city, count, existing, timeline, financing, note}`.
`name` and a 10-digit `phone` are required. 8 submissions per IP per hour.

## Environment

| Variable                | Required | Notes                                          |
| ----------------------- | -------- | ---------------------------------------------- |
| `SUPABASE_URL`          | yes      | `https://cqjpecwifbakomyycrbw.supabase.co`      |
| `SUPABASE_SERVICE_KEY`  | yes      | service role key — server side only, never ship to the browser |
| `RESEND_API_KEY`        | no       | without it the service saves leads and skips email |
| `OWNER_EMAIL`           | no       | defaults to sebpessy@gmail.com                  |
| `FROM_EMAIL`            | no       | must be a Resend-verified sending domain        |
| `ALLOWED_ORIGINS`       | no       | comma list, defaults to the two sebbywindows.com origins |
| `PORT`                  | no       | Railway sets it                                 |

## Local

```bash
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... PORT=8391 npm start
curl localhost:8391/health
```

## Deploy

```bash
railway up
```

Custom domain `api.sebbywindows.com` is bound in the Railway service settings; the CNAME
it prints goes in GoDaddy DNS.
