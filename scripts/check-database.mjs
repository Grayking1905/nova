import { connectDatabase } from '../services/realtime/database.mjs';
let db;
try {
  db = await connectDatabase();
  const tables = await db.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()`;
  console.log(JSON.stringify({ connected: true, tables: tables.map(row => row.table_name) }));
} catch { console.error('Database check failed. Verify DATABASE_URL and database availability.'); process.exitCode = 1; }
finally { await db?.$disconnect(); }
