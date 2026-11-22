import { Calendar, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../i18n/translations';
import type { RoutePath } from '../types';
import { SafeImage } from '../components/SafeImage';

export function AboutPage({ onNavigate }: { onNavigate: (path: RoutePath) => void }) {
  const { lang, t } = useLanguage();
  const address = lang === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressFr;

  return (
    <div className="bg-[#FFFFFF]">
      <section className="bg-[#20252B] text-[#FFFFFF] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
            {t.about.title}
          </h1>
          <p className="text-base sm:text-lg text-[#AEB5BD] max-w-3xl">{t.about.subtitle}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-[#AEB5BD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#20252B]">
              {t.about.overviewTitle}
            </h2>
            <p className="text-base text-[#4A525D] leading-relaxed">{t.about.overviewP1}</p>
            <p className="text-base text-[#4A525D] leading-relaxed">{t.about.overviewP2}</p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#AEB5BD]/25">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#F28C28] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.about.locationLabel}</span>
                </div>
                <p className="text-sm font-medium text-[#20252B]">{address}</p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#F28C28] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.about.phoneLabel}</span>
                </div>
                <a
                  href={COMPANY_INFO.phoneHref}
                  className="text-sm font-medium text-[#20252B] font-mono-tabular hover:text-[#F28C28]"
                  dir="ltr"
                >
                  {COMPANY_INFO.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/booking')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.about.bookVisitBtn}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="w-full h-full min-h-[320px] rounded-lg overflow-hidden border border-[#AEB5BD]/30 bg-[#20252B]">
              <SafeImage
                src="/src/assets/images/project_steel_fabrication_1795358133713.jpg"
                alt={t.about.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#F6F7F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#20252B] mb-8">
            {t.about.pillarsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.about.pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-3"
              >
                <div className="font-mono-tabular text-xs font-semibold text-[#F28C28]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-lg font-bold text-[#20252B]">{pillar.title}</h3>
                <p className="text-sm text-[#4A525D] leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
