import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink } from '../i18n/translations';
import type { RoutePath } from '../types';

export function WhatsAppFloat({ currentPath }: { currentPath: RoutePath }) {
  const { t } = useLanguage();

  if (currentPath === '/admin') {
    return null;
  }

  const getContextMessage = () => {
    switch (currentPath) {
      case '/services':
        return t.whatsapp.servicesMsg;
      case '/equipment':
        return t.whatsapp.equipmentMsg;
      case '/booking':
        return t.whatsapp.bookingMsg;
      case '/contact':
        return t.whatsapp.contactMsg;
      default:
        return t.whatsapp.defaultMsg;
    }
  };

  return (
    <a
      href={buildWhatsAppLink(getContextMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.buttonLabel}
      className="fixed bottom-4 end-4 z-40 inline-flex items-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#1EB958] text-[#FFFFFF] px-4 py-3 text-sm font-semibold shadow-lg transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28] focus-visible:ring-offset-2"
    >
      <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
      <span className="hidden sm:inline whitespace-nowrap">{t.whatsapp.buttonLabel}</span>
    </a>
  );
}
