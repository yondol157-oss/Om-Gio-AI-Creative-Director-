import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Video,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Grid,
  FolderOpen,
  Layers,
  Bookmark,
  History,
  User,
  Settings as SettingsIcon,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, isAdmin, isPro, setShowProUpgradeModal } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Workspace Home',
      sublabel: 'PILIH MODUL',
      icon: LayoutDashboard,
    },
    {
      id: 'panduan',
      label: 'Panduan Web',
      sublabel: 'WORKFLOW GUIDE',
      icon: Compass,
    },
    {
      id: 'affiliate-prompt',
      label: 'Affiliate Prompt',
      sublabel: 'GENERATOR',
      icon: Video,
      proOnly: true,
    },
    {
      id: 'general-prompt',
      label: 'General Prompt',
      sublabel: 'STUDIO',
      icon: FileText,
      proOnly: true,
    },
    {
      id: 'image-gen',
      label: 'Image Gen',
      sublabel: 'GENERATOR',
      icon: ImageIcon,
      proOnly: true,
    },
    {
      id: 'ai-influencer',
      label: 'AI Influencer',
      sublabel: 'CREATOR',
      icon: UserCheck,
      proOnly: true,
    },
    {
      id: 'storyboard',
      label: 'Storyboard',
      sublabel: 'GENERATOR',
      icon: Grid,
      proOnly: true,
    },
    {
      id: 'projects',
      label: 'Projects',
      sublabel: 'WORKSPACE',
      icon: FolderOpen,
    },
    {
      id: 'assets',
      label: 'My Assets',
      sublabel: 'LIBRARY',
      icon: Layers,
    },
    {
      id: 'prompt-library',
      label: 'Prompt Library',
      sublabel: 'TEMPLATES',
      icon: Bookmark,
    },
    {
      id: 'history',
      label: 'History',
      sublabel: 'ACTIVITY',
      icon: History,
    },
  ];

  const handleNavClick = (id: string, proOnly?: boolean) => {
    if (proOnly && !isPro) {
      setShowProUpgradeModal(true);
      return;
    }
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080808] border-r border-white/[0.08] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_12px_rgba(212,175,55,0.3)] shrink-0">
            OG
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white font-['Space_Grotesk'] leading-tight">
                OM GIO AI
              </span>
              <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">
                Creative Director
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
          title={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.proOnly)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 text-white border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-white/40 group-hover:text-white/80'
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium truncate">{item.label}</span>
                    <span className="text-[9px] tracking-wider text-white/30 uppercase font-semibold">
                      {item.sublabel}
                    </span>
                  </div>

                  {item.proOnly && !isPro && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border border-[#D4AF37]/20">
                      PRO
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="pt-3 pb-2 px-3">
          <div className="h-[1px] bg-white/[0.06]" />
          {!isCollapsed && (
            <div className="text-[9px] uppercase tracking-wider text-white/30 font-semibold mt-3">
              Account & Control
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          onClick={() => handleNavClick('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 text-white border border-[#D4AF37]/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <User className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? 'text-[#D4AF37]' : 'text-white/40'}`} />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate">Profile & Membership</span>
              <span className="text-[9px] tracking-wider text-white/30 uppercase font-semibold">
                AKUN SAYA
              </span>
            </div>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 text-white border border-[#D4AF37]/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <SettingsIcon className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-[#D4AF37]' : 'text-white/40'}`} />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate">Settings & Engine</span>
              <span className="text-[9px] tracking-wider text-white/30 uppercase font-semibold">
                PREFERENSI
              </span>
            </div>
          )}
        </button>

        {/* Master Owner Controls (Strictly shown only for Admin) */}
        {isAdmin && (
          <>
            <button
              onClick={() => handleNavClick('pemilik-canvas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                activeTab === 'pemilik-canvas'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-white border border-amber-500/40'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#D4AF37]" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#D4AF37] truncate">Pemilik Canvas</span>
                  <span className="text-[9px] tracking-wider text-[#D4AF37]/60 uppercase font-semibold">
                    OWNER DASHBOARD
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-white border border-amber-500/40'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#D4AF37]" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#D4AF37] truncate">Admin Control Panel</span>
                  <span className="text-[9px] tracking-wider text-[#D4AF37]/60 uppercase font-semibold">
                    MASTER OWNER
                  </span>
                </div>
              )}
            </button>
          </>
        )}
      </div>

      {/* Footer Pro Banner (if not Pro) */}
      {!isCollapsed && !isPro && (
        <div className="p-3 border-t border-white/[0.08] m-2 rounded-xl bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-[#D4AF37]/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Akses Pro Lifetime</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-2.5">
            Buka seluruh AI generator, image creation, influencer & storyboard tanpa batasan.
          </p>
          <button
            onClick={() => setShowProUpgradeModal(true)}
            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black text-xs font-bold transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)]"
          >
            Beli Pro Lifetime
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
