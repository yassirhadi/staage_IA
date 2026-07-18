import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderSearch,
  FolderOpen,
  HardDrive,
  ShieldAlert,
  Lightbulb,
  FileBarChart,
  BookOpen,
  ScrollText,
  Bot,
  History,
  Bell,
  Gauge,
  Lock,
  Users,
  UserCog,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { rssiApi } from '@/api/services';

const rssiNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventaire des actifs', icon: FolderSearch },
  { to: '/documents', label: 'Analyse documentaire', icon: FileBarChart },
  { to: '/classification', label: 'Classification documentaire', icon: BookOpen },
  { to: '/sensitive-data', label: 'Données sensibles', icon: Lock },
  { to: '/risks', label: 'Analyse des risques', icon: ShieldAlert },
  { to: '/reports', label: 'Rapports', icon: FileBarChart },
  { to: '/copilot', label: 'Assistant IA', icon: Bot },
  { to: '/history', label: 'Historique des analyses', icon: History },
  { to: '/chat-history', label: 'Historique IA', icon: History },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/referentials', label: 'Référentiels', icon: BookOpen },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventaire des actifs',
  '/documents': 'Analyse documentaire',
  '/classification': 'Classification documentaire',
  '/sensitive-data': 'Données sensibles',
  '/risks': 'Analyse des risques',
  '/reports': 'Rapports',
  '/copilot': 'Assistant IA',
  '/history': 'Historique des analyses',
  '/chat-history': 'Historique IA',
  '/notifications': 'Notifications',
  '/referentials': 'Référentiels',
  '/admin/users': 'Gestion des utilisateurs',
  '/admin/roles': 'Gestion des rôles',
  '/admin/permissions': 'Gestion des permissions',
  '/admin/settings': 'Paramètres',
  '/admin/backups': 'Sauvegardes',
  '/profile': 'Mon Profil',
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 shadow-sm">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-sm font-semibold tracking-tight text-gradient">
              {isAdmin ? 'Copilot Admin' : 'Copilot RSSI'}
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isAdmin ? 'Centre d\'administration' : 'Centre de sécurité'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {rssiNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/5'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}

        {/* Admin Menu */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-sidebar-border space-y-0.5">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </p>
            <NavLink
              to="/admin/users"
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )
              }
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Utilisateurs</span>
            </NavLink>
            <NavLink
              to="/admin/roles"
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )
              }
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Rôles</span>
            </NavLink>
            <NavLink
              to="/admin/permissions"
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )
              }
            >
              <Lock className="h-4 w-4 shrink-0" />
              <span>Permissions</span>
            </NavLink>
            <NavLink
              to="/admin/settings"
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )
              }
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Paramètres</span>
            </NavLink>
            <NavLink
              to="/admin/backups"
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )
              }
            >
              <HardDrive className="h-4 w-4 shrink-0" />
              <span>Sauvegardes</span>
            </NavLink>
          </div>
        )}

        <div className="pt-4 border-t border-sidebar-border space-y-0.5">
          <NavLink
            to="/profile"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
              )
            }
          >
            <UserCog className="h-4 w-4 shrink-0" />
            <span>Mon Profil</span>
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/50 border border-sidebar-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-xs font-bold text-primary">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <Badge variant="secondary" className="text-[10px] mt-0.5">{user?.role}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Copilot RSSI';

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await rssiApi.getNotifications();
        const notifications = Array.isArray(res.data.data) ? res.data.data : [];
        const unread = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-sidebar border-r border-sidebar-border lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-2 z-10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <SidebarNav onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="flex items-center justify-between gap-4 px-4 lg:px-6 h-14">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Copilot RSSI</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-foreground">{pageTitle}</span>
                </div>
                <h2 className="text-sm font-semibold truncate hidden sm:block">{pageTitle}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Rechercher...</span>
                <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">
                  Ctrl+K
                </kbd>
              </div>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
