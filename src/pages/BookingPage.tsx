import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink } from '../i18n/translations';
import type { EquipmentItem, ServiceItem } from '../types';

interface BookingPageProps {
  services: ServiceItem[];
  equipment: EquipmentItem[];
  initialService?: string;
  initialEquipment?: string;
}

interface CreatedBooking {
  booking_reference: string;
  customer_name: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  project_location: string;
}

const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:30',
  '14:30',
  '15:30',
  '16:30',
];

export function BookingPage({
  services,
  equipment,
  initialService = '',
  initialEquipment = '',
}: BookingPageProps) {
  const { lang, t } = useLanguage();
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(initialService);
  const [selectedEquipment, setSelectedEquipment] = useState(initialEquipment);
  const [appointmentDate, setAppointmentDate] = useState(todayIso);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [projectLocation, setProjectLocation] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<CreatedBooking | null>(null);

  const mapErrorCode = (code: string | undefined): string => {
    const errs = t.bookingPage.validationErrors;
    if (code === 'DATABASE_NOT_CONFIGURED') {
      return t.bookingPage.dbNotConfiguredError;
    }
    if (code && code in errs) {
      return errs[code as keyof typeof errs];
    }
    return errs.GENERIC;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (customerName.trim().length < 2) {
      setErrorMsg(t.bookingPage.validationErrors.INVALID_NAME);
      return;
    }
    if (phone.replace(/[^\d+]/g, '').length < 8) {
      setErrorMsg(t.bookingPage.validationErrors.INVALID_PHONE);
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(t.bookingPage.validationErrors.INVALID_EMAIL);
      return;
    }
    if (!service.trim()) {
      setErrorMsg(t.bookingPage.validationErrors.INVALID_SERVICE);
      return;
    }
    if (!appointmentDate || appointmentDate < todayIso) {
      setErrorMsg(t.bookingPage.validationErrors.PAST_DATE_NOT_ALLOWED);
      return;
    }
    if (!appointmentTime) {
      setErrorMsg(t.bookingPage.validationErrors.INVALID_TIME);
      return;
    }
    if (projectLocation.trim().length < 2) {
      setErrorMsg(t.bookingPage.validationErrors.INVALID_LOCATION);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          service: service.trim(),
          equipment: selectedEquipment.trim() || undefined,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          project_location: projectLocation.trim(),
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(mapErrorCode(data.error));
        return;
      }

      setConfirmedBooking(data.booking);
    } catch {
      setErrorMsg(t.bookingPage.validationErrors.GENERIC);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setService('');
    setSelectedEquipment('');
    setAppointmentDate(todayIso);
    setAppointmentTime('09:00');
    setProjectLocation('');
    setMessage('');
    setErrorMsg(null);
  };

  const whatsappSummary = confirmedBooking
    ? lang === 'ar'
      ? `السلام عليكم WADIE INDUSTRIELLE، قمت بحجز موعد بالمرجع ${confirmedBooking.booking_reference} لخدمة (${confirmedBooking.service}) بتاريخ ${confirmedBooking.appointment_date} على الساعة ${confirmedBooking.appointment_time}.`
      : `Bonjour WADIE INDUSTRIELLE, j'ai soumis la demande de rendez-vous ${confirmedBooking.booking_reference} pour (${confirmedBooking.service}) le ${confirmedBooking.appointment_date} à ${confirmedBooking.appointment_time}.`
    : '';

  return (
    <div className="bg-[#F6F7F9] min-h-screen">
      <section className="bg-[#20252B] text-[#FFFFFF] py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
            {t.bookingPage.title}
          </h1>
          <p className="text-base text-[#AEB5BD]">{t.bookingPage.subtitle}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {confirmedBooking ? (
            <div className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 p-8 sm:p-10 space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-bold text-[#20252B]">
                    {t.bookingPage.successTitle}
                  </h2>
                  <p className="text-sm text-[#4A525D]">{t.bookingPage.successSubtitle}</p>
                </div>
              </div>

              <div className="p-5 rounded-md bg-[#F6F7F9] border border-[#AEB5BD]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm font-medium text-[#4A525D]">
                  {t.bookingPage.referenceLabel}
                </span>
                <span
                  className="font-mono-tabular text-lg font-bold text-[#F28C28]"
                  dir="ltr"
                >
                  {confirmedBooking.booking_reference}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[#AEB5BD]/20 pt-5">
                <div>
                  <dt className="text-[#5E6773]">{t.bookingPage.fullName}</dt>
                  <dd className="font-semibold text-[#20252B] mt-0.5">
                    {confirmedBooking.customer_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#5E6773]">{t.bookingPage.service}</dt>
                  <dd className="font-semibold text-[#20252B] mt-0.5">
                    {confirmedBooking.service}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#5E6773]">{t.bookingPage.date}</dt>
                  <dd className="font-semibold text-[#20252B] font-mono-tabular mt-0.5" dir="ltr">
                    {confirmedBooking.appointment_date} · {confirmedBooking.appointment_time}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#5E6773]">{t.bookingPage.location}</dt>
                  <dd className="font-semibold text-[#20252B] mt-0.5">
                    {confirmedBooking.project_location}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#AEB5BD]/20">
                <a
                  href={buildWhatsAppLink(whatsappSummary)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#25D366] hover:bg-[#1EB958] text-[#FFFFFF] text-sm font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.bookingPage.continueWhatsapp}</span>
                </a>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-md border border-[#AEB5BD]/40 hover:border-[#20252B] text-[#20252B] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.bookingPage.newBooking}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 p-6 sm:p-10 space-y-6"
            >
              {errorMsg && (
                <div
                  role="alert"
                  className="p-4 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p>{errorMsg}</p>
                    <a
                      href={buildWhatsAppLink(t.whatsapp.bookingMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t.bookingPage.continueWhatsapp}</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="bk-name" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.fullName} *
                  </label>
                  <input
                    id="bk-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.bookingPage.fullNamePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-phone" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.phone} *
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    dir="ltr"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.bookingPage.phonePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm font-mono-tabular focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-email" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.email}
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.bookingPage.emailPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-location" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.location} *
                  </label>
                  <input
                    id="bk-location"
                    type="text"
                    required
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder={t.bookingPage.locationPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-service" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.service} *
                  </label>
                  <select
                    id="bk-service"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm bg-[#FFFFFF] focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  >
                    <option value="">{t.bookingPage.selectService}</option>
                    {services.map((srv) => {
                      const label = lang === 'ar' ? srv.name_ar : srv.name_fr;
                      return (
                        <option key={srv.id} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-equipment" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.equipment}
                  </label>
                  <select
                    id="bk-equipment"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm bg-[#FFFFFF] focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  >
                    <option value="">{t.bookingPage.selectEquipment}</option>
                    {equipment.map((eq) => {
                      const label = lang === 'ar' ? eq.name_ar : eq.name_fr;
                      return (
                        <option key={eq.id} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-date" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.date} *
                  </label>
                  <input
                    id="bk-date"
                    type="date"
                    dir="ltr"
                    required
                    min={todayIso}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm font-mono-tabular focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bk-time" className="block text-sm font-semibold text-[#20252B]">
                    {t.bookingPage.time} *
                  </label>
                  <select
                    id="bk-time"
                    dir="ltr"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm font-mono-tabular bg-[#FFFFFF] focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  >
                    <option value="">{t.bookingPage.selectTime}</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bk-msg" className="block text-sm font-semibold text-[#20252B]">
                  {t.bookingPage.message}
                </label>
                <textarea
                  id="bk-msg"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.bookingPage.messagePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#AEB5BD]/50 text-[#20252B] text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] disabled:opacity-60 text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {submitting ? t.bookingPage.submitting : t.bookingPage.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
