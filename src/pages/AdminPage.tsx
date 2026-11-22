import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Globe,
  Hammer,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { SafeImage } from '../components/SafeImage';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink } from '../i18n/translations';
import type {
  BookingRecord,
  BookingStatus,
  EquipmentItem,
  ProjectItem,
  RoutePath,
  ServiceItem,
} from '../types';

type AdminTab = 'overview' | 'bookings' | 'services' | 'equipment' | 'projects';

const PRESET_IMAGES = [
  { label: 'Facility / Depot', url: '/src/assets/images/hero_industrial_facility_1795358134297.jpg' },
  { label: 'Construction Fleet (Rental)', url: '/src/assets/images/equipment_construction_fleet_1795358134026.jpg' },
  { label: 'Construction Showroom (Sales)', url: '/src/assets/images/service_construction_sales_1795359215190.jpg' },
  { label: 'Demolition Hammers', url: '/src/assets/images/service_demolition_hammers_1795358133016.jpg' },
  { label: 'Industrial Compressors', url: '/src/assets/images/service_air_compressors_1795359215140.jpg' },
  { label: 'Painting Equipment', url: '/src/assets/images/service_painting_equipment_1795358135259.jpg' },
  { label: 'Welding Equipment', url: '/src/assets/images/service_welding_station_1795359215078.jpg' },
  { label: 'Steel Fabrication', url: '/src/assets/images/project_steel_fabrication_1795358133713.jpg' },
  { label: 'Demolition & Dismantling', url: '/src/assets/images/service_demolition_site_1795359215539.jpg' },
  { label: 'Industrial Workshop', url: '/src/assets/images/service_industrial_workshop_1795359214398.jpg' },
];

function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `213${digits.slice(1)}`;
  }
  if (digits.startsWith('213')) return digits;
  return digits;
}

