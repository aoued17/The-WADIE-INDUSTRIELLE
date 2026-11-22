import { Calendar, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink, COMPANY_INFO } from '../i18n/translations';
import type { RoutePath } from '../types';
import { GoogleMapSection } from '../components/GoogleMapSection';

export function ContactPage({ onNavigate }: { onNavigate: (path: RoutePath) => void }) {
  const { lang, t } = useLanguage();
  const address = lang === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressFr;

  return (
    <div className="bg-[#F6F7F9] min-h-screen">
      <section className="bg-[#20252B] text-[#FFFFFF] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
            {t.contactPage.title}
          </h1>
          <p className="text-base sm:text-lg text-[#AEB5BD] max-w-3xl">
            {t.contactPage.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-3">
              <Phone className="w-5 h-5 text-[#F28C28]" />
              <h2 className="font-display text-base font-bold text-[#20252B]">
                {t.contactPage.phoneTitle}
              </h2>
              <a
                href={COMPANY_INFO.phoneHref}
                className="block text-base font-semibold text-[#20252B] hover:text-[#F28C28] font-mono-tabular"
                dir="ltr"
              >
                {COMPANY_INFO.phoneDisplay}
              </a>
            </div>

            <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-3">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <h2 className="font-display text-base font-bold text-[#20252B]">
                {t.contactPage.whatsappTitle}
              </h2>
              <p className="text-sm text-[#4A525D] font-mono-tabular" dir="ltr">
                {COMPANY_INFO.whatsappNumber}
              </p>
              <a
                href={buildWhatsAppLink(t.whatsapp.contactMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:underline"
              >
                <span>{t.contactPage.whatsappAction}</span>
              </a>
            </div>

            <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-3">
              <MapPin className="w-5 h-5 text-[#F28C28]" />
              <h2 className="font-display text-base font-bold text-[#20252B]">
                {t.contactPage.addressTitle}
              </h2>
              <p className="text-sm text-[#4A525D] leading-relaxed">{address}</p>
            </div>

            <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-3">
              <Clock className="w-5 h-5 text-[#F28C28]" />
              <h2 className="font-display text-base font-bold text-[#20252B]">
                {t.contactPage.hoursTitle}
              </h2>
              <p className="text-sm text-[#4A525D] leading-relaxed">
                {t.contactPage.hoursValue}
              </p>
            </div>
          </div>

          <div className="bg-[#20252B] text-[#FFFFFF] rounded-lg p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-bold text-[#FFFFFF]">
                {t.contactPage.appointmentTitle}
              </h2>
              <p className="text-sm text-[#AEB5BD]">{t.contactPage.appointmentDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/booking')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.contactPage.appointmentBtn}</span>
            </button>
          </div>

          <GoogleMapSection />
        </div>
      </section>
    </div>
  );
}
