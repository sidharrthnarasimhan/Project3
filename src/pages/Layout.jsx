
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { getData } from "@/api/mockData";
import {
  LayoutDashboard,
  Vote,
  CheckSquare,
  Megaphone,
  Users,
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  Zap,
  Calendar,
  DollarSign,
  Rocket,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Avatar from "@/components/common/Avatar";
import ThemeToggle from "@/components/common/ThemeToggle";
import GlobalSearch from "@/components/common/GlobalSearch";
import ClientSwitcher from "@/components/common/ClientSwitcher";

const navItems = [
  { name: "Home", path: "Home", icon: LayoutDashboard },
  { name: "Product", path: "Product", icon: Rocket },
  { name: "Spaces", path: "Spaces", icon: BookOpen },
  { name: "Calendar", path: "Calendar", icon: Calendar },
  { name: "Decisions", path: "Decisions", icon: Vote },
  { name: "Tasks", path: "Tasks", icon: CheckSquare },
  { name: "Announcements", path: "Announcements", icon: Megaphone },
  { name: "People", path: "People", icon: Users },
  { name: "Billing", path: "Billing", icon: DollarSign },
  { name: "Settings", path: "Settings", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState({ name: 'Startup OS', logo: null });
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});

    // Load company settings from localStorage
    const loadCompanySettings = () => {
      try {
        const data = getData();
        if (data.companySettings) {
          setCompanySettings(data.companySettings);
        }
      } catch (error) {
        console.error('Failed to load company settings:', error);
      }
    };

    loadCompanySettings();

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = () => {
      loadCompanySettings();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from Settings page
    window.addEventListener('companySettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companySettingsUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/60 dark:bg-zinc-800/80 border-b border-white/20 dark:border-zinc-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo and User Menu */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                {companySettings.logo ? (
                  <img
                    src={companySettings.logo}
                    alt={companySettings.name}
                    className="w-10 h-10 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                  {companySettings.name}
                </span>
              </Link>
            </div>

            {/* Center: Global Search */}
            <GlobalSearch />

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="w-5 h-5 text-zinc-500" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-2xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all duration-200 hover:shadow-md">
                    <Avatar
                      name={currentUser?.full_name}
                      email={currentUser?.email}
                      size="sm"
                    />
                    <ChevronDown className="w-4 h-4 text-zinc-500 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90 border-white/20 dark:border-zinc-800/30 shadow-2xl">
                  <div className="px-3 py-3 mb-2">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      {currentUser?.full_name || "User"}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mb-2">
                      {currentUser?.email}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300">
                      {currentUser?.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-rose-600 dark:text-rose-400 cursor-pointer rounded-lg font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Bottom Row: Desktop Navigation */}
          <div className="hidden md:block border-t border-white/20 dark:border-zinc-700/50">
            <nav className="flex items-center justify-center gap-1 py-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.path;
                const hasAccess = base44.auth.hasPageAccess(item.path);

                // Don't show nav items user doesn't have access to
                if (!hasAccess) return null;

                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:text-purple-600 dark:hover:text-purple-400"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 dark:border-zinc-700/50 backdrop-blur-2xl bg-white/90 dark:bg-zinc-800/95">
            <nav className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.path;
                const hasAccess = base44.auth.hasPageAccess(item.path);

                // Don't show nav items user doesn't have access to
                if (!hasAccess) return null;

                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/60 hover:text-purple-600 dark:hover:text-purple-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Client Switcher (dev only) */}
      <ClientSwitcher />
    </div>
  );
}
