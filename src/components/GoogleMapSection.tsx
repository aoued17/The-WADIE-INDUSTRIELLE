import { ExternalLink, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { COMPANY_INFO } from '../i18n/translations';

export function GoogleMapSection() {
  const { lang, t } = useLanguage();
  const address = lang === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressFr;

  return (
    <section className="border border-[#AEB5BD]/30 bg-[#FFFFFF] rounded-lg overflow-hidden">
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#AEB5BD]/25 bg-[#F7F8FA]">
        <div>
          <h3 className="font-display text-xl font-bold text-[#20252B] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F28C28] shrink-0" />
            <span>{t.contactPage.mapTitle}</span>
          </h3>
          <p className="text-sm text-[#4A525D] mt-1">{address}</p>
        </div>
        <a
          href={COMPANY_INFO.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#20252B] hover:bg-[#2F3640] text-[#FFFFFF] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28]"
        >
          <span>{t.contactPage.openDirections}</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>
      </div>
      <div className="w-full h-[340px] sm:h-[400px] bg-[#E8EAED]">
        <iframe
          title={t.contactPage.mapTitle}
          src={COMPANY_INFO.mapsEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
