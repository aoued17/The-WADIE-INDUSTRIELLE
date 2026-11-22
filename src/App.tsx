import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { BookingPage } from './pages/BookingPage';
import { ContactPage } from './pages/ContactPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ServicesPage } from './pages/ServicesPage';
import type {
  CatalogResponse,
  EquipmentItem,
  ProjectItem,
  RoutePath,
  ServiceItem,
} from './types';

const VALID_ROUTES: RoutePath[] = [
  '/',
  '/about',
  '/services',
  '/equipment',
  '/projects',
  '/booking',
  '/contact',
  '/admin',
];

function parseRoute(pathname: string): RoutePath {
  const cleaned = pathname.replace(/\/+$/, '') || '/';
  return VALID_ROUTES.includes(cleaned as RoutePath) ? (cleaned as RoutePath) : '/';
}

function AppShell() {
  const { lang, t } = useLanguage();
  const [currentPath, setCurrentPath] = useState<RoutePath>(() =>
    parseRoute(window.location.pathname)
  );
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [preselectedService, setPreselectedService] = useState('');
  const [preselectedEquipment, setPreselectedEquipment] = useState('');

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) return;
      const data = (await res.json()) as CatalogResponse;
      setServices(data.services || []);
      setEquipment(data.equipment || []);
      setProjects(data.projects || []);
    } catch {
      // Keep current catalog state on transient network failure
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    const onPop = () => {
      setCurrentPath(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const pageTitleMap: Record<RoutePath, string> = {
      '/': t.nav.home,
      '/about': t.nav.about,
      '/services': t.nav.services,
      '/equipment': t.nav.equipment,
      '/projects': t.nav.projects,
      '/booking': t.nav.booking,
      '/contact': t.nav.contact,
      '/admin': t.nav.admin,
    };
    document.title = `${pageTitleMap[currentPath]} | WADIE INDUSTRIELLE`;
  }, [currentPath, lang, t]);

  const navigate = useCallback((path: RoutePath) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRequestService = (serviceName: string) => {
    setPreselectedService(serviceName);
    setPreselectedEquipment('');
    navigate('/booking');
  };

  const handleSelectEquipment = (equipmentName: string) => {
    setPreselectedEquipment(equipmentName);
    setPreselectedService(services[0] ? (lang === 'ar' ? services[0].name_ar : services[0].name_fr) : '');
    navigate('/booking');
  };

  if (currentPath === '/admin') {
    return <AdminPage onNavigate={navigate} onCatalogMutated={fetchCatalog} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#20252B]">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            services={services}
            equipment={equipment}
            projects={projects}
            onNavigate={navigate}
            onSelectEquipmentForBooking={handleSelectEquipment}
          />
        )}
        {currentPath === '/about' && <AboutPage onNavigate={navigate} />}
        {currentPath === '/services' && (
          <ServicesPage services={services} onRequestService={handleRequestService} />
        )}
        {currentPath === '/equipment' && (
          <EquipmentPage
            equipment={equipment}
            onSelectEquipmentForBooking={handleSelectEquipment}
          />
        )}
        {currentPath === '/projects' && <ProjectsPage projects={projects} />}
        {currentPath === '/booking' && (
          <BookingPage
            services={services}
            equipment={equipment}
            initialService={preselectedService}
            initialEquipment={preselectedEquipment}
          />
        )}
        {currentPath === '/contact' && <ContactPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
      <WhatsAppFloat currentPath={currentPath} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}
