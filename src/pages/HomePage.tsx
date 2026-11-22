import { ArrowLeft, ArrowRight, Calendar, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink, COMPANY_INFO } from '../i18n/translations';
import type { EquipmentItem, ProjectItem, RoutePath, ServiceItem } from '../types';
import { GoogleMapSection } from '../components/GoogleMapSection';
import { SafeImage } from '../components/SafeImage';

interface HomePageProps {
  services: ServiceItem[];
  equipment: EquipmentItem[];
  projects: ProjectItem[];
  onNavigate: (path: RoutePath) => void;
  onSelectEquipmentForBooking: (equipmentName: string) => void;
}

export function HomePage({
  services,
  equipment,
  projects,
  onNavigate,
  onSelectEquipmentForBooking,
}: HomePageProps) {
  const { lang, isRtl, t } = useLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const featuredServices = services.slice(0, 6);
  const featuredEquipment = equipment.slice(0, 3);
  const featuredProjects = projects.slice(0, 4);

  const availLabel = (avail: EquipmentItem['availability']) => {
    if (avail === 'available') return t.equipmentPage.availAvailable;
    if (avail === 'limited') return t.equipmentPage.availLimited;
    return t.equipmentPage.availUnavailable;
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative bg-[#20252B] text-[#FFFFFF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#AEB5BD]">
                <MapPin className="w-4 h-4 text-[#F28C28] shrink-0" />
                <span>{t.hero.locationTag}</span>
              </div>

              <h1
                className="font-display font-bold tracking-tight text-[#FFFFFF] leading-[1.15] [text-wrap:balance]"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
              >
                {t.hero.headline}
              </h1>

              <p className="text-base sm:text-lg text-[#AEB5BD] leading-relaxed max-w-2xl">
                {t.hero.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="/booking"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/booking');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{t.hero.primaryCta}</span>
                </a>

                <a
                  href="/equipment"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/equipment');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md border border-[#AEB5BD]/35 hover:border-[#FFFFFF] text-[#FFFFFF] text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{t.hero.secondaryCta}</span>
                  <ArrowIcon className="w-4 h-4 shrink-0" />
                </a>
              </div>

              <div className="pt-4 border-t border-[#AEB5BD]/15 flex flex-wrap items-center gap-6 text-sm text-[#AEB5BD]">
                <a
                  href={COMPANY_INFO.phoneHref}
                  className="inline-flex items-center gap-2 hover:text-[#FFFFFF] transition-colors font-mono-tabular"
                >
                  <Phone className="w-4 h-4 text-[#F28C28]" />
                  <span dir="ltr">{COMPANY_INFO.phoneDisplay}</span>
                </a>
                <a
                  href={buildWhatsAppLink(t.whatsapp.defaultMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#FFFFFF] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>{t.hero.whatsappCta}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:min-h-[420px] rounded-lg overflow-hidden border border-[#AEB5BD]/20 bg-[#181C21]">
                <SafeImage
                  src="/src/assets/images/hero_industrial_facility_1795358134297.jpg"
                  alt="WADIE INDUSTRIELLE"
                  loading="eager"
                  fetchPriority="high"
                  width={1408}
                  height={768}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#20252B]/65 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Company Introduction */}
      <section className="bg-[#FFFFFF] py-16 sm:py-20 border-b border-[#AEB5BD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#20252B] leading-tight [text-wrap:balance]">
                {t.home.introTitle}
              </h2>
              <p className="text-base text-[#4A525D] leading-relaxed">{t.home.introBody}</p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-[#F6F7F9] border border-[#AEB5BD]/25 space-y-2">
                <span className="font-mono-tabular text-xs font-semibold text-[#F28C28]">01</span>
                <h3 className="font-display text-base font-bold text-[#20252B]">
                  {t.home.introPoint1Title}
                </h3>
                <p className="text-sm text-[#4A525D] leading-relaxed">{t.home.introPoint1Desc}</p>
              </div>
              <div className="p-6 rounded-lg bg-[#F6F7F9] border border-[#AEB5BD]/25 space-y-2">
                <span className="font-mono-tabular text-xs font-semibold text-[#F28C28]">02</span>
                <h3 className="font-display text-base font-bold text-[#20252B]">
                  {t.home.introPoint2Title}
                </h3>
                <p className="text-sm text-[#4A525D] leading-relaxed">{t.home.introPoint2Desc}</p>
              </div>
              <div className="p-6 rounded-lg bg-[#F6F7F9] border border-[#AEB5BD]/25 space-y-2">
                <span className="font-mono-tabular text-xs font-semibold text-[#F28C28]">03</span>
                <h3 className="font-display text-base font-bold text-[#20252B]">
                  {t.home.introPoint3Title}
                </h3>
                <p className="text-sm text-[#4A525D] leading-relaxed">{t.home.introPoint3Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Services (Asymmetric Grid) */}
      <section className="bg-[#F6F7F9] py-16 sm:py-20 border-b border-[#AEB5BD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#20252B]">
                {t.home.servicesTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#4A525D]">{t.home.servicesSubtitle}</p>
            </div>
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/services');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F28C28] hover:text-[#D97718] whitespace-nowrap shrink-0"
            >
              <span>{t.home.viewAllServices}</span>
              <ArrowIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((srv, idx) => {
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
                      className="transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-xs font-mono-tabular text-[#F28C28] mb-1">
                        {String(idx + 1).padStart(2, '0')}.
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#20252B] leading-snug">
                        {name}
                      </h3>
                      <p className="text-sm text-[#4A525D] mt-2 leading-relaxed line-clamp-3">
                        {desc}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Equipment (Zero Prices) */}
      <section className="bg-[#FFFFFF] py-16 sm:py-20 border-b border-[#AEB5BD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#20252B]">
                {t.home.equipmentTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#4A525D]">{t.home.equipmentSubtitle}</p>
            </div>
            <a
              href="/equipment"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/equipment');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F28C28] hover:text-[#D97718] whitespace-nowrap shrink-0"
            >
              <span>{t.home.viewAllEquipment}</span>
              <ArrowIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEquipment.map((item) => {
              const name = lang === 'ar' ? item.name_ar : item.name_fr;
              const desc = lang === 'ar' ? item.description_ar : item.description_fr;
              const specs = lang === 'ar' ? item.specs_ar : item.specs_fr;
              const catLabel =
                item.category === 'rental' ? t.equipmentPage.catRental : t.equipmentPage.catSales;

              return (
                <article
                  key={item.id}
                  className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#20252B] overflow-hidden">
                    <SafeImage
                      src={item.image}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#4A525D]">
                        <span className="font-semibold text-[#F28C28]">{catLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            item.availability === 'available'
                              ? 'text-[#15803D] font-medium'
                              : item.availability === 'limited'
                              ? 'text-[#B45309] font-medium'
                              : 'text-[#B91C1C] font-medium'
                          }
                        >
                          {availLabel(item.availability)}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#20252B]">{name}</h3>
                      <p className="text-sm text-[#4A525D] leading-relaxed">{desc}</p>
                      {specs && (
                        <p className="text-xs text-[#5E6773] pt-2 border-t border-[#AEB5BD]/20">
                          {specs}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectEquipmentForBooking(name)}
                      className="w-full py-2.5 px-4 rounded-md bg-[#20252B] hover:bg-[#F28C28] text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer"
                    >
                      {t.equipmentPage.requestEquipment}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="bg-[#20252B] text-[#FFFFFF] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
              {t.home.whyTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#AEB5BD]">{t.home.whySubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.home.whyCards.map((card) => (
              <div
                key={card.num}
                className="p-6 rounded-lg bg-[#2A3038] border border-[#AEB5BD]/15 space-y-3"
              >
                <div className="font-mono-tabular text-sm font-semibold text-[#F28C28]">
                  {card.num}
                </div>
                <h3 className="font-display text-lg font-bold text-[#FFFFFF]">{card.title}</h3>
                <p className="text-sm text-[#AEB5BD] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery Preview */}
      <section className="bg-[#FFFFFF] py-16 sm:py-20 border-b border-[#AEB5BD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#20252B]">
                {t.home.galleryTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#4A525D]">{t.home.gallerySubtitle}</p>
            </div>
            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/projects');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F28C28] hover:text-[#D97718] whitespace-nowrap shrink-0"
            >
              <span>{t.home.viewGallery}</span>
              <ArrowIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((proj) => {
              const title = lang === 'ar' ? proj.title_ar : proj.title_fr;
              const cat = lang === 'ar' ? proj.category_ar : proj.category_fr;
              return (
                <div
                  key={proj.id}
                  className="rounded-lg border border-[#AEB5BD]/30 overflow-hidden bg-[#FFFFFF]"
                >
                  <div className="aspect-[4/3] bg-[#20252B] overflow-hidden">
                    <SafeImage
                      src={proj.image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    {cat && <div className="text-xs font-medium text-[#F28C28]">{cat}</div>}
                    <h3 className="font-display text-sm font-bold text-[#20252B] leading-snug">
                      {title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Appointment CTA + Location Map */}
      <section className="bg-[#F6F7F9] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="bg-[#20252B] text-[#FFFFFF] rounded-lg p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                {t.home.ctaBannerTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#AEB5BD]">{t.home.ctaBannerBody}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/booking"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/booking');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.home.ctaBannerBtn}</span>
              </a>
              <a
                href={COMPANY_INFO.phoneHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md border border-[#AEB5BD]/30 text-[#FFFFFF] hover:border-[#FFFFFF] text-sm font-medium whitespace-nowrap font-mono-tabular"
              >
                <Phone className="w-4 h-4 text-[#F28C28]" />
                <span dir="ltr">{COMPANY_INFO.phoneDisplay}</span>
              </a>
            </div>
          </div>

          <GoogleMapSection />
        </div>
      </section>
    </div>
  );
}
