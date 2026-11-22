export interface BookingInput {
  customer_name: string;
  phone: string;
  email?: string;
  service: string;
  equipment?: string;
  appointment_date: string;
  appointment_time: string;
  project_location: string;
  message?: string;
}

export const BOOKING_STATUSES = ['pending', 'confirmed', 'rejected', 'completed'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const EQUIPMENT_CATEGORIES = ['rental', 'sales'] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export const AVAILABILITY_STATUSES = ['available', 'limited', 'unavailable'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

function cleanStr(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

export function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateBookingInput(raw: Record<string, unknown>): {
  ok: true;
  data: BookingInput;
} | {
  ok: false;
  error: string;
} {
  const customer_name = cleanStr(raw.customer_name, 160);
  const phone = cleanStr(raw.phone, 40);
  const email = cleanStr(raw.email, 160);
  const service = cleanStr(raw.service, 160);
  const equipment = cleanStr(raw.equipment, 160);
  const appointment_date = cleanStr(raw.appointment_date, 16);
  const appointment_time = cleanStr(raw.appointment_time, 20);
  const project_location = cleanStr(raw.project_location, 240);
  const message = cleanStr(raw.message, 2000);

  if (customer_name.length < 2) {
    return { ok: false, error: 'INVALID_NAME' };
  }

  const digitsOnly = phone.replace(/[^\d+]/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 20) {
    return { ok: false, error: 'INVALID_PHONE' };
  }

  if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'INVALID_EMAIL' };
  }

  if (service.length < 2) {
    return { ok: false, error: 'INVALID_SERVICE' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
    return { ok: false, error: 'INVALID_DATE' };
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  if (appointment_date < todayIso) {
    return { ok: false, error: 'PAST_DATE_NOT_ALLOWED' };
  }

  if (!appointment_time || !/^\d{2}:\d{2}$/.test(appointment_time)) {
    return { ok: false, error: 'INVALID_TIME' };
  }

  if (project_location.length < 2) {
    return { ok: false, error: 'INVALID_LOCATION' };
  }

  return {
    ok: true,
    data: {
      customer_name,
      phone,
      email: email || undefined,
      service,
      equipment: equipment || undefined,
      appointment_date,
      appointment_time,
      project_location,
      message: message || undefined,
    },
  };
}

export function validateServiceInput(raw: Record<string, unknown>) {
  const name_ar = cleanStr(raw.name_ar, 180);
  const name_fr = cleanStr(raw.name_fr, 180);
  const description_ar = cleanStr(raw.description_ar, 2000);
  const description_fr = cleanStr(raw.description_fr, 2000);
  const image = cleanStr(raw.image, 500);

  if (!name_ar || !name_fr || !description_ar || !description_fr || !isValidImageUrl(image)) {
    return { ok: false as const, error: 'INVALID_SERVICE_PAYLOAD' };
  }
  return {
    ok: true as const,
    data: { name_ar, name_fr, description_ar, description_fr, image },
  };
}

export function validateEquipmentInput(raw: Record<string, unknown>) {
  const name_ar = cleanStr(raw.name_ar, 180);
  const name_fr = cleanStr(raw.name_fr, 180);
  const description_ar = cleanStr(raw.description_ar, 2000);
  const description_fr = cleanStr(raw.description_fr, 2000);
  const specs_ar = cleanStr(raw.specs_ar, 1000);
  const specs_fr = cleanStr(raw.specs_fr, 1000);
  const image = cleanStr(raw.image, 500);
  const category = cleanStr(raw.category, 24) as EquipmentCategory;
  const availability = cleanStr(raw.availability, 24) as AvailabilityStatus;

  if (
    !name_ar ||
    !name_fr ||
    !description_ar ||
    !description_fr ||
    !isValidImageUrl(image) ||
    !EQUIPMENT_CATEGORIES.includes(category) ||
    !AVAILABILITY_STATUSES.includes(availability)
  ) {
    return { ok: false as const, error: 'INVALID_EQUIPMENT_PAYLOAD' };
  }

  return {
    ok: true as const,
    data: { name_ar, name_fr, description_ar, description_fr, specs_ar, specs_fr, image, category, availability },
  };
}

export function validateProjectInput(raw: Record<string, unknown>) {
  const title_ar = cleanStr(raw.title_ar, 180);
  const title_fr = cleanStr(raw.title_fr, 180);
  const description_ar = cleanStr(raw.description_ar, 2000);
  const description_fr = cleanStr(raw.description_fr, 2000);
  const category_ar = cleanStr(raw.category_ar, 100);
  const category_fr = cleanStr(raw.category_fr, 100);
  const image = cleanStr(raw.image, 500);

  if (!title_ar || !title_fr || !description_ar || !description_fr || !isValidImageUrl(image)) {
    return { ok: false as const, error: 'INVALID_PROJECT_PAYLOAD' };
  }
  return {
    ok: true as const,
    data: { title_ar, title_fr, description_ar, description_fr, category_ar, category_fr, image },
  };
}
