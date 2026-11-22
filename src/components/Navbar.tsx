import { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { RoutePath } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const { t, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ path: RoutePath; label: string }> = [
    { path: '/about', label: t.nav.about },
    { path: '/services', label: t.nav.services },
    { path: '/equipment', label: t.nav.equipment },
    { path: '/projects', label: t.nav.projects },
    { path: '/contact', label: t.nav.contact },
  ];

  const handleNav = (path: RoutePath) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#20252B] border-b border-[#AEB5BD]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28] rounded"
        >
          <BrandLogo darkSurface />
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  active
                    ? 'text-[#FFFFFF] border-[#F28C28]'
                    : 'text-[#AEB5BD] border-transparent hover:text-[#FFFFFF] hover:border-[#AEB5BD]/50'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher + Primary CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            title={t.switchLangTitle}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#AEB5BD]/25 text-xs font-semibold text-[#AEB5BD] hover:text-[#FFFFFF] hover:border-[#AEB5BD]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28]"
          >
            <Globe className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>{t.switchLang}</span>
          </button>

          <a
            href="/booking"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/booking');
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
          >
            {t.nav.booking}
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleLang}
            title={t.switchLangTitle}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-md border border-[#AEB5BD]/25 text-xs font-semibold text-[#FFFFFF] whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Globe className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>{t.switchLang}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
            className="p-2 rounded-md text-[#FFFFFF] hover:bg-[#2A3038] min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#181C21] border-t border-[#AEB5BD]/15 px-4 py-4 space-y-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className={`block px-3 py-2.5 rounded-md text-sm font-medium ${
              currentPath === '/' ? 'bg-[#2A3038] text-[#FFFFFF]' : 'text-[#AEB5BD] hover:text-[#FFFFFF]'
            }`}
          >
            {t.nav.home}
          </a>
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                handleNav(item.path);
              }}
              className={`block px-3 py-2.5 rounded-md text-sm font-medium ${
                currentPath === item.path
                  ? 'bg-[#2A3038] text-[#FFFFFF]'
                  : 'text-[#AEB5BD] hover:text-[#FFFFFF]'
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/booking"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/booking');
            }}
            className="block w-full text-center mt-3 px-4 py-3 rounded-md bg-[#F28C28] text-[#FFFFFF] text-sm font-semibold"
          >
            {t.nav.booking}
          </a>
        </div>
      )}
    </header>
  );
}
