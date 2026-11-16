# Tickr Web

The Next.js frontend for Tickr. It connects to the Tickr API and supports GitHub sign-in.

## Setup

Requirements: Node.js and pnpm.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Set `GITHUB_ID`, `GITHUB_SECRET`, and `NEXTAUTH_SECRET` in `.env`. Set
`NEXT_PUBLIC_API_URL` to the Tickr API URL. `INTERNAL_API_URL` is optional and
can be used for server-side API requests when the public URL is not reachable
from the Next.js server.

The development server runs at [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server. |
| `pnpm build` | Build for production. |
| `pnpm start` | Run the production server. |
| `pnpm lint` | Run ESLint. |

## Docker

```bash
docker build -t tickr-web .
```
