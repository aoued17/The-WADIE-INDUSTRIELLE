import crypto from 'node:crypto';
import {
  buildClearSessionCookie,
  buildSessionCookie,
  getConfiguredAdminEmail,
  isAdminAuthConfigured,
  parseCookies,
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifyAdminCredentials,
  verifyCsrfOrigin,
  verifySessionToken,
} from './auth.js';
import {
  DEFAULT_EQUIPMENT,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
} from './defaultCatalog.js';
import {
  DatabaseNotConfiguredError,
  ensureSchemaAndSeed,
  getSql,
  isDatabaseConfigured,
  pingDatabase,
} from './db.js';
import {
  BOOKING_STATUSES,
  BookingStatus,
  validateBookingInput,
  validateEquipmentInput,
  validateProjectInput,
  validateServiceInput,
} from './validation.js';

export interface HandlerResult {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

export interface RequestContext {
  headers: Record<string, string | string[] | undefined>;
  isHttps: boolean;
  query?: Record<string, string | undefined>;
  body?: unknown;
  paramId?: string;
}

function getAuthenticatedAdmin(headers: Record<string, string | string[] | undefined>) {
  const rawCookie = typeof headers.cookie === 'string' ? headers.cookie : undefined;
  const cookies = parseCookies(rawCookie);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

function generateBookingReference(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WI-${datePart}-${randomPart}`;
}

export async function handleHealth(): Promise<HandlerResult> {
  const db = await pingDatabase();
  return {
    status: 200,
    body: {
      ok: true,
      database: db,
      adminConfigured: isAdminAuthConfigured(),
    },
  };
}

export async function handlePublicCatalog(): Promise<HandlerResult> {
  if (!isDatabaseConfigured()) {
    return {
      status: 200,
      body: {
        source: 'static_preview',
        dbConnected: false,
        services: DEFAULT_SERVICES,
        equipment: DEFAULT_EQUIPMENT,
        projects: DEFAULT_PROJECTS,
      },
    };
  }

  try {
    await ensureSchemaAndSeed();
    const sql = getSql();
    const [services, equipment, projects] = await Promise.all([
      sql`SELECT id, name_ar, name_fr, description_ar, description_fr, image, created_at FROM services ORDER BY id ASC`,
      sql`SELECT id, name_ar, name_fr, description_ar, description_fr, specs_ar, specs_fr, image, category, availability, created_at FROM equipment ORDER BY id ASC`,
      sql`SELECT id, title_ar, title_fr, description_ar, description_fr, category_ar, category_fr, image, created_at FROM projects ORDER BY id ASC`,
    ]);

    return {
      status: 200,
      body: {
        source: 'database',
        dbConnected: true,
        services: services.length > 0 ? services : DEFAULT_SERVICES,
        equipment: equipment.length > 0 ? equipment : DEFAULT_EQUIPMENT,
        projects: projects.length > 0 ? projects : DEFAULT_PROJECTS,
        seededInDb: services.length > 0 || equipment.length > 0 || projects.length > 0,
      },
    };
  } catch (err) {
    console.error('Catalog DB read failed:', err);
    return {
      status: 200,
      body: {
        source: 'static_fallback',
        dbConnected: false,
        services: DEFAULT_SERVICES,
        equipment: DEFAULT_EQUIPMENT,
        projects: DEFAULT_PROJECTS,
      },
    };
  }
}

export async function handleCreateBooking(ctx: RequestContext): Promise<HandlerResult> {
  if (!isDatabaseConfigured()) {
    return {
      status: 503,
      body: {
        ok: false,
        error: 'DATABASE_NOT_CONFIGURED',
        message: 'Neon PostgreSQL DATABASE_URL is not configured on the server.',
      },
    };
  }

  const rawBody =
    ctx.body && typeof ctx.body === 'object' ? (ctx.body as Record<string, unknown>) : {};
  const validated = validateBookingInput(rawBody);
  if (!validated.ok) {
    return {
      status: 400,
      body: { ok: false, error: validated.error },
    };
  }

  try {
    await ensureSchemaAndSeed();
    const sql = getSql();
    const bookingReference = generateBookingReference();
    const d = validated.data;

    const rows = await sql`
      INSERT INTO bookings (
        booking_reference,
        customer_name,
        phone,
        email,
        service,
        equipment,
        appointment_date,
        appointment_time,
        project_location,
        message,
        status
      ) VALUES (
        ${bookingReference},
        ${d.customer_name},
        ${d.phone},
        ${d.email ?? null},
        ${d.service},
        ${d.equipment ?? null},
        ${d.appointment_date},
        ${d.appointment_time},
        ${d.project_location},
        ${d.message ?? null},
        'pending'
      )
      RETURNING id, booking_reference, customer_name, service, appointment_date, appointment_time, project_location, status, created_at
    `;

    return {
      status: 201,
      body: {
        ok: true,
        booking: rows[0],
      },
    };
  } catch (err) {
    console.error('Booking insert error:', err);
    return {
      status: err instanceof DatabaseNotConfiguredError ? 503 : 500,
      body: { ok: false, error: 'BOOKING_SAVE_FAILED' },
    };
  }
}

export async function handleAdminLogin(ctx: RequestContext): Promise<HandlerResult> {
  if (!verifyCsrfOrigin(ctx.headers)) {
    return { status: 403, body: { ok: false, error: 'CSRF_CHECK_FAILED' } };
  }

  const rawBody =
    ctx.body && typeof ctx.body === 'object' ? (ctx.body as Record<string, unknown>) : {};
  const email = typeof rawBody.email === 'string' ? rawBody.email : '';
  const password = typeof rawBody.password === 'string' ? rawBody.password : '';

  if (!email || !password) {
    return { status: 400, body: { ok: false, error: 'MISSING_CREDENTIALS' } };
  }

  const check = verifyAdminCredentials(email, password);
  if (check.notConfigured) {
    return {
      status: 503,
      body: {
        ok: false,
        error: 'ADMIN_NOT_CONFIGURED',
        message: 'ADMIN_PASSWORD environment variable is not configured.',
      },
    };
  }

  if (!check.valid) {
    return { status: 401, body: { ok: false, error: 'INVALID_CREDENTIALS' } };
  }

  const canonicalEmail = getConfiguredAdminEmail();
  const token = signSessionToken(canonicalEmail);
  return {
    status: 200,
    headers: {
      'Set-Cookie': buildSessionCookie(token, ctx.isHttps),
    },
    body: {
      ok: true,
      admin: { role: 'Administrateur' },
    },
  };
}

export async function handleAdminLogout(ctx: RequestContext): Promise<HandlerResult> {
  if (!verifyCsrfOrigin(ctx.headers)) {
    return { status: 403, body: { ok: false, error: 'CSRF_CHECK_FAILED' } };
  }
  return {
    status: 200,
    headers: {
      'Set-Cookie': buildClearSessionCookie(ctx.isHttps),
    },
    body: { ok: true },
  };
}

export async function handleGetAdminSession(ctx: RequestContext): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  const db = await pingDatabase();
  return {
    status: 200,
    body: {
      authenticated: Boolean(session),
      admin: session ? { role: 'Administrateur' } : null,
      adminConfigured: isAdminAuthConfigured(),
      database: db,
    },
  };
}

export async function handleGetAdminBookings(ctx: RequestContext): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  if (!session) {
    return { status: 401, body: { error: 'UNAUTHORIZED' } };
  }
  if (!isDatabaseConfigured()) {
    return { status: 503, body: { error: 'DATABASE_NOT_CONFIGURED', bookings: [] } };
  }

  try {
    await ensureSchemaAndSeed();
    const sql = getSql();
    const statusFilter = ctx.query?.status?.trim();
    const dateFilter = ctx.query?.date?.trim();
    const searchFilter = ctx.query?.q?.trim();

    const rows = await sql`
      SELECT
        id,
        booking_reference,
        customer_name,
        phone,
        email,
        service,
        equipment,
        TO_CHAR(appointment_date, 'YYYY-MM-DD') AS appointment_date,
        appointment_time,
        project_location,
        message,
        status,
        created_at
      FROM bookings
      WHERE (${statusFilter && statusFilter !== 'all' ? statusFilter : null}::text IS NULL OR status = ${statusFilter || ''})
        AND (${dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter) ? dateFilter : null}::date IS NULL OR appointment_date = ${dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter) ? dateFilter : '1970-01-01'}::date)
        AND (
          ${searchFilter ? `%${searchFilter}%` : null}::text IS NULL
          OR customer_name ILIKE ${`%${searchFilter || ''}%`}
          OR phone ILIKE ${`%${searchFilter || ''}%`}
          OR booking_reference ILIKE ${`%${searchFilter || ''}%`}
        )
      ORDER BY created_at DESC
    `;

    return { status: 200, body: { bookings: rows } };
  } catch (err) {
    console.error('Admin bookings read error:', err);
    return { status: 500, body: { error: 'DATABASE_QUERY_FAILED' } };
  }
}

export async function handleUpdateBookingStatus(ctx: RequestContext): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  if (!session) {
    return { status: 401, body: { error: 'UNAUTHORIZED' } };
  }
  if (!verifyCsrfOrigin(ctx.headers)) {
    return { status: 403, body: { error: 'CSRF_CHECK_FAILED' } };
  }
  if (!isDatabaseConfigured()) {
    return { status: 503, body: { error: 'DATABASE_NOT_CONFIGURED' } };
  }

  const idNum = Number(ctx.paramId);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return { status: 400, body: { error: 'INVALID_BOOKING_ID' } };
  }

  const rawBody =
    ctx.body && typeof ctx.body === 'object' ? (ctx.body as Record<string, unknown>) : {};
  const nextStatus = typeof rawBody.status === 'string' ? rawBody.status.trim() : '';
  if (!BOOKING_STATUSES.includes(nextStatus as BookingStatus)) {
    return { status: 400, body: { error: 'INVALID_STATUS' } };
  }

  try {
    await ensureSchemaAndSeed();
    const sql = getSql();
    const updated = await sql`
      UPDATE bookings
      SET status = ${nextStatus}
      WHERE id = ${idNum}
      RETURNING
        id,
        booking_reference,
        customer_name,
        phone,
        email,
        service,
        equipment,
        TO_CHAR(appointment_date, 'YYYY-MM-DD') AS appointment_date,
        appointment_time,
        project_location,
        message,
        status,
        created_at
    `;

    if (updated.length === 0) {
      return { status: 404, body: { error: 'BOOKING_NOT_FOUND' } };
    }
    return { status: 200, body: { ok: true, booking: updated[0] } };
  } catch (err) {
    console.error('Booking update error:', err);
    return { status: 500, body: { error: 'BOOKING_UPDATE_FAILED' } };
  }
}

export async function handleSeedCatalogInDb(ctx: RequestContext): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  if (!session) return { status: 401, body: { error: 'UNAUTHORIZED' } };
  if (!verifyCsrfOrigin(ctx.headers)) return { status: 403, body: { error: 'CSRF_CHECK_FAILED' } };
  if (!isDatabaseConfigured()) return { status: 503, body: { error: 'DATABASE_NOT_CONFIGURED' } };

  try {
    await ensureSchemaAndSeed();
    const sql = getSql();

    const [{ count: sCount }] = await sql`SELECT COUNT(*)::int AS count FROM services`;
    if (Number(sCount) === 0) {
      for (const s of DEFAULT_SERVICES) {
        await sql`
          INSERT INTO services (name_ar, name_fr, description_ar, description_fr, image)
          VALUES (${s.name_ar}, ${s.name_fr}, ${s.description_ar}, ${s.description_fr}, ${s.image})
        `;
      }
    }

    const [{ count: eCount }] = await sql`SELECT COUNT(*)::int AS count FROM equipment`;
    if (Number(eCount) === 0) {
      for (const e of DEFAULT_EQUIPMENT) {
        await sql`
          INSERT INTO equipment (name_ar, name_fr, description_ar, description_fr, specs_ar, specs_fr, image, category, availability)
          VALUES (${e.name_ar}, ${e.name_fr}, ${e.description_ar}, ${e.description_fr}, ${e.specs_ar}, ${e.specs_fr}, ${e.image}, ${e.category}, ${e.availability})
        `;
      }
    }

    const [{ count: pCount }] = await sql`SELECT COUNT(*)::int AS count FROM projects`;
    if (Number(pCount) === 0) {
      for (const p of DEFAULT_PROJECTS) {
        await sql`
          INSERT INTO projects (title_ar, title_fr, description_ar, description_fr, category_ar, category_fr, image)
          VALUES (${p.title_ar}, ${p.title_fr}, ${p.description_ar}, ${p.description_fr}, ${p.category_ar}, ${p.category_fr}, ${p.image})
        `;
      }
    }

    return { status: 200, body: { ok: true } };
  } catch (err) {
    console.error('Seed catalog error:', err);
    return { status: 500, body: { error: 'SEED_FAILED' } };
  }
}

export async function handleAdminServices(
  method: string,
  ctx: RequestContext
): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  if (!session) return { status: 401, body: { error: 'UNAUTHORIZED' } };
  if (method !== 'GET' && !verifyCsrfOrigin(ctx.headers)) {
    return { status: 403, body: { error: 'CSRF_CHECK_FAILED' } };
  }
  if (!isDatabaseConfigured()) {
    return { status: 503, body: { error: 'DATABASE_NOT_CONFIGURED' } };
  }

  await ensureSchemaAndSeed();
  const sql = getSql();

  if (method === 'GET') {
    const rows = await sql`SELECT * FROM services ORDER BY id ASC`;
    return { status: 200, body: { services: rows } };
  }

  const rawBody =
    ctx.body && typeof ctx.body === 'object' ? (ctx.body as Record<string, unknown>) : {};

  if (method === 'POST') {
    const valid = validateServiceInput(rawBody);
    if (!valid.ok) return { status: 400, body: { error: valid.error } };
    const d = valid.data;
    const rows = await sql`
      INSERT INTO services (name_ar, name_fr, description_ar, description_fr, image)
      VALUES (${d.name_ar}, ${d.name_fr}, ${d.description_ar}, ${d.description_fr}, ${d.image})
      RETURNING *
    `;
    return { status: 201, body: { ok: true, service: rows[0] } };
  }

  if (method === 'PATCH') {
    const id = Number(rawBody.id);
    if (!Number.isInteger(id) || id <= 0) return { status: 400, body: { error: 'INVALID_ID' } };
    const valid = validateServiceInput(rawBody);
    if (!valid.ok) return { status: 400, body: { error: valid.error } };
    const d = valid.data;
    const rows = await sql`
      UPDATE services
      SET name_ar = ${d.name_ar}, name_fr = ${d.name_fr}, description_ar = ${d.description_ar}, description_fr = ${d.description_fr}, image = ${d.image}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return { status: 404, body: { error: 'NOT_FOUND' } };
    return { status: 200, body: { ok: true, service: rows[0] } };
  }

  if (method === 'DELETE') {
    const id = Number(ctx.query?.id ?? rawBody.id);
    if (!Number.isInteger(id) || id <= 0) return { status: 400, body: { error: 'INVALID_ID' } };
    await sql`DELETE FROM services WHERE id = ${id}`;
    return { status: 200, body: { ok: true } };
  }

  return { status: 405, body: { error: 'METHOD_NOT_ALLOWED' } };
}

