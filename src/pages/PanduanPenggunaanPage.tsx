import React, { useState } from 'react';
import {
  Compass,
  LayoutDashboard,
  FolderOpen,
  Image as ImageIcon,
  UserCheck,
  Grid,
  FileText,
  Copy,
  ExternalLink,
  Sparkles,
  Upload,
  Film,
  Zap,
  Lightbulb,
  CheckCircle2,
  Check,
  Play,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PanduanPenggunaanPageProps {
  onNavigate?: (tabId: string) => void;
}

export const PanduanPenggunaanPage: React.FC<PanduanPenggunaanPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopySample = () => {
    const samplePrompt = `High-end cinematic commercial video shot in 8K resolution, featuring Indonesian female creator with glowing radiant skin holding amber luxury skincare bottle. Soft morning golden hour lighting, macro detail of liquid dropper, photorealistic textures, hyper-detailed product labels, fluid 24fps motion blur, color graded in warm cinematic tones.`;
    navigator.clipboard.writeText(samplePrompt);
    setCopiedPrompt(true);
    showToast('Master Video Generation Prompt berhasil disalin!', 'SUCCESS');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleNav = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in select-none">
      {/* ========================================================
          HEADER HERO BANNER (Matches Reference Image Exact Layout)
          ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C0C0C] via-[#111111] to-[#0A0A0A] border border-[#D4AF37]/30 p-5 sm:p-7 shadow-[0_0_40px_rgba(212,175,55,0.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Brand & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-black font-extrabold text-base shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0">
                OG
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-widest font-['Space_Grotesk'] leading-none">
                  OM GIO AI
                </h2>
                <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">
                  CREATIVE DIRECTOR
                </span>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide font-['Space_Grotesk']">
                  PANDUAN <span className="text-[#D4AF37]">PENGGUNAAN WEB</span>
                </h1>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/90 mt-1">
                <span>Dari Ide</span>
                <span className="text-[#D4AF37]">→</span>
                <span>Asset</span>
                <span className="text-[#D4AF37]">→</span>
                <span>Prompt</span>
                <span className="text-[#D4AF37]">→</span>
                <span>Google Flow</span>
                <span className="text-[#D4AF37]">→</span>
                <span>Video</span>
              </div>

              <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
                Ikuti langkah-langkah berikut untuk membuat video AI berkualitas tinggi dengan mudah dan sistematis.
              </p>
            </div>
          </div>

          {/* Right Action Button & Slogan */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Google Flow quick launcher */}
            <a
              href="https://flow.google"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border border-white/[0.1] hover:border-[#D4AF37]/50 transition-all group shadow-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#111] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Google Flow</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-white/50">Generate Video with AI</div>
              </div>
            </a>

            {/* Slogan (Italic Gold) */}
            <div className="hidden sm:block text-right border-l border-white/[0.08] pl-5">
              <div className="text-xs italic text-[#D4AF37] font-semibold leading-tight">
                Buat Konten
              </div>
              <div className="text-xs italic text-[#D4AF37] font-semibold leading-tight">
                Lebih Cepat,
              </div>
              <div className="text-xs italic text-[#D4AF37] font-semibold leading-tight">
                Lebih Kreatif,
              </div>
              <div className="text-xs italic text-[#D4AF37] font-semibold leading-tight">
                Lebih Profesional.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          10 STEPS GRID (2 ROWS x 5 COLUMNS)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* STEP 1: LOGIN & MASUK DASHBOARD */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                1
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                LOGIN & MASUK DASHBOARD
              </span>
              <LayoutDashboard className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Akses web OM GIO AI Creative Director melalui browser. Login menggunakan akun Anda. Setelah berhasil, Anda akan masuk ke halaman <strong className="text-white">Workspace Home</strong>.
            </p>

            {/* Visual Mockup */}
            <div
              onClick={() => handleNav('dashboard')}
              className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] cursor-pointer hover:border-[#D4AF37]/30 transition-all space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#D4AF37] text-black text-[9px] font-bold flex items-center justify-center">
                  OG
                </div>
                <span className="text-[9px] font-bold text-white">OM GIO AI</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-white/5 space-y-1">
                <div className="text-[10px] font-bold text-white">Workspace Home</div>
                <div className="text-[8px] text-white/40">Konfigurasi parameter & hasilkan karya</div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-white/10" />
                <div className="h-1.5 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNav('dashboard')}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Buka Workspace Home →
          </button>
        </div>

        {/* STEP 2: BUAT / PILIH PROJECT */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                2
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                BUAT / PILIH PROJECT
              </span>
              <FolderOpen className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Klik "Pilih Project" di bagian atas. Buat project baru atau pilih project yang sudah ada. Gunakan satu project untuk satu campaign atau pekerjaan.
            </p>

            {/* Visual Mockup */}
            <div
              onClick={() => handleNav('projects')}
              className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] cursor-pointer hover:border-[#D4AF37]/30 transition-all space-y-2"
            >
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-white/10 text-[9px] text-white/70">
                <FolderOpen className="w-3 h-3 text-[#D4AF37]" />
                <span className="truncate">Pilih Project ▾</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-[#D4AF37]/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9.5px] font-bold text-white truncate">Video Promo Skincare</span>
              </div>
              <div className="text-[8px] text-white/40">1 Campaign = 1 Project Aktif</div>
            </div>
          </div>

          <button
            onClick={() => handleNav('projects')}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Kelola Projects →
          </button>
        </div>

        {/* STEP 3: SIAPKAN ASSET */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                3
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                SIAPKAN ASSET
              </span>
              <ImageIcon className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Unggah asset yang dibutuhkan seperti creator (AI Influencer), product, outfit, lokasi, dan referensi lainnya. Pastikan gambar jelas dan berkualitas.
            </p>

            {/* Visual Mockup: creator.png & product.jpg */}
            <div
              onClick={() => handleNav('assets')}
              className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] cursor-pointer hover:border-[#D4AF37]/30 transition-all space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-black overflow-hidden border border-white/10 group-hover:border-[#D4AF37]/40 transition-colors">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                    alt="creator.png"
                    className="w-full h-16 object-cover"
                  />
                  <div className="p-1 bg-[#0A0A0A] text-center">
                    <span className="text-[8px] font-mono text-emerald-400">creator.png</span>
                  </div>
                </div>

                <div className="rounded-lg bg-black overflow-hidden border border-white/10 group-hover:border-[#D4AF37]/40 transition-colors">
                  <img
                    src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80"
                    alt="product.jpg"
                    className="w-full h-16 object-cover"
                  />
                  <div className="p-1 bg-[#0A0A0A] text-center">
                    <span className="text-[8px] font-mono text-[#D4AF37]">product.jpg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNav('assets')}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Buka My Assets →
          </button>
        </div>

        {/* STEP 4: BUAT KARAKTER AI */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                4
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                BUAT KARAKTER AI
              </span>
              <UserCheck className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Masuk ke menu AI Influencer. Upload foto referensi dan isi detail karakter (umur, gaya, outfit, personality, dll). Klik Generate AI Influencer.
            </p>

            {/* Visual Mockup */}
            <div
              onClick={() => handleNav('ai-influencer')}
              className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] cursor-pointer hover:border-[#D4AF37]/30 transition-all space-y-2"
            >
              <div className="text-[9px] font-bold text-white/70">AI Influencer Creator</div>
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
                  alt="Influencer"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#D4AF37]"
                />
                <div className="flex-1 space-y-1">
                  <div className="py-1 px-2 rounded bg-white/[0.06] text-[8px] text-white/80 text-center font-semibold">
                    Upload Referensi
                  </div>
                  <div className="py-1 px-2 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-[8px] text-white text-center font-bold">
                    Generate Karakter
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNav('ai-influencer')}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Buka AI Influencer →
          </button>
        </div>

        {/* STEP 5: BUAT VISUAL & STORYBOARD */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                5
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                BUAT VISUAL & STORYBOARD
              </span>
              <Grid className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Gunakan Image Gen untuk membuat visual referensi. Lanjutkan ke Storyboard untuk menyusun alur scene, shot, dan durasi video sesuai kebutuhan.
            </p>

            {/* Visual Mockup */}
            <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] space-y-2">
              <div
                onClick={() => handleNav('image-gen')}
                className="p-2 rounded-lg bg-black/60 border border-white/5 hover:border-[#D4AF37]/30 cursor-pointer flex items-center gap-2"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <div>
                  <div className="text-[9.5px] font-bold text-white">Image Gen</div>
                  <div className="text-[7.5px] text-white/40">Buat visual & frame</div>
                </div>
              </div>

              <div
                onClick={() => handleNav('storyboard')}
                className="p-2 rounded-lg bg-black/60 border border-white/5 hover:border-[#D4AF37]/30 cursor-pointer flex items-center gap-2"
              >
                <Grid className="w-3.5 h-3.5 text-purple-400" />
                <div>
                  <div className="text-[9.5px] font-bold text-white">Storyboard</div>
                  <div className="text-[7.5px] text-white/40">Susun alur scene & shot</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNav('storyboard')}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Buka Storyboard →
          </button>
        </div>

        {/* STEP 6: BUAT PROMPT VIDEO */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                6
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                BUAT PROMPT VIDEO
              </span>
              <FileText className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Gunakan Affiliate Prompt atau General Prompt untuk membuat naskah dan prompt video. Jika sudah siap, buka Master Video Generation Prompt.
            </p>

            {/* Visual Mockup */}
            <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] space-y-2">
              <div
                onClick={() => handleNav('affiliate-prompt')}
                className="p-2 rounded-lg bg-black/60 border border-white/5 hover:border-[#D4AF37]/30 cursor-pointer flex items-center gap-2"
              >
                <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
                <div>
                  <div className="text-[9.5px] font-bold text-white">Affiliate Prompt</div>
                  <div className="text-[7.5px] text-white/40">Naskah & prompt promosi</div>
                </div>
              </div>

              <div
                onClick={() => handleNav('general-prompt')}
                className="p-2 rounded-lg bg-black/60 border border-white/5 hover:border-[#D4AF37]/30 cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <div>
                  <div className="text-[9.5px] font-bold text-white">General Prompt</div>
                  <div className="text-[7.5px] text-white/40">Prompt video 10 pilar</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNav('affiliate-prompt')}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Buka Affiliate Prompt →
          </button>
        </div>

        {/* STEP 7: COPY MASTER PROMPT */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                7
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                COPY MASTER PROMPT
              </span>
              <Copy className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Buka kotak "02. Master Video Generation Prompt", lalu klik tombol Copy. Tempelkan ke Google Flow pada bagian prompt.
            </p>

            {/* Visual Mockup */}
            <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] space-y-2">
              <div className="text-[8.5px] font-bold text-white/60 uppercase">
                MASTER VIDEO GENERATION PROMPT
              </div>
              <div className="p-2 rounded bg-black/60 border border-white/5 font-mono text-[8px] text-white/60 line-clamp-2">
                Prompt sudah siap digunakan untuk generate video di Google Flow: cinematic 8K, creator.png with product.jpg...
              </div>
              <button
                onClick={handleCopySample}
                className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-extrabold text-[9px] flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrompt ? 'Tersalin!' : 'Copy Prompt'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleCopySample}
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors"
          >
            Salin Contoh Master Prompt →
          </button>
        </div>

        {/* STEP 8: BUKA GOOGLE FLOW */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                8
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                BUKA GOOGLE FLOW
              </span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Masuk ke Google Flow. Buat project baru atau pilih project yang sudah ada untuk memulai generasi video AI.
            </p>

            {/* Visual Mockup */}
            <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white">Google Flow</span>
              </div>
              <div className="text-[8px] text-white/40">AI Video Generation Platform</div>
              <a
                href="https://flow.google"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center gap-1 transition-all"
              >
                <span>+ New Project</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <a
            href="https://flow.google"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] text-[10.5px] font-bold transition-colors text-center block"
          >
            Buka flow.google ↗
          </a>
        </div>

        {/* STEP 9: UPLOAD REFERENCE & GENERATE */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                9
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                UPLOAD REFERENCE & GENERATE
              </span>
              <Upload className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Upload creator.png + product.jpg sebagai reference / ingredients. Atur aspect ratio, model, durasi, Paste master prompt lalu klik Generate.
            </p>

            {/* Visual Mockup */}
            <div className="p-2.5 rounded-xl bg-[#141414] border border-white/[0.06] space-y-1.5">
              <div className="text-[8px] text-white/50 font-bold uppercase">Reference / Ingredients</div>
              <div className="flex items-center gap-1.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="creator"
                  className="w-7 h-7 rounded object-cover border border-white/20"
                />
                <img
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&auto=format&fit=crop&q=80"
                  alt="product"
                  className="w-7 h-7 rounded object-cover border border-white/20"
                />
                <div className="flex-1 grid grid-cols-2 gap-1 text-[7px] font-mono text-white/70">
                  <span className="bg-black/60 px-1 py-0.5 rounded">16:9</span>
                  <span className="bg-black/60 px-1 py-0.5 rounded">Veo 3.1</span>
                  <span className="bg-black/60 px-1 py-0.5 rounded">4 Output</span>
                  <span className="bg-black/60 px-1 py-0.5 rounded">8 Detik</span>
                </div>
              </div>
              <div className="py-1 rounded bg-purple-600 text-white font-bold text-[8.5px] text-center">
                ⚡ Generate Video
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] text-white/40">
            Ingredients: creator.png + product.jpg
          </div>
        </div>

        {/* STEP 10: SUSUN & EXPORT VIDEO */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                10
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex-1 ml-2">
                SUSUN & EXPORT VIDEO
              </span>
              <Film className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
            </div>

            <p className="text-[11px] text-white/60 leading-relaxed">
              Setelah video selesai, gunakan Scene Builder untuk menyusun semua klip. Lakukan review untuk memastikan konsistensi, lalu export video final.
            </p>

            {/* Visual Mockup */}
            <div className="p-2.5 rounded-xl bg-[#141414] border border-white/[0.06] space-y-2">
              <div className="text-[8px] text-white/50 font-bold uppercase">Scene Builder Timeline</div>
              <div className="grid grid-cols-4 gap-1">
                <div className="h-9 rounded bg-zinc-800 border border-white/10 flex items-center justify-center text-[7.5px] font-mono text-white/70">
                  01
                </div>
                <div className="h-9 rounded bg-zinc-800 border border-white/10 flex items-center justify-center text-[7.5px] font-mono text-white/70">
                  02
                </div>
                <div className="h-9 rounded bg-zinc-800 border border-white/10 flex items-center justify-center text-[7.5px] font-mono text-white/70">
                  03
                </div>
                <div className="h-9 rounded bg-zinc-800 border border-white/10 flex items-center justify-center text-[7.5px] font-mono text-white/70">
                  04
                </div>
              </div>
              <div className="py-1 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[8.5px] text-center flex items-center justify-center gap-1">
                <Play className="w-2.5 h-2.5" />
                <span>Export Final Video</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Klip Siap Digabung</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          BOTTOM SECTION: WORKFLOW PRODUKSI (RINGKAS) & TIPS PENTING
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* WORKFLOW PRODUKSI (RINGKAS) (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-['Space_Grotesk']">
                WORKFLOW PRODUKSI (RINGKAS)
              </h3>
              <p className="text-[11px] text-white/50">
                Untuk hasil terbaik dan efisien, ikuti urutan alur produksi studio berikut:
              </p>
            </div>
          </div>

          {/* Horizontal Step Pipeline with Arrows */}
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="flex items-center gap-2 min-w-[750px]">
              {[
                { name: 'Project', icon: FolderOpen, tab: 'projects' },
                { name: 'AI Influencer', icon: UserCheck, tab: 'ai-influencer' },
                { name: 'Image Gen', icon: ImageIcon, tab: 'image-gen' },
                { name: 'Storyboard', icon: Grid, tab: 'storyboard' },
                { name: 'Prompt', icon: FileText, tab: 'affiliate-prompt' },
                { name: 'Google Flow', icon: Sparkles, ext: 'https://flow.google' },
                { name: 'Generate Video', icon: Film },
                { name: 'Scene Builder', icon: Layers },
                { name: 'Final Video', icon: CheckCircle2 },
              ].map((step, idx, arr) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={idx}>
                    <div
                      onClick={() => {
                        if (step.tab) handleNav(step.tab);
                        else if (step.ext) window.open(step.ext, '_blank');
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center min-w-[76px] ${
                        step.tab || step.ext
                          ? 'bg-[#141414] hover:bg-[#1A1A1A] border-white/10 hover:border-[#D4AF37]/40 cursor-pointer group'
                          : 'bg-[#101010] border-white/5 opacity-80'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center mb-1 group-hover:border-[#D4AF37]/30">
                        <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </div>
                      <span className="text-[9.5px] font-bold text-white/90 leading-tight">
                        {step.name}
                      </span>
                    </div>

                    {idx < arr.length - 1 && (
                      <span className="text-white/30 text-xs font-bold shrink-0">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* TIPS PENTING (1 Col) */}
        <div className="rounded-2xl bg-[#0D0D0D] border border-[#D4AF37]/30 p-5 space-y-3 shadow-[0_0_25px_rgba(212,175,55,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-['Space_Grotesk']">
              TIPS PENTING & BEST PRACTICE
            </h3>
          </div>

          <div className="space-y-2 text-[11px] text-white/80">
            {[
              'Gunakan satu project untuk satu pekerjaan agar aset tidak tercampur.',
              'Pastikan nama asset konsisten (creator.png & product.jpg).',
              'Jangan upload storyboard sebagai asset ketiga di Google Flow.',
              'Jaga konsistensi karakter, produk, outfit, dan lighting lokasi.',
              'Ikuti format Scene Blueprint yang dihasilkan di Master Prompt.',
              'Klik Generate tanpa approval gate untuk eksekusi instan.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="leading-snug">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
