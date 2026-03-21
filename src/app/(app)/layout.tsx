// ... existing imports and navItems ...

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();
  const { t, locale, setLocale } = useI18n();

  // ... existing useEffect ...

  // ... existing functions ...

  // Loading or redirecting state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white animate-pulse" aria-hidden="true" />
          </div>
          <span className="text-sm text-gray-500">
            {loading ? t("common.loading") : t("common.redirecting")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-200 hidden lg:flex`}
        role="navigation"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-gray-900 text-lg">Pulse</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            aria-label={sidebarOpen ? "Réduire la barre latérale" : "Étendre la barre latérale"}
            type="button"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1" role="list">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={!sidebarOpen ? label : undefined}
                aria-current={isActive ? "page" : undefined}
                role="listitem"
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-600" : ""}`} aria-hidden="true" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ... existing language switcher and user footer with same aria improvements ... */}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex lg:hidden z-50" role="navigation" aria-label="Navigation mobile">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs ${
                isActive ? "text-primary-600" : "text-gray-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0" role="main">{children}</main>
    </div>
  );
}