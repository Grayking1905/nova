# Nova project instructions

- Keep real credentials, database connection strings and API keys only in the ignored root `.env` file. Read them through environment variables on the server. Never hardcode, log, commit or expose secrets through the frontend or `VITE_` variables. `.env.example` contains empty placeholders only.
- Keep workplace data and realtime traffic scoped to the immutable join code. World seeds resolve to that same workplace, never a separate shared global state.
- Use Prisma migrations for database changes. Never reset or force-push a shared database schema.
