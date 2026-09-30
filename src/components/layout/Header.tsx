import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Bell,
  Search,
  Sparkles,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Crown,
  ChevronDown,
  FolderOpen,
  X,
  Check,
} from 'lucide-react';
import { Project } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  setActiveTab,
}) => {
  const {
    user,
    isPro,
    isAdmin,
    activeProjectId,
    setActiveProjectId,
    logout,
    setShowProUpgradeModal,
    switchDemoAccount,
  } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(res => setNotifications(res.notifications || []))
        .catch(() => {});

      api.getProjects()
        .then(res => {
          setProjects(res.projects || []);
          if (!activeProjectId && res.projects?.length > 0) {
            setActiveProjectId(res.projects[0].id);
          }
        })
        .catch(() => {});
    }
  }, [user, activeProjectId, setActiveProjectId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    for (const n of notifications.filter(n => !n.is_read)) {
      await api.markNotificationAsRead(n.id).catch(() => {});
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile hamburger & Active project info */}
      <div className="flex items-center gap-4">
        {/* Project Selector */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.08] text-xs font-medium text-[#E5E5E5] transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="max-w-[140px] truncate sm:max-w-[200px]">
                {activeProject ? activeProject.name : 'Pilih Project'}
              </span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>

            {showProjectSelector && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#141414] border border-white/[0.08] shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                  Active Workspace Project
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04]">
                  {projects.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setShowProjectSelector(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="truncate text-[#E5E5E5]">{proj.name}</span>
                      {proj.id === activeProjectId && (
                        <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 px-3 border-t border-white/[0.04]">
                  <button
                    onClick={() => {
                      setActiveTab('projects');
                      setShowProjectSelector(false);
                    }}
                    className="w-full text-center py-1.5 text-xs text-[#D4AF37] hover:underline font-medium"
                  >
                    + Kelola Semua Project
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Global Search shortcut */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.08] text-xs text-white/50 hover:text-white transition-all w-72 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cari project, prompt, atau aset...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-white/40">⌘K</kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher (For easy evaluator testing) */}
        <div className="relative">
          <button
            onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181818] border border-white/[0.08] text-[11px] font-medium text-white/60 hover:text-white hover:border-[#D4AF37]/40 transition-colors"
            title="Beralih peran akun demo"
          >
            <span>Role:</span>
            <span className={`font-semibold ${user?.role === 'ADMIN' ? 'text-[#D4AF37]' : user?.role === 'PRO' ? 'text-amber-300' : 'text-zinc-400'}`}>
              {user?.role || 'GUEST'}
            </span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>

          {showDemoSwitcher && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141414] border border-white/[0.08] shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                Simulasi Peran User (Tester)
              </div>
              <button
                onClick={() => {
                  switchDemoAccount('ADMIN');
                  setShowDemoSwitcher(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <div className="font-semibold text-[#D4AF37] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Om Gio (Admin)
                  </div>
                  <div className="text-[10px] text-white/50">Full Admin & Master Control</div>
                </div>
                {user?.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>

              <button
                onClick={() => {
                  switchDemoAccount('PRO');
                  setShowDemoSwitcher(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <div className="font-semibold text-amber-300 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Budi Santoso (PRO)
                  </div>
                  <div className="text-[10px] text-white/50">PRO LIFETIME Member</div>
                </div>
                {user?.role === 'PRO' && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>

              <button
                onClick={() => {
                  switchDemoAccount('USER');
                  setShowDemoSwitcher(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <div className="font-semibold text-zinc-300 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" /> Siti (Free User)
                  </div>
                  <div className="text-[10px] text-white/50">Belum upgrade Pro</div>
                </div>
                {user?.role === 'USER' && <Check className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Membership Badge / Upgrade button */}
        {isPro ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-[#F4C542]/20 to-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <Crown className="w-3.5 h-3.5" />
            <span>PRO LIFETIME</span>
          </div>
        ) : (
          <button
            onClick={() => setShowProUpgradeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Upgrade Pro</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.08] text-white/70 hover:text-white transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#050505]" />
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#141414] border border-white/[0.08] shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                <span className="text-xs font-semibold text-[#E5E5E5]">Notifikasi ({unreadCount} baru)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#D4AF37] hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-white/40 text-center py-4">Belum ada notifikasi.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        n.is_read ? 'bg-white/[0.02] text-white/60' : 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#E5E5E5]'
                      }`}
                    >
                      <div className="font-semibold text-white/90">{n.title}</div>
                      <div className="text-[11px] mt-0.5 text-white/70 leading-relaxed">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.08] transition-colors"
            >
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#D4AF37]/40"
              />
              <ChevronDown className="w-3.5 h-3.5 text-white/50 pr-1" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#141414] border border-white/[0.08] shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-white/[0.06]">
                  <div className="font-semibold text-sm text-[#E5E5E5] truncate">{user.name}</div>
                  <div className="text-xs text-white/50 truncate">{user.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37]">
                    <Crown className="w-3 h-3" />
                    <span>{user.membership_type === 'PRO_LIFETIME' ? 'PRO LIFETIME' : 'MEMBER GRATIS'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-white/50" />
                    <span>Profil & Membership</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};
