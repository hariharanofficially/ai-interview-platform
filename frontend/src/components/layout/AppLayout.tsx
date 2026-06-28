import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  Code2,
  LineChart,
  User,
  Settings,
  LogOut,
  Command,
  Search,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { cn } from '@lib/utils';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/resume', icon: <FileText size={20} />, label: 'Resume' },
    { to: '/interview/setup', icon: <BrainCircuit size={20} />, label: 'Mock Interviews' },
    { to: '/coding', icon: <Code2 size={20} />, label: 'Coding Challenges' },
    { to: '/analytics', icon: <LineChart size={20} />, label: 'Analytics' },
  ];

  const bottomNavItems = [
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-surface-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 text-primary-400 font-bold text-xl tracking-tight">
          <BrainCircuit className="text-primary-500" size={24} />
          {isSidebarOpen && <span>ElevateAI</span>}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
              isActive
                ? "bg-primary-500/10 text-primary-400"
                : "text-slate-400 hover:text-foreground hover:bg-surface-hover"
            )}
          >
            <span className={cn("shrink-0", !isSidebarOpen && "mx-auto")}>{item.icon}</span>
            {isSidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 space-y-1 border-t border-surface-border shrink-0">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
              isActive
                ? "bg-primary-500/10 text-primary-400"
                : "text-slate-400 hover:text-foreground hover:bg-surface-hover"
            )}
          >
            <span className={cn("shrink-0", !isSidebarOpen && "mx-auto")}>{item.icon}</span>
            {isSidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
        >
          <span className={cn("shrink-0", !isSidebarOpen && "mx-auto")}><LogOut size={20} /></span>
          {isSidebarOpen && <span>Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block transition-all duration-300 ease-in-out shrink-0",
          isSidebarOpen ? "w-64" : "w-[80px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 h-full bg-surface">
            <button
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md border-b border-surface-border shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <button
              className="hidden md:block text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>

            {/* Command Palette Trigger */}
            <button className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-dark-900 border border-surface-border rounded-md text-sm text-slate-400 hover:text-slate-300 hover:border-slate-700 transition-colors">
              <Search size={16} />
              <span>Search or jump to...</span>
              <kbd className="ml-8 px-1.5 py-0.5 bg-dark-800 rounded text-xs font-mono border border-surface-border text-slate-500 flex items-center gap-1">
                <Command size={12} /> K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full border border-surface" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-glow-primary cursor-pointer border border-surface-border">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
