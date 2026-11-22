import { Pool } from 'pg';

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('DATABASE_URL environment variable is not configured.');
    this.name = 'DatabaseNotConfiguredError';
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

declare global {
  var __wadiePgPool: Pool | undefined;
  var __wadiePgPoolUrl: string | undefined;
}

function getPool(): Pool {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new DatabaseNotConfiguredError();
  }
  if (!globalThis.__wadiePgPool || globalThis.__wadiePgPoolUrl !== url) {
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
    globalThis.__wadiePgPool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });
    globalThis.__wadiePgPoolUrl = url;
  }
  return globalThis.__wadiePgPool;
}

export type SqlRow = Record<string, any>;
export type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<SqlRow[]>;

export function getSql(): SqlTag {
  const pool = getPool();
  return async (strings: TemplateStringsArray, ...values: unknown[]): Promise<SqlRow[]> => {
    let text = strings[0] || '';
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}${strings[i + 1] || ''}`;
    }
    const result = await pool.query(text, values);
    return result.rows;
  };
}

let schemaInitialized = false;

export async function ensureSchemaAndSeed(): Promise<void> {
  if (schemaInitialized) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      booking_reference VARCHAR(32) NOT NULL UNIQUE,
      customer_name VARCHAR(160) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(160),
      service VARCHAR(160) NOT NULL,
      equipment VARCHAR(160),
      appointment_date DATE NOT NULL,
      appointment_time VARCHAR(20) NOT NULL,
      project_location VARCHAR(240) NOT NULL,
      message TEXT,
      status VARCHAR(24) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date)`;

  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name_ar VARCHAR(180) NOT NULL,
      name_fr VARCHAR(180) NOT NULL,
      description_ar TEXT NOT NULL,
      description_fr TEXT NOT NULL,
      image TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS equipment (
      id SERIAL PRIMARY KEY,
      name_ar VARCHAR(180) NOT NULL,
      name_fr VARCHAR(180) NOT NULL,
      description_ar TEXT NOT NULL,
      description_fr TEXT NOT NULL,
      specs_ar TEXT,
      specs_fr TEXT,
      image TEXT NOT NULL,
      category VARCHAR(24) NOT NULL DEFAULT 'rental'
        CHECK (category IN ('rental', 'sales')),
      availability VARCHAR(24) NOT NULL DEFAULT 'available'
        CHECK (availability IN ('available', 'limited', 'unavailable')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title_ar VARCHAR(180) NOT NULL,
      title_fr VARCHAR(180) NOT NULL,
      description_ar TEXT NOT NULL,
      description_fr TEXT NOT NULL,
      category_ar VARCHAR(100),
      category_fr VARCHAR(100),
      image TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  schemaInitialized = true;
}

export async function pingDatabase(): Promise<{ configured: boolean; connected: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { configured: false, connected: false };
  }
  try {
    const sql = getSql();
    await sql`SELECT 1 AS ok`;
    return { configured: true, connected: true };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    };
  }
}