export async function handleAdminEquipment(
  method: string,
  ctx: RequestContext
): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  if (!session) return { status: 401, body: { error: 'UNAUTHORIZED' } };
  if (method !== 'GET' && !verifyCsrfOrigin(ctx.headers)) {
    return { status: 403, body: { error: 'CSRF_CHECK_FAILED' } };
  }
  if (!isDatabaseConfigured()) {
    return { status: 503, body: { error: 'DATABASE_NOT_CONFIGURED' } };
  }

  await ensureSchemaAndSeed();
  const sql = getSql();

  if (method === 'GET') {
    const rows = await sql`SELECT * FROM equipment ORDER BY id ASC`;
    return { status: 200, body: { equipment: rows } };
  }

  const rawBody =
    ctx.body && typeof ctx.body === 'object' ? (ctx.body as Record<string, unknown>) : {};

  if (method === 'POST') {
    const valid = validateEquipmentInput(rawBody);
    if (!valid.ok) return { status: 400, body: { error: valid.error } };
    const d = valid.data;
    const rows = await sql`
      INSERT INTO equipment (name_ar, name_fr, description_ar, description_fr, specs_ar, specs_fr, image, category, availability)
      VALUES (${d.name_ar}, ${d.name_fr}, ${d.description_ar}, ${d.description_fr}, ${d.specs_ar || null}, ${d.specs_fr || null}, ${d.image}, ${d.category}, ${d.availability})
      RETURNING *
    `;
    return { status: 201, body: { ok: true, item: rows[0] } };
  }

  if (method === 'PATCH') {
    const id = Number(rawBody.id);
    if (!Number.isInteger(id) || id <= 0) return { status: 400, body: { error: 'INVALID_ID' } };

    // Support quick availability toggle or full update
    if (Object.keys(rawBody).length === 2 && typeof rawBody.availability === 'string') {
      const avail = rawBody.availability.trim();
      if (!['available', 'limited', 'unavailable'].includes(avail)) {
        return { status: 400, body: { error: 'INVALID_AVAILABILITY' } };
      }
      const rows = await sql`
        UPDATE equipment SET availability = ${avail} WHERE id = ${id} RETURNING *
      `;
      if (rows.length === 0) return { status: 404, body: { error: 'NOT_FOUND' } };
      return { status: 200, body: { ok: true, item: rows[0] } };
    }

    const valid = validateEquipmentInput(rawBody);
    if (!valid.ok) return { status: 400, body: { error: valid.error } };
    const d = valid.data;
    const rows = await sql`
      UPDATE equipment
      SET name_ar = ${d.name_ar}, name_fr = ${d.name_fr}, description_ar = ${d.description_ar}, description_fr = ${d.description_fr},
          specs_ar = ${d.specs_ar || null}, specs_fr = ${d.specs_fr || null}, image = ${d.image}, category = ${d.category}, availability = ${d.availability}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return { status: 404, body: { error: 'NOT_FOUND' } };
    return { status: 200, body: { ok: true, item: rows[0] } };
  }

  if (method === 'DELETE') {
    const id = Number(ctx.query?.id ?? rawBody.id);
    if (!Number.isInteger(id) || id <= 0) return { status: 400, body: { error: 'INVALID_ID' } };
    await sql`DELETE FROM equipment WHERE id = ${id}`;
    return { status: 200, body: { ok: true } };
  }

  return { status: 405, body: { error: 'METHOD_NOT_ALLOWED' } };
}

export async function handleAdminProjects(
  method: string,
  ctx: RequestContext
): Promise<HandlerResult> {
  const session = getAuthenticatedAdmin(ctx.headers);
  if (!session) return { status: 401, body: { error: 'UNAUTHORIZED' } };
  if (method !== 'GET' && !verifyCsrfOrigin(ctx.headers)) {
    return { status: 403, body: { error: 'CSRF_CHECK_FAILED' } };
  }
  if (!isDatabaseConfigured()) {
    return { status: 503, body: { error: 'DATABASE_NOT_CONFIGURED' } };
  }

  await ensureSchemaAndSeed();
  const sql = getSql();

  if (method === 'GET') {
    const rows = await sql`SELECT * FROM projects ORDER BY id ASC`;
    return { status: 200, body: { projects: rows } };
  }

  const rawBody =
    ctx.body && typeof ctx.body === 'object' ? (ctx.body as Record<string, unknown>) : {};

  if (method === 'POST') {
    const valid = validateProjectInput(rawBody);
    if (!valid.ok) return { status: 400, body: { error: valid.error } };
    const d = valid.data;
    const rows = await sql`
      INSERT INTO projects (title_ar, title_fr, description_ar, description_fr, category_ar, category_fr, image)
      VALUES (${d.title_ar}, ${d.title_fr}, ${d.description_ar}, ${d.description_fr}, ${d.category_ar || null}, ${d.category_fr || null}, ${d.image})
      RETURNING *
    `;
    return { status: 201, body: { ok: true, project: rows[0] } };
  }

  if (method === 'PATCH') {
    const id = Number(rawBody.id);
    if (!Number.isInteger(id) || id <= 0) return { status: 400, body: { error: 'INVALID_ID' } };
    const valid = validateProjectInput(rawBody);
    if (!valid.ok) return { status: 400, body: { error: valid.error } };
    const d = valid.data;
    const rows = await sql`
      UPDATE projects
      SET title_ar = ${d.title_ar}, title_fr = ${d.title_fr}, description_ar = ${d.description_ar}, description_fr = ${d.description_fr},
          category_ar = ${d.category_ar || null}, category_fr = ${d.category_fr || null}, image = ${d.image}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return { status: 404, body: { error: 'NOT_FOUND' } };
    return { status: 200, body: { ok: true, project: rows[0] } };
  }

  if (method === 'DELETE') {
    const id = Number(ctx.query?.id ?? rawBody.id);
    if (!Number.isInteger(id) || id <= 0) return { status: 400, body: { error: 'INVALID_ID' } };
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return { status: 200, body: { ok: true } };
  }

  return { status: 405, body: { error: 'METHOD_NOT_ALLOWED' } };
}