export function AdminPage({
  onNavigate,
  onCatalogMutated,
}: {
  onNavigate: (path: RoutePath) => void;
  onCatalogMutated: () => void;
}) {
  const { lang, t, toggleLang } = useLanguage();

  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; connected: boolean }>({
    configured: false,
    connected: false,
  });

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [cmsFeedback, setCmsFeedback] = useState<string | null>(null);

  // Booking filters & detail modal
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Editors
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Partial<EquipmentItem> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);

  const checkSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const res = await fetch('/api/admin/session', { credentials: 'include' });
      const data = await res.json();
      setAuthenticated(Boolean(data.authenticated));
      setAdminConfigured(data.adminConfigured !== false);
      if (data.database) {
        setDbStatus({
          configured: Boolean(data.database.configured),
          connected: Boolean(data.database.connected),
        });
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!authenticated) return;
    setLoadingData(true);
    try {
      const [bRes, sRes, eRes, pRes] = await Promise.all([
        fetch('/api/admin/bookings', { credentials: 'include' }),
        fetch('/api/admin/services', { credentials: 'include' }),
        fetch('/api/admin/equipment', { credentials: 'include' }),
        fetch('/api/admin/projects', { credentials: 'include' }),
      ]);

      if (bRes.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (bRes.ok) {
        const bd = await bRes.json();
        setBookings(bd.bookings || []);
      }
      if (sRes.ok) {
        const sd = await sRes.json();
        setServices(sd.services || []);
      }
      if (eRes.ok) {
        const ed = await eRes.json();
        setEquipment(ed.equipment || []);
      }
      if (pRes.ok) {
        const pd = await pRes.json();
        setProjects(pd.projects || []);
      }
    } finally {
      setLoadingData(false);
    }
  }, [authenticated]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (authenticated && dbStatus.configured) {
      loadDashboardData();
    }
  }, [authenticated, dbStatus.configured, loadDashboardData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLoginError(t.admin.emailRequired);
      return;
    }
    if (!loginPassword) {
      setLoginError(t.admin.passwordRequired);
      return;
    }

    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email: trimmedEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === 'ADMIN_NOT_CONFIGURED') {
          setLoginError(t.admin.notConfigured);
        } else {
          setLoginError(t.admin.invalidCreds);
        }
        return;
      }
      setLoginPassword('');
      setLoginEmail('');
      setAuthenticated(true);
      await checkSession();
    } catch {
      setLoginError(t.admin.invalidCreds);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    setAuthenticated(false);
    setBookings([]);
  };

  const handleUpdateStatus = async (bookingId: number, status: BookingStatus) => {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(data.booking);
      }
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setCmsFeedback(null);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        await loadDashboardData();
        onCatalogMutated();
      }
    } finally {
      setSeeding(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter && b.appointment_date !== dateFilter) return false;
      if (q) {
        const hay = `${b.customer_name} ${b.phone} ${b.booking_reference} ${b.service}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      rejected: bookings.filter((b) => b.status === 'rejected').length,
      upcoming: bookings.filter(
        (b) => b.appointment_date >= todayIso && (b.status === 'pending' || b.status === 'confirmed')
      ).length,
    };
  }, [bookings]);

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setCmsFeedback(null);
    const isEdit = Boolean(editingService.id);
    const res = await fetch('/api/admin/services', {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(editingService),
    });
    if (res.ok) {
      setEditingService(null);
      await loadDashboardData();
      onCatalogMutated();
    } else {
      const d = await res.json();
      setCmsFeedback(d.error || 'Error');
    }
  };

  const deleteService = async (id: number) => {
    await fetch(`/api/admin/services?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    await loadDashboardData();
    onCatalogMutated();
  };

  const saveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    setCmsFeedback(null);
    const isEdit = Boolean(editingEquipment.id);
    const res = await fetch('/api/admin/equipment', {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(editingEquipment),
    });
    if (res.ok) {
      setEditingEquipment(null);
      await loadDashboardData();
      onCatalogMutated();
    } else {
      const d = await res.json();
      setCmsFeedback(d.error || 'Error');
    }
  };

  const toggleEquipmentAvailability = async (
    id: number,
    availability: EquipmentItem['availability']
  ) => {
    await fetch('/api/admin/equipment', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id, availability }),
    });
    await loadDashboardData();
    onCatalogMutated();
  };

  const deleteEquipment = async (id: number) => {
    await fetch(`/api/admin/equipment?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    await loadDashboardData();
    onCatalogMutated();
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setCmsFeedback(null);
    const isEdit = Boolean(editingProject.id);
    const res = await fetch('/api/admin/projects', {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(editingProject),
    });
    if (res.ok) {
      setEditingProject(null);
      await loadDashboardData();
      onCatalogMutated();
    } else {
      const d = await res.json();
      setCmsFeedback(d.error || 'Error');
    }
  };

  const deleteProject = async (id: number) => {
    await fetch(`/api/admin/projects?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    await loadDashboardData();
    onCatalogMutated();
  };

  const statusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]';
      case 'rejected':
        return 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]';
      case 'completed':
        return 'text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]';
      default:
        return 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]';
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#20252B] flex items-center justify-center text-[#AEB5BD]">
        <Loader2 className="w-6 h-6 animate-spin text-[#F28C28]" />
      </div>
    );
  }

  // Premium Dark Industrial Login Page (never leaks admin email)
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#20252B] text-[#FFFFFF] flex flex-col justify-between p-4 sm:p-8">
        <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C28] rounded"
          >
            <BrandLogo darkSurface />
          </a>
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#AEB5BD]/25 text-xs font-semibold text-[#AEB5BD] hover:text-[#FFFFFF] hover:border-[#AEB5BD]/50 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>{t.switchLang}</span>
          </button>
        </header>

        <main className="w-full max-w-md mx-auto my-8">
          <div className="bg-[#181C21] rounded-lg border border-[#AEB5BD]/20 overflow-hidden shadow-xl">
            <div className="h-1 bg-[#F28C28]" />
            <div className="p-7 sm:p-9 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <BrandLogo darkSurface />
                  <Lock className="w-4 h-4 text-[#F28C28]" />
                </div>
                <div className="pt-1 space-y-1">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-[#FFFFFF]" dir="ltr">
                    {t.admin.loginTitle}
                  </h1>
                  <p className="text-sm text-[#AEB5BD] leading-relaxed">
                    {t.admin.loginSubtitle}
                  </p>
                </div>
              </div>

              {!adminConfigured && (
                <div className="p-3.5 rounded-md bg-[#F28C28]/10 border border-[#F28C28]/40 text-[#FDBA74] text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F28C28]" />
                  <span>{t.admin.notConfigured}</span>
                </div>
              )}

              {loginError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-md bg-[#991B1B]/25 border border-[#EF4444]/40 text-[#FCA5A5] text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F87171]" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="adm-email" className="block text-xs font-semibold text-[#AEB5BD]">
                    {t.admin.emailLabel}
                  </label>
                  <input
                    id="adm-email"
                    type="email"
                    dir="ltr"
                    required
                    autoComplete="username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t.admin.emailPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-md bg-[#20252B] border border-[#AEB5BD]/30 text-sm text-[#FFFFFF] placeholder:text-[#AEB5BD]/50 focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-pass" className="block text-xs font-semibold text-[#AEB5BD]">
                    {t.admin.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="adm-pass"
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t.admin.passwordPlaceholder}
                      className="w-full px-3.5 pe-11 py-2.5 rounded-md bg-[#20252B] border border-[#AEB5BD]/30 text-sm text-[#FFFFFF] placeholder:text-[#AEB5BD]/50 focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? t.admin.hidePassword : t.admin.showPassword}
                      className="absolute inset-y-0 end-0 px-3 flex items-center text-[#AEB5BD] hover:text-[#FFFFFF] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-3 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] disabled:opacity-60 text-[#FFFFFF] text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loggingIn ? t.admin.loggingIn : t.admin.loginBtn}</span>
                </button>
              </form>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-[#AEB5BD]">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="hover:text-[#FFFFFF] transition-colors"
          >
            {t.admin.sidebar.backToSite}
          </a>
        </footer>
      </div>
    );
  }

  // Authenticated Dashboard Workspace
  const sidebarItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: t.admin.sidebar.overview, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bookings', label: t.admin.sidebar.bookings, icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'services', label: t.admin.sidebar.services, icon: <Hammer className="w-4 h-4" /> },
    { id: 'equipment', label: t.admin.sidebar.equipment, icon: <Wrench className="w-4 h-4" /> },
    { id: 'projects', label: t.admin.sidebar.projects, icon: <FolderKanban className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col lg:flex-row">
      {/* Dark Charcoal Sidebar */}
      <aside className="lg:w-64 bg-[#20252B] text-[#FFFFFF] flex flex-col justify-between shrink-0 border-b lg:border-b-0 lg:border-e border-[#AEB5BD]/15">
        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-bold text-sm tracking-tight text-[#FFFFFF]" dir="ltr">
                WADIE <span className="text-[#F28C28]">INDUSTRIELLE</span>
              </span>
              <button
                type="button"
                onClick={toggleLang}
                className="px-2 py-1 rounded border border-[#AEB5BD]/25 text-xs text-[#AEB5BD] hover:text-[#FFFFFF] cursor-pointer"
              >
                {t.switchLang}
              </button>
            </div>
            <div className="text-xs text-[#AEB5BD]" dir="ltr">
              {t.admin.headerSubtitle}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#181C21] border border-[#AEB5BD]/15 text-xs font-medium text-[#FFFFFF]">
            <ShieldCheck className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span>{t.admin.identityLabel}</span>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {sidebarItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#F28C28] text-[#FFFFFF]'
                      : 'text-[#AEB5BD] hover:bg-[#2A3038] hover:text-[#FFFFFF]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-[#AEB5BD]/15 flex lg:flex-col gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-[#AEB5BD] hover:text-[#FFFFFF] hover:bg-[#2A3038] cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.admin.sidebar.backToSite}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-[#FCA5A5] hover:bg-[#2A3038] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.admin.sidebar.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#FFFFFF] border-b border-[#AEB5BD]/25 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div dir="ltr">
            <div className="font-display text-base font-bold text-[#20252B]">
              WADIE INDUSTRIELLE
            </div>
            <div className="text-xs text-[#5E6773]">Administration Dashboard</div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#20252B]">
            <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
            <span>{t.admin.identityLabel}</span>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 overflow-x-hidden space-y-6">
          {!dbStatus.connected && (
            <div className="p-4 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-sm flex items-start gap-3">
              <Database className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{t.admin.dbWarning}</span>
            </div>
          )}

          {dbStatus.connected &&
            services.length === 0 &&
            equipment.length === 0 &&
            projects.length === 0 &&
            !loadingData && (
              <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#AEB5BD]/30 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-[#20252B]">{t.admin.cms.seedBtn}</span>
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="px-4 py-2 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-xs font-semibold cursor-pointer"
                >
                  {seeding ? t.admin.cms.seeding : t.admin.cms.seedBtn}
                </button>
              </div>
            )}

          {cmsFeedback && (
            <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs">
              {cmsFeedback}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-bold text-[#20252B]">
                {t.admin.sidebar.overview}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#AEB5BD]/30 space-y-1">
                  <div className="text-xs text-[#5E6773]">{t.admin.stats.total}</div>
                  <div className="font-mono-tabular text-2xl font-bold text-[#20252B]">
                    {stats.total}
                  </div>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#AEB5BD]/30 space-y-1">
                  <div className="text-xs text-[#5E6773]">{t.admin.stats.pending}</div>
                  <div className="font-mono-tabular text-2xl font-bold text-[#B45309]">
                    {stats.pending}
                  </div>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#AEB5BD]/30 space-y-1">
                  <div className="text-xs text-[#5E6773]">{t.admin.stats.confirmed}</div>
                  <div className="font-mono-tabular text-2xl font-bold text-[#15803D]">
                    {stats.confirmed}
                  </div>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#AEB5BD]/30 space-y-1">
                  <div className="text-xs text-[#5E6773]">{t.admin.stats.rejected}</div>
                  <div className="font-mono-tabular text-2xl font-bold text-[#B91C1C]">
                    {stats.rejected}
                  </div>
                </div>
                <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#AEB5BD]/30 space-y-1">
                  <div className="text-xs text-[#5E6773]">{t.admin.stats.upcoming}</div>
                  <div className="font-mono-tabular text-2xl font-bold text-[#F28C28]">
                    {stats.upcoming}
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-[#20252B]">
                    {t.admin.bookingsTable.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-semibold text-[#F28C28] hover:underline cursor-pointer"
                  >
                    {t.admin.sidebar.bookings}
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <p className="text-sm text-[#5E6773]">{t.admin.bookingsTable.empty}</p>
                ) : (
                  <div className="divide-y divide-[#AEB5BD]/20">
                    {bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[#20252B]">
                            {b.customer_name}{' '}
                            <span className="font-mono-tabular text-xs text-[#5E6773]" dir="ltr">
                              ({b.booking_reference})
                            </span>
                          </div>
                          <div className="text-xs text-[#5E6773]">{b.service}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono-tabular text-xs text-[#4A525D]" dir="ltr">
                            {b.appointment_date} {b.appointment_time}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded border text-xs font-medium ${statusBadgeColor(
                              b.status
                            )}`}
                          >
                            {t.admin.statuses[b.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="space-y-5">
              <h1 className="font-display text-2xl font-bold text-[#20252B]">
                {t.admin.bookingsTable.title}
              </h1>

              <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#AEB5BD]/30 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-[#5E6773] absolute top-3 start-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.admin.bookingsTable.searchPlaceholder}
                    className="w-full ps-9 pe-3 py-2 rounded-md border border-[#AEB5BD]/50 text-sm focus:outline-none focus:border-[#F28C28]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
                    className="w-full px-3 py-2 rounded-md border border-[#AEB5BD]/50 text-sm bg-[#FFFFFF]"
                  >
                    <option value="all">{t.admin.bookingsTable.allStatuses}</option>
                    {(['pending', 'confirmed', 'rejected', 'completed'] as const).map((st) => (
                      <option key={st} value={st}>
                        {t.admin.statuses[st]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="date"
                    dir="ltr"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[#AEB5BD]/50 text-sm font-mono-tabular"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDateFilter('');
                    }}
                    className="w-full px-3 py-2 rounded-md border border-[#AEB5BD]/50 text-xs font-semibold text-[#20252B] hover:bg-[#F6F7F9] cursor-pointer"
                  >
                    {t.admin.bookingsTable.clearFilters}
                  </button>
                </div>
              </div>

              <div className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-x-auto">
                <table className="w-full text-sm text-start">
                  <thead className="bg-[#F6F7F9] border-b border-[#AEB5BD]/25 text-xs font-semibold text-[#4A525D]">
                    <tr>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.ref}</th>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.customer}</th>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.phone}</th>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.service}</th>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.dateTime}</th>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.status}</th>
                      <th className="py-3 px-4 text-start">{t.admin.bookingsTable.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#AEB5BD]/20">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[#5E6773]">
                          {t.admin.bookingsTable.empty}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const waNum = normalizePhoneForWhatsApp(b.phone);
                        const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(
                          lang === 'ar'
                            ? `السلام عليكم ${b.customer_name}، بخصوص طلب الموعد ${b.booking_reference} لدى WADIE INDUSTRIELLE.`
                            : `Bonjour ${b.customer_name}, concernant votre rendez-vous ${b.booking_reference} chez WADIE INDUSTRIELLE.`
                        )}`;
                        return (
                          <tr key={b.id} className="hover:bg-[#F9FAFB]">
                            <td className="py-3 px-4 font-mono-tabular text-xs font-semibold text-[#20252B]" dir="ltr">
                              {b.booking_reference}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#20252B]">{b.customer_name}</td>
                            <td className="py-3 px-4 font-mono-tabular text-xs" dir="ltr">
                              {b.phone}
                            </td>
                            <td className="py-3 px-4 text-[#4A525D] max-w-[200px] truncate">
                              {b.service}
                            </td>
                            <td className="py-3 px-4 font-mono-tabular text-xs" dir="ltr">
                              {b.appointment_date} {b.appointment_time}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${statusBadgeColor(
                                  b.status
                                )}`}
                              >
                                {t.admin.statuses[b.status]}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBooking(b)}
                                  className="px-2 py-1 rounded border border-[#AEB5BD]/40 text-xs font-medium hover:bg-[#F6F7F9] cursor-pointer"
                                >
                                  {t.admin.bookingsTable.details}
                                </button>
                                {b.status !== 'confirmed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                    className="px-2 py-1 rounded bg-[#15803D] text-[#FFFFFF] text-xs font-medium hover:opacity-90 cursor-pointer"
                                  >
                                    {t.admin.bookingsTable.confirm}
                                  </button>
                                )}
                                {b.status !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(b.id, 'rejected')}
                                    className="px-2 py-1 rounded bg-[#B91C1C] text-[#FFFFFF] text-xs font-medium hover:opacity-90 cursor-pointer"
                                  >
                                    {t.admin.bookingsTable.reject}
                                  </button>
                                )}
                                {b.status === 'confirmed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                                    className="px-2 py-1 rounded bg-[#1D4ED8] text-[#FFFFFF] text-xs font-medium hover:opacity-90 cursor-pointer"
                                  >
                                    {t.admin.bookingsTable.complete}
                                  </button>
                                )}
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#25D366] text-[#FFFFFF] text-xs font-medium"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{t.admin.bookingsTable.whatsapp}</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES CMS */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold text-[#20252B]">
                  {t.admin.sidebar.services}
                </h1>
                <button
                  type="button"
                  onClick={() =>
                    setEditingService({
                      name_ar: '',
                      name_fr: '',
                      description_ar: '',
                      description_fr: '',
                      image: PRESET_IMAGES[0].url,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.admin.cms.addService}</span>
                </button>
              </div>

              {editingService && (
                <form
                  onSubmit={saveService}
                  className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder={t.admin.cms.nameAr}
                      value={editingService.name_ar || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, name_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      required
                      dir="ltr"
                      placeholder={t.admin.cms.nameFr}
                      value={editingService.name_fr || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, name_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder={t.admin.cms.descAr}
                      value={editingService.description_ar || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, description_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <textarea
                      required
                      rows={3}
                      dir="ltr"
                      placeholder={t.admin.cms.descFr}
                      value={editingService.description_fr || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, description_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      dir="ltr"
                      placeholder={t.admin.cms.imageUrl}
                      value={editingService.image || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, image: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <select
                      value={editingService.image || ''}
                      onChange={(e) =>
                        setEditingService({ ...editingService, image: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm bg-[#FFFFFF]"
                    >
                      <option value="">{t.admin.cms.choosePresetImage}</option>
                      {PRESET_IMAGES.map((img) => (
                        <option key={img.url} value={img.url}>
                          {img.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-[#20252B] text-[#FFFFFF] text-sm font-semibold cursor-pointer"
                    >
                      {t.admin.cms.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-md border border-[#AEB5BD]/40 text-sm cursor-pointer"
                    >
                      {t.admin.cms.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#20252B]">
                      <SafeImage src={s.image} alt={s.name_fr} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-[#20252B]">
                          {lang === 'ar' ? s.name_ar : s.name_fr}
                        </h3>
                        <p className="text-xs text-[#4A525D] mt-1 line-clamp-2">
                          {lang === 'ar' ? s.description_ar : s.description_fr}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-[#AEB5BD]/20">
                        <button
                          type="button"
                          onClick={() => setEditingService(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#AEB5BD]/40 text-xs cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{t.admin.cms.edit}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(s.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#FECACA] text-[#B91C1C] text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.admin.cms.delete}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EQUIPMENT CMS */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold text-[#20252B]">
                  {t.admin.sidebar.equipment}
                </h1>
                <button
                  type="button"
                  onClick={() =>
                    setEditingEquipment({
                      name_ar: '',
                      name_fr: '',
                      description_ar: '',
                      description_fr: '',
                      specs_ar: '',
                      specs_fr: '',
                      category: 'rental',
                      availability: 'available',
                      image: PRESET_IMAGES[1].url,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.admin.cms.addEquipment}</span>
                </button>
              </div>

              {editingEquipment && (
                <form
                  onSubmit={saveEquipment}
                  className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder={t.admin.cms.nameAr}
                      value={editingEquipment.name_ar || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, name_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      required
                      dir="ltr"
                      placeholder={t.admin.cms.nameFr}
                      value={editingEquipment.name_fr || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, name_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder={t.admin.cms.descAr}
                      value={editingEquipment.description_ar || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, description_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <textarea
                      required
                      rows={3}
                      dir="ltr"
                      placeholder={t.admin.cms.descFr}
                      value={editingEquipment.description_fr || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, description_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      placeholder={t.admin.cms.specsAr}
                      value={editingEquipment.specs_ar || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, specs_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      dir="ltr"
                      placeholder={t.admin.cms.specsFr}
                      value={editingEquipment.specs_fr || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, specs_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <select
                      value={editingEquipment.category || 'rental'}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          category: e.target.value as 'rental' | 'sales',
                        })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm bg-[#FFFFFF]"
                    >
                      <option value="rental">{t.equipmentPage.catRental}</option>
                      <option value="sales">{t.equipmentPage.catSales}</option>
                    </select>
                    <select
                      value={editingEquipment.availability || 'available'}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          availability: e.target.value as EquipmentItem['availability'],
                        })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm bg-[#FFFFFF]"
                    >
                      <option value="available">{t.equipmentPage.availAvailable}</option>
                      <option value="limited">{t.equipmentPage.availLimited}</option>
                      <option value="unavailable">{t.equipmentPage.availUnavailable}</option>
                    </select>
                    <input
                      required
                      dir="ltr"
                      placeholder={t.admin.cms.imageUrl}
                      value={editingEquipment.image || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, image: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <select
                      value={editingEquipment.image || ''}
                      onChange={(e) =>
                        setEditingEquipment({ ...editingEquipment, image: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm bg-[#FFFFFF]"
                    >
                      <option value="">{t.admin.cms.choosePresetImage}</option>
                      {PRESET_IMAGES.map((img) => (
                        <option key={img.url} value={img.url}>
                          {img.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-[#20252B] text-[#FFFFFF] text-sm font-semibold cursor-pointer"
                    >
                      {t.admin.cms.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEquipment(null)}
                      className="px-4 py-2 rounded-md border border-[#AEB5BD]/40 text-sm cursor-pointer"
                    >
                      {t.admin.cms.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#20252B]">
                      <SafeImage src={eq.image} alt={eq.name_fr} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-[#F28C28]">
                          {eq.category === 'rental'
                            ? t.equipmentPage.catRental
                            : t.equipmentPage.catSales}
                        </div>
                        <h3 className="font-bold text-sm text-[#20252B]">
                          {lang === 'ar' ? eq.name_ar : eq.name_fr}
                        </h3>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[#AEB5BD]/20">
                        <select
                          value={eq.availability}
                          onChange={(e) =>
                            toggleEquipmentAvailability(
                              eq.id,
                              e.target.value as EquipmentItem['availability']
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-[#AEB5BD]/40 text-xs bg-[#FFFFFF]"
                        >
                          <option value="available">{t.equipmentPage.availAvailable}</option>
                          <option value="limited">{t.equipmentPage.availLimited}</option>
                          <option value="unavailable">{t.equipmentPage.availUnavailable}</option>
                        </select>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingEquipment(eq)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#AEB5BD]/40 text-xs cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>{t.admin.cms.edit}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEquipment(eq.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#FECACA] text-[#B91C1C] text-xs cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.admin.cms.delete}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY / PROJECTS CMS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold text-[#20252B]">
                  {t.admin.sidebar.projects}
                </h1>
                <button
                  type="button"
                  onClick={() =>
                    setEditingProject({
                      title_ar: '',
                      title_fr: '',
                      description_ar: '',
                      description_fr: '',
                      category_ar: '',
                      category_fr: '',
                      image: PRESET_IMAGES[7].url,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#F28C28] hover:bg-[#DA7B1C] text-[#FFFFFF] text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.admin.cms.addProject}</span>
                </button>
              </div>

              {editingProject && (
                <form
                  onSubmit={saveProject}
                  className="bg-[#FFFFFF] p-6 rounded-lg border border-[#AEB5BD]/30 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder={t.admin.cms.nameAr}
                      value={editingProject.title_ar || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, title_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      required
                      dir="ltr"
                      placeholder={t.admin.cms.nameFr}
                      value={editingProject.title_fr || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, title_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      placeholder={t.admin.cms.catAr}
                      value={editingProject.category_ar || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, category_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      dir="ltr"
                      placeholder={t.admin.cms.catFr}
                      value={editingProject.category_fr || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, category_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder={t.admin.cms.descAr}
                      value={editingProject.description_ar || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, description_ar: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <textarea
                      required
                      rows={3}
                      dir="ltr"
                      placeholder={t.admin.cms.descFr}
                      value={editingProject.description_fr || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, description_fr: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <input
                      required
                      dir="ltr"
                      placeholder={t.admin.cms.imageUrl}
                      value={editingProject.image || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, image: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm"
                    />
                    <select
                      value={editingProject.image || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, image: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-[#AEB5BD]/50 text-sm bg-[#FFFFFF]"
                    >
                      <option value="">{t.admin.cms.choosePresetImage}</option>
                      {PRESET_IMAGES.map((img) => (
                        <option key={img.url} value={img.url}>
                          {img.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-[#20252B] text-[#FFFFFF] text-sm font-semibold cursor-pointer"
                    >
                      {t.admin.cms.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-md border border-[#AEB5BD]/40 text-sm cursor-pointer"
                    >
                      {t.admin.cms.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/30 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#20252B]">
                      <SafeImage src={p.image} alt={p.title_fr} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-[#F28C28]">
                          {lang === 'ar' ? p.category_ar : p.category_fr}
                        </div>
                        <h3 className="font-bold text-sm text-[#20252B]">
                          {lang === 'ar' ? p.title_ar : p.title_fr}
                        </h3>
                        <p className="text-xs text-[#4A525D] mt-1 line-clamp-2">
                          {lang === 'ar' ? p.description_ar : p.description_fr}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-[#AEB5BD]/20">
                        <button
                          type="button"
                          onClick={() => setEditingProject(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#AEB5BD]/40 text-xs cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{t.admin.cms.edit}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#FECACA] text-[#B91C1C] text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.admin.cms.delete}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-[#000000]/60 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-lg border border-[#AEB5BD]/40 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#AEB5BD]/25 pb-3">
              <h2 className="font-display text-lg font-bold text-[#20252B]">
                {t.admin.bookingsTable.modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-[#5E6773] hover:text-[#20252B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.ref}</dt>
                <dd className="font-mono-tabular font-semibold" dir="ltr">
                  {selectedBooking.booking_reference}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.status}</dt>
                <dd className="font-semibold">{t.admin.statuses[selectedBooking.status]}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.customer}</dt>
                <dd className="font-semibold">{selectedBooking.customer_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.phone}</dt>
                <dd className="font-mono-tabular" dir="ltr">
                  {selectedBooking.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.emailLabel}</dt>
                <dd dir="ltr">{selectedBooking.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.dateTime}</dt>
                <dd className="font-mono-tabular" dir="ltr">
                  {selectedBooking.appointment_date} {selectedBooking.appointment_time}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.service}</dt>
                <dd className="font-semibold">{selectedBooking.service}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.equipmentLabel}</dt>
                <dd>{selectedBooking.equipment || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.location}</dt>
                <dd>{selectedBooking.project_location}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#5E6773]">{t.admin.bookingsTable.messageLabel}</dt>
                <dd className="p-3 rounded bg-[#F6F7F9] text-[#20252B] mt-1 whitespace-pre-wrap">
                  {selectedBooking.message || '—'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#AEB5BD]/25">
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#15803D] text-[#FFFFFF] text-xs font-semibold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.admin.bookingsTable.confirm}</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')}
                className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#B91C1C] text-[#FFFFFF] text-xs font-semibold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.admin.bookingsTable.reject}</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                className="px-3 py-2 rounded bg-[#1D4ED8] text-[#FFFFFF] text-xs font-semibold cursor-pointer"
              >
                {t.admin.bookingsTable.complete}
              </button>
              <a
                href={buildWhatsAppLink(
                  lang === 'ar'
                    ? `السلام عليكم ${selectedBooking.customer_name}، بخصوص طلب الموعد ${selectedBooking.booking_reference}`
                    : `Bonjour ${selectedBooking.customer_name}, concernant votre rendez-vous ${selectedBooking.booking_reference}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#25D366] text-[#FFFFFF] text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t.admin.bookingsTable.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
