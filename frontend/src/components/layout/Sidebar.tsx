import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  BrainCircuit, LayoutDashboard, FileText, Mic2, Code2,
  BarChart3, User, Settings, LogOut, X,
  Bell, Shield
} from 'lucide-react';
import { cn } from '@lib/utils';
import { useAuthStore } from '@store/authStore';
import { authApi } from '@features/auth/api/authApi';
import toast from 'react-hot-toast';
import { getInitials } from '@lib/utils';

const candidateNav = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/dashboard' },
  { icon: FileText,        label: 'Resume',           path: '/resume' },
  { icon: Mic2,            label: 'Interviews',       path: '/interview/setup' },
  { icon: Code2,           label: 'Coding',           path: '/coding' },
  { icon: BarChart3,       label: 'Analytics',        path: '/analytics' },
];

const bottomNav = [
  { icon: Bell,     label: 'Notifications', path: '/notifications' },
  { icon: User,     label: 'Profile',       path: '/profile' },
  { icon: Settings, label: 'Settings',      path: '/settings' },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location   = useLocation();
  const { user, refreshToken, logout } = useAuthStore();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: () => authApi.logout(refreshToken ?? ''),
    onSettled: () => {
      logout();
      toast.success('Signed out');
    },
  });

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = user?.role === 'ADMIN'
    ? [{ icon: Shield, label: 'Admin Dashboard', path: '/admin' }]
    : candidateNav;

  return (
    <div className="flex flex-col h-full bg-dark-900 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-primary-400" size={22} />
          <span className="font-bold gradient-text">AI Interview</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={onClose}
            className={cn('nav-item', isActive(path) && 'active')}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-white/[0.06] py-3 px-3 space-y-1">
        {bottomNav.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={onClose}
            className={cn('nav-item', isActive(path) && 'active')}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* User + Logout */}
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user?.fullName ?? 'U')
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logoutMutation()}
              className="text-slate-600 hover:text-danger-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
