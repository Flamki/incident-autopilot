import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertCircle, 
  Clock, 
  Database, 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Bell, 
  Search, 
  ChevronDown,
  ExternalLink,
  Command as CommandIcon
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/Badge";
import { LucideIcon } from "lucide-react";
import { CommandMenu } from "@/src/components/CommandMenu";
import { NotificationDropdown } from "@/src/components/NotificationDropdown";
import { UserMenu } from "@/src/components/UserMenu";
import { Logo } from "@/src/components/Logo";
import { useState, useEffect } from "react";
import { getCurrentLocalUser } from "@/src/lib/localAuth";

interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: { count: number; color: string };
  external?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard" },
  { icon: AlertCircle, label: "Incidents", route: "/incidents", badge: { count: 3, color: "critical" } },
  { icon: Clock, label: "Pending Approval", route: "/pending", badge: { count: 1, color: "warning" } },
  { icon: Database, label: "Repositories", route: "/repos" },
  { icon: BarChart3, label: "Analytics", route: "/analytics" },
  { icon: Users, label: "Team", route: "/team" },
  { icon: Settings, label: "Settings", route: "/settings" },
  { icon: FileText, label: "Docs", route: "/docs" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMac, setIsMac] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const currentUser = getCurrentLocalUser();
  const displayName = currentUser?.fullName || "John Doe";
  const displayEmail = currentUser?.email || "sre_eng_01@autopilot.local";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("") || "JD";

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const openSearch = () => {
    // Dispatch a custom event to open the command menu
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="flex h-screen w-full bg-bg-base text-ink overflow-hidden bg-grid-dots relative">
      <CommandMenu />
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border bg-bg-card flex flex-col shrink-0 z-10 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-[72px]" : "w-[240px]"
      )}>
        <div className={cn(
          "p-sp-6 flex items-center gap-sp-2 border-b border-border",
          isSidebarCollapsed && "justify-center px-0"
        )}>
          <Logo 
            size="sm" 
            hideText={isSidebarCollapsed} 
            hideSubtitle 
          />
        </div>

        <nav className={cn(
          "flex-1 px-sp-3 py-sp-4 flex flex-col gap-sp-1 overflow-y-auto",
          isSidebarCollapsed && "px-sp-2 items-center"
        )}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.route}
              className={cn(
                "flex items-center gap-sp-3 px-sp-3 py-sp-2 transition-all group relative w-full",
                location.pathname === item.route 
                  ? "bg-ink text-white" 
                  : "text-text-secondary hover:bg-bg-hover hover:text-ink",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", location.pathname === item.route ? "text-accent-neon" : "text-text-muted group-hover:text-text-secondary")} />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 text-[11px] font-mono font-bold uppercase tracking-widest truncate">{item.label}</span>
                  {item.badge && (
                    <div className={cn(
                      "px-1.5 py-0.5 text-[9px] font-mono font-bold border shrink-0",
                      location.pathname === item.route ? "border-accent-neon text-accent-neon" : "border-border text-text-muted"
                    )}>
                      {item.badge.count}
                    </div>
                  )}
                  {item.external && <ExternalLink className="h-3 w-3 text-text-muted shrink-0" />}
                </>
              )}
              {isSidebarCollapsed && item.badge && (
                <div className="absolute top-1 right-1 h-2 w-2 bg-critical border border-border rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-sp-4 border-t border-border mt-auto bg-bg-surface relative">
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              "flex items-center gap-sp-3 p-sp-2 border-blueprint hover:bg-bg-hover cursor-pointer transition-all bg-bg-card",
              isSidebarCollapsed && "justify-center px-0"
            )}
          >
            <div className="h-8 w-8 border-blueprint bg-ink flex items-center justify-center text-[10px] font-mono font-bold text-white relative shrink-0">
              {initials}
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-resolved border border-border" />
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono font-bold uppercase truncate">{displayName}</p>
                  <p className="text-[9px] font-mono text-text-muted uppercase truncate">{displayEmail}</p>
                </div>
                <ChevronDown className={cn("h-3 w-3 text-text-muted transition-transform", isUserMenuOpen && "rotate-180")} />
              </>
            )}
          </div>
          <UserMenu 
            isOpen={isUserMenuOpen} 
            onClose={() => setIsUserMenuOpen(false)} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            displayName={displayName}
            email={displayEmail}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-bg-card flex items-center justify-between px-sp-4 shrink-0">
          <div className="flex items-center gap-sp-4 flex-1 max-w-xl">
            <button 
              onClick={openSearch}
              className="relative w-full group flex items-center text-left"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-hover:text-ink transition-colors" />
              <div className="w-full bg-bg-surface border border-border h-10 pl-10 pr-4 text-[11px] font-mono font-bold uppercase flex items-center text-text-muted group-hover:bg-white transition-all">
                SEARCH_INCIDENTS_COMMITS_REPOS...
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted border border-border px-1">
                {isMac ? 'CMD+K' : 'CTRL+K'}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-sp-4 relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={cn(
                "relative p-2 text-text-secondary hover:text-ink transition-all border border-transparent hover:border-border",
                isNotificationsOpen && "bg-bg-hover text-ink border-border"
              )}
            >
              <Bell className="h-4 w-4" />
              <div className="absolute top-1 right-1 h-2 w-2 bg-critical border border-border" />
            </button>
            <NotificationDropdown 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
            />
            <div className="h-6 w-px bg-border mx-2" />
            <div className="flex items-center gap-sp-2">
              <div className="flex items-center gap-1.5 px-2 py-1 border border-resolved text-resolved bg-resolved/5">
                <div className="h-1.5 w-1.5 rounded-full bg-resolved animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Live_NOC_01</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
