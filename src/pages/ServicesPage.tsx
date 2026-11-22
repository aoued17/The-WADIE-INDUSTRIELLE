import { Calendar } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { ServiceItem } from '../types';
import { SafeImage } from '../components/SafeImage';

interface ServicesPageProps {
  services: ServiceItem[];
  onRequestService: (serviceName: string) => void;
}

export function ServicesPage({ services, onRequestService }: ServicesPageProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-[#F6F7F9] min-h-screen">
      <section className="bg-[#20252B] text-[#FFFFFF] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
            {t.servicesPage.title}
          </h1>
          <p className="text-base sm:text-lg text-[#AEB5BD] max-w-3xl">
            {t.servicesPage.subtitle}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv, idx) => {
              const name = lang === 'ar' ? srv.name_ar : srv.name_fr;
              const desc = lang === 'ar' ? srv.description_ar : srv.description_fr;

              return (
                <article
                  key={srv.id}
                  className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#20252B] overflow-hidden">
                    <SafeImage
                      src={srv.image}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <div className="font-mono-tabular text-xs font-semibold text-[#F28C28]">
                        {String(idx + 1).padStart(2, '0')}.
                      </div>
                      <h2 className="font-display text-xl font-bold text-[#20252B] leading-snug">
                        {name}
                      </h2>
                      <p className="text-sm text-[#4A525D] leading-relaxed">{desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRequestService(name)}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-[#20252B] hover:bg-[#F28C28] text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t.servicesPage.requestService}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
