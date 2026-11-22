import { MapPin, MessageCircle, Phone, Shield } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink, COMPANY_INFO } from '../i18n/translations';
import type { RoutePath } from '../types';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (path: RoutePath) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { lang, t } = useLanguage();
  const year = new Date().getFullYear();
  const address = lang === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressFr;

  const links: Array<{ path: RoutePath; label: string }> = [
    { path: '/', label: t.nav.home },
    { path: '/about', label: t.nav.about },
    { path: '/services', label: t.nav.services },
    { path: '/equipment', label: t.nav.equipment },
    { path: '/projects', label: t.nav.projects },
    { path: '/booking', label: t.nav.booking },
    { path: '/contact', label: t.nav.contact },
  ];

  return (
    <footer className="bg-[#20252B] text-[#FFFFFF] border-t border-[#AEB5BD]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#AEB5BD]/15">
          <div className="md:col-span-5 space-y-4">
            <BrandLogo darkSurface />
            <p className="text-sm text-[#AEB5BD] leading-relaxed max-w-md">{t.footer.tagline}</p>
            <div className="pt-2 flex items-start gap-2.5 text-sm text-[#AEB5BD]">
              <MapPin className="w-4 h-4 text-[#F28C28] mt-0.5 shrink-0" />
              <span>{address}</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold text-[#FFFFFF]">{t.footer.linksTitle}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.path);
                    }}
                    className="text-sm text-[#AEB5BD] hover:text-[#FFFFFF] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-semibold text-[#FFFFFF]">{t.footer.contactTitle}</h4>
            <div className="space-y-2.5 text-sm">
              <a
                href={COMPANY_INFO.phoneHref}
                className="flex items-center gap-2.5 text-[#AEB5BD] hover:text-[#FFFFFF] transition-colors font-mono-tabular"
              >
                <Phone className="w-4 h-4 text-[#F28C28] shrink-0" />
                <span dir="ltr">{COMPANY_INFO.phoneDisplay}</span>
              </a>
              <a
                href={buildWhatsAppLink(t.whatsapp.defaultMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#AEB5BD] hover:text-[#FFFFFF] transition-colors font-mono-tabular"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <span dir="ltr">{COMPANY_INFO.whatsappNumber}</span>
              </a>
            </div>
            <div className="pt-3">
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/admin');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#AEB5BD]/80 hover:text-[#F28C28] transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t.footer.adminLink}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AEB5BD]">
          <p>{t.footer.rights.replace('{year}', String(year))}</p>
          <p className="font-mono-tabular" dir="ltr">
            Yellel · Relizane · Algeria
          </p>
        </div>
      </div>
    </footer>
  );
}
