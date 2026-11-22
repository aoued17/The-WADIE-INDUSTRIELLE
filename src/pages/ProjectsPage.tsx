import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { ProjectItem } from '../types';
import { SafeImage } from '../components/SafeImage';

export function ProjectsPage({ projects }: { projects: ProjectItem[] }) {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      const cat = lang === 'ar' ? p.category_ar : p.category_fr;
      if (cat) set.add(cat);
    }
    return Array.from(set);
  }, [projects, lang]);

  const filtered = projects.filter((p) => {
    if (selectedCategory === 'all') return true;
    const cat = lang === 'ar' ? p.category_ar : p.category_fr;
    return cat === selectedCategory;
  });

  return (
    <div className="bg-[#F6F7F9] min-h-screen">
      <section className="bg-[#20252B] text-[#FFFFFF] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
            {t.projectsPage.title}
          </h1>
          <p className="text-base sm:text-lg text-[#AEB5BD] max-w-3xl">
            {t.projectsPage.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#FFFFFF] border border-[#AEB5BD]/30 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#20252B] text-[#FFFFFF]'
                    : 'text-[#4A525D] hover:text-[#20252B]'
                }`}
              >
                {t.projectsPage.filterAll}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#20252B] text-[#FFFFFF]'
                      : 'text-[#4A525D] hover:text-[#20252B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => {
              const title = lang === 'ar' ? item.title_ar : item.title_fr;
              const desc = lang === 'ar' ? item.description_ar : item.description_fr;
              const cat = lang === 'ar' ? item.category_ar : item.category_fr;

              return (
                <article
                  key={item.id}
                  className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#20252B] overflow-hidden">
                    <SafeImage
                      src={item.image}
                      alt={title}
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    {cat && <div className="text-xs font-semibold text-[#F28C28]">{cat}</div>}
                    <h2 className="font-display text-xl font-bold text-[#20252B]">{title}</h2>
                    <p className="text-sm text-[#4A525D] leading-relaxed">{desc}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="text-xs text-[#5E6773] pt-2">{t.projectsPage.note}</p>
        </div>
      </section>
    </div>
  );
}
