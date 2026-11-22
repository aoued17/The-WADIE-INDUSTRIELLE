import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { EquipmentItem } from '../types';
import { SafeImage } from '../components/SafeImage';

interface EquipmentPageProps {
  equipment: EquipmentItem[];
  onSelectEquipmentForBooking: (equipmentName: string) => void;
}

export function EquipmentPage({ equipment, onSelectEquipmentForBooking }: EquipmentPageProps) {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'rental' | 'sales'>('all');

  const filtered = equipment.filter((item) =>
    filter === 'all' ? true : item.category === filter
  );

  const availLabel = (avail: EquipmentItem['availability']) => {
    if (avail === 'available') return t.equipmentPage.availAvailable;
    if (avail === 'limited') return t.equipmentPage.availLimited;
    return t.equipmentPage.availUnavailable;
  };

  return (
    <div className="bg-[#F6F7F9] min-h-screen">
      <section className="bg-[#20252B] text-[#FFFFFF] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
            {t.equipmentPage.title}
          </h1>
          <p className="text-base sm:text-lg text-[#AEB5BD] max-w-3xl">
            {t.equipmentPage.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Interactive Filter Controls */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#AEB5BD]/30 rounded-lg">
            {(['all', 'rental', 'sales'] as const).map((key) => {
              const label =
                key === 'all'
                  ? t.equipmentPage.filterAll
                  : key === 'rental'
                  ? t.equipmentPage.filterRental
                  : t.equipmentPage.filterSales;
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#20252B] text-[#FFFFFF]'
                      : 'text-[#4A525D] hover:text-[#20252B]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#AEB5BD]/30 rounded-lg p-12 text-center text-[#4A525D]">
              {t.equipmentPage.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const name = lang === 'ar' ? item.name_ar : item.name_fr;
                const desc = lang === 'ar' ? item.description_ar : item.description_fr;
                const specs = lang === 'ar' ? item.specs_ar : item.specs_fr;
                const catLabel =
                  item.category === 'rental'
                    ? t.equipmentPage.catRental
                    : t.equipmentPage.catSales;

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
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-[#F28C28]">{catLabel}</span>
                          <span aria-hidden="true" className="text-[#AEB5BD]">
                            ·
                          </span>
                          <span
                            className={`font-medium ${
                              item.availability === 'available'
                                ? 'text-[#15803D]'
                                : item.availability === 'limited'
                                ? 'text-[#B45309]'
                                : 'text-[#B91C1C]'
                            }`}
                          >
                            {availLabel(item.availability)}
                          </span>
                        </div>

                        <h2 className="font-display text-lg font-bold text-[#20252B] leading-snug">
                          {name}
                        </h2>
                        <p className="text-sm text-[#4A525D] leading-relaxed">{desc}</p>

                        {specs && (
                          <div className="pt-3 border-t border-[#AEB5BD]/20 text-xs text-[#5E6773] leading-relaxed">
                            {specs}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectEquipmentForBooking(name)}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-[#20252B] hover:bg-[#F28C28] text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{t.equipmentPage.requestEquipment}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
