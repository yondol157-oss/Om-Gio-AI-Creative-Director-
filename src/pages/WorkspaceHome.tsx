import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Video,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Grid,
  ArrowRight,
  FolderOpen,
  Layers,
  Sparkles,
  Crown,
  Clock,
  Plus,
  Compass,
} from 'lucide-react';
import { Project, Generation } from '../types';

interface WorkspaceHomeProps {
  onSelectModule: (moduleId: string) => void;
}

export const WorkspaceHome: React.FC<WorkspaceHomeProps> = ({ onSelectModule }) => {
  const { user, isPro, setShowProUpgradeModal, setActiveProjectId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentGens, setRecentGens] = useState<Generation[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalAssets: 0,
    totalGenerations: 0,
  });

  useEffect(() => {
    api.getProjects()
      .then(res => {
        setProjects(res.projects || []);
        setStats(s => ({ ...s, totalProjects: res.projects?.length || 0 }));
      })
      .catch(() => {});

    api.getAssets()
      .then(res => setStats(s => ({ ...s, totalAssets: res.assets?.length || 0 })))
      .catch(() => {});

    api.getGenerations()
      .then(res => {
        setRecentGens((res.generations || []).slice(0, 4));
        setStats(s => ({ ...s, totalGenerations: res.generations?.length || 0 }));
      })
      .catch(() => {});
  }, []);

  const modules = [
    {
      id: 'affiliate-prompt',
      title: 'Affiliate Prompt',
      tag: 'GENERATOR',
      icon: Video,
      description: 'Naskah video promosi viral dengan hook 3 detik, sudut kamera presisi, dan CTA keranjang kuning.',
    },
    {
      id: 'general-prompt',
      title: 'General Prompt',
      tag: 'STUDIO',
      icon: FileText,
      description: 'Prompt sinematik 10 pilar untuk video iklan, cinematic commercial, dan short film AI.',
    },
    {
      id: 'image-gen',
      title: 'Image Gen',
      tag: 'GENERATOR',
      icon: ImageIcon,
      description: 'First frame pembuka, variasi gambar, dan visual photorealistic 8K dengan referensi produk.',
    },
    {
      id: 'ai-influencer',
      title: 'AI Influencer',
      tag: 'CREATOR',
      icon: UserCheck,
      description: 'Rancang persona influencer virtual dengan DNA visual wajah konsisten di setiap frame.',
    },
    {
      id: 'storyboard',
      title: 'Storyboard',
      tag: 'GENERATOR',
      icon: Grid,
      description: 'Auto-grid storyboard multi-shot lengkap dengan aksi karakter, dialog, pencahayaan, dan durasi.',
    },
  ];

  const handleModuleClick = (id: string) => {
    if (!isPro) {
      setShowProUpgradeModal(true);
      return;
    }
    onSelectModule(id);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      {/* Workspace Header Title matching reference 22222222.JPG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Workspace Home
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              PILIH MODUL
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Konfigurasi parameter dan hasilkan karya dengan AI.
          </p>
        </div>

        {/* Membership status card */}
        <div className="flex items-center gap-3 bg-[#121212] border border-white/[0.08] px-4 py-2 rounded-xl">
          <Crown className={`w-4 h-4 ${isPro ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">Status Membership</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{user?.membership_type === 'PRO_LIFETIME' ? 'PRO LIFETIME' : 'FREE TIER'}</span>
              {!isPro && (
                <button
                  onClick={() => setShowProUpgradeModal(true)}
                  className="text-[10px] text-[#D4AF37] hover:underline ml-1"
                >
                  Upgrade →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panduan Penggunaan Web Banner (Matches uploaded guide) */}
      <div
        onClick={() => onSelectModule('panduan')}
        className="rounded-2xl bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#121212] border border-[#D4AF37]/30 p-4 sm:p-5 cursor-pointer hover:border-[#D4AF37] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(212,175,55,0.06)]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_12px_rgba(212,175,55,0.4)] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide font-['Space_Grotesk']">
                PANDUAN PENGGUNAAN WEB
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold uppercase tracking-wider">
                10 LANGKAH SISTEMATIS
              </span>
            </div>
            <div className="text-[11px] text-white/70 mt-0.5">
              Dari Ide → Asset → Prompt → Google Flow → Video. Ikuti alur kerja profesional agar hasil video AI Anda maksimal.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform shrink-0">
          <span>Buka Panduan Lengkap</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Hero Welcome Box matching screenshot 22222222.JPG */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#161616] to-[#0D0D0D] border border-white/[0.08] p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide font-['Space_Grotesk'] leading-tight">
            OM GIO AI CREATIVE DIRECTOR
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
            Creative Production Studio bertenaga kecerdasan buatan terpadu. Rancang naskah promosi, frame pembuka, model influencer, hingga storyboard lengkap di satu tempat.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] tracking-wider uppercase">
            <span>→ SILAKAN PILIH MODUL AI UNTUK MEMULAI</span>
          </div>

          <p className="text-[11px] text-white/40 mt-1">
            Gunakan panel navigasi cepat di bawah atau sidebar di sisi kiri untuk mengakses seluruh alat produksi kreatif.
          </p>
        </div>

        {/* 5 Quick Modules Grid (Matching reference screenshot) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => handleModuleClick(mod.id)}
                className="group p-4 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border border-white/[0.08] hover:border-[#D4AF37]/50 cursor-pointer transition-all duration-200 text-left flex flex-col justify-between hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] active:scale-98"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-[#D4AF37]/15 border border-white/[0.06] group-hover:border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-white/40 group-hover:text-[#D4AF37]">
                      {mod.tag}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-[11px] text-white/50 mt-1.5 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Buka Modul</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#D4AF37]">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-['Space_Grotesk']">{stats.totalProjects}</div>
            <div className="text-xs text-white/50">Active Projects</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#D4AF37]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-['Space_Grotesk']">{stats.totalAssets}</div>
            <div className="text-xs text-white/50">Production Assets</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-['Space_Grotesk']">{stats.totalGenerations}</div>
            <div className="text-xs text-white/50">AI Content Generations</div>
          </div>
        </div>
      </div>

      {/* Recent Projects & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Project Terbaru</span>
            </h3>
            <button
              onClick={() => onSelectModule('projects')}
              className="text-xs text-[#D4AF37] hover:underline"
            >
              Lihat Semua Project →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map(proj => (
              <div
                key={proj.id}
                onClick={() => {
                  setActiveProjectId(proj.id);
                  onSelectModule('projects');
                }}
                className="group p-4 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/60 font-medium">
                      {proj.status}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {new Date(proj.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {proj.name}
                  </h4>
                  <p className="text-[11px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'Tidak ada deskripsi'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] text-white/40 group-hover:text-[#D4AF37] flex items-center justify-between">
                  <span>Buka Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Generations (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Aktivitas Studio</span>
            </h3>
            <button
              onClick={() => onSelectModule('history')}
              className="text-xs text-[#D4AF37] hover:underline"
            >
              Riwayat Lengkap →
            </button>
          </div>

          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-4 space-y-3">
            {recentGens.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-6">Belum ada aktivitas produksi.</p>
            ) : (
              recentGens.map(gen => (
                <div key={gen.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase">
                      {gen.module.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-white/40">
                      {new Date(gen.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
                    {gen.prompt_input?.product_name || gen.prompt_input?.video_context || gen.prompt_input?.concept || 'AI Generation'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
