import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GoogleLoginModal } from './components/common/GoogleLoginModal';
import { ProUpgradeModal } from './components/common/ProUpgradeModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { WorkspaceHome } from './pages/WorkspaceHome';
import { AffiliatePromptPage } from './pages/AffiliatePromptPage';
import { GeneralPromptPage } from './pages/GeneralPromptPage';
import { ImageGenPage } from './pages/ImageGenPage';
import { AIInfluencerPage } from './pages/AIInfluencerPage';
import { StoryboardPage } from './pages/StoryboardPage';
import { PemilikCanvasPage } from './pages/PemilikCanvasPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AssetsPage } from './pages/AssetsPage';
import { PromptLibraryPage } from './pages/PromptLibraryPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfileMembershipPage } from './pages/ProfileMembershipPage';
import { AdminPanel } from './pages/AdminPanel';
import { PanduanPenggunaanPage } from './pages/PanduanPenggunaanPage';

const AppContent: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [forceLanding, setForceLanding] = useState(false);

  // Global search keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-black font-extrabold text-xl animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-4">
          OG
        </div>
        <div className="text-sm font-bold text-white tracking-widest uppercase font-['Space_Grotesk']">
          OM GIO AI CREATIVE DIRECTOR
        </div>
        <div className="text-xs text-white/40 mt-1 font-mono">Memuat Workspace Studio...</div>
      </div>
    );
  }

  // If user is not logged in, or explicitly chose to view public landing page
  if (!user || forceLanding) {
    return (
      <>
        <LandingPage onEnterStudio={() => setForceLanding(false)} />
        <GoogleLoginModal />
        <ProUpgradeModal />
      </>
    );
  }

  // Main Studio Application Layout
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WorkspaceHome onSelectModule={setActiveTab} />;
      case 'panduan':
        return <PanduanPenggunaanPage onNavigate={setActiveTab} />;
      case 'affiliate-prompt':
        return <AffiliatePromptPage />;
      case 'general-prompt':
        return <GeneralPromptPage />;
      case 'image-gen':
        return <ImageGenPage />;
      case 'ai-influencer':
        return <AIInfluencerPage />;
      case 'storyboard':
        return <StoryboardPage />;
      case 'pemilik-canvas':
        return isAdmin ? <PemilikCanvasPage onNavigate={setActiveTab} /> : <WorkspaceHome onSelectModule={setActiveTab} />;
      case 'projects':
        return <ProjectsPage />;
      case 'assets':
        return <AssetsPage />;
      case 'prompt-library':
        return <PromptLibraryPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfileMembershipPage />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <WorkspaceHome onSelectModule={setActiveTab} />;
      default:
        return <WorkspaceHome onSelectModule={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Workspace View */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Modals */}
      <GoogleLoginModal />
      <ProUpgradeModal />
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={tab => setActiveTab(tab)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
