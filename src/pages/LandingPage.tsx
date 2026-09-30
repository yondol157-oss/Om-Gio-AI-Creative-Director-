import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Video,
  Image as ImageIcon,
  UserCheck,
  Grid,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Crown,
  ChevronRight,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onEnterStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterStudio }) => {
  const { user, isPro, setOpenGoogleLoginModal, setShowProUpgradeModal, settings } = useAuth();

  const handleCta = () => {
    if (!user) {
      setOpenGoogleLoginModal(true);
    } else {
      onEnterStudio();
    }
  };

  const features = [
    {
      icon: Video,
      title: 'Affiliate Prompt Studio',
      desc: 'Hasilkan naskah video affiliate dengan hook 3 detik penahan scroll, instruksi kamera 18+ angle, dan call to action konversi tinggi untuk TikTok & Reels.',
    },
    {
      icon: ImageIcon,
      title: 'First Frame & Image Gen',
      desc: 'Rancang visual pembuka memikat dan variasi gambar photorealistic 8K dengan referensi karakter, busana, lokasi, dan botol produk nyata.',
    },
    {
      icon: UserCheck,
      title: 'AI Influencer Creator',
      desc: 'Bangun persona model digital berkarakter kuat dengan DNA visual konsisten—mulai dari bentuk wajah, gaya rambut, ras, hingga aura kepribadian.',
    },
    {
      icon: Grid,
      title: 'Storyboard Generator',
      desc: 'Susun kisi alur cerita otomatis multi-shot lengkap dengan durasi, sudut kamera, pencahayaan, aksi talent, dan naskah dialog per adegan.',
    },
    {
      icon: Sliders,
      title: 'General Cinematic Prompt',
      desc: 'Formulasi prompt standar industri dengan 10 pilar sinematografi: style global, lensa anamorphic, lighting chiaroscuro, hingga transisi.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero API Key Required',
      desc: 'Seluruh engine AI diproses dari server Om Gio. Pelanggan hanya perlu login Google dan langsung berkarya tanpa ribet beli atau input API key.',
    },
  ];

  const faqs = [
    {
      q: 'Apakah saya perlu memasukkan API key AI saya sendiri?',
      a: 'Sama sekali tidak! Om Gio AI Creative Director mengelola seluruh engine AI di sisi server. Anda cukup login dengan akun Google dan langsung memakai studio.',
    },
    {
      q: 'Apa arti dari PRO LIFETIME Membership?',
      a: 'Sekali bayar, akun Google Anda aktif seumur hidup tanpa biaya langganan bulanan atau tahunan selama platform beroperasi.',
    },
    {
      q: 'Bagaimana cara aktivasi setelah pembayaran di Lynk?',
      a: 'Setelah checkout di Lynk, sistem memverifikasi secara otomatis via webhook atau Anda dapat menginput nomor referensi transaksi untuk diverifikasi instan oleh Admin.',
    },
    {
      q: 'Dapatkah saya menyimpan karakter AI Influencer untuk dipakai berulang kali?',
      a: 'Ya, studio kami memiliki Character Consistency Library sehingga model digital yang Anda buat dapat langsung di-load ke modul Storyboard, Affiliate Prompt, atau Image Gen.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col font-sans selection:bg-[#D4AF37]/30">
      {/* Top Navbar */}
      <nav className="h-18 border-b border-white/[0.08] bg-[#080808]/90 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-black font-extrabold text-base shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            OG
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white font-['Space_Grotesk'] leading-none">
              OM GIO AI
            </span>
            <span className="block text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">
              Creative Director
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={onEnterStudio}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <span>Buka Studio Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setOpenGoogleLoginModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-xs transition-all"
            >
              <span>Login dengan Google</span>
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 overflow-hidden text-center max-w-5xl mx-auto flex flex-col items-center">
        {/* Glow ambient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SaaS AI Creative Studio untuk Agency & Creator</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] font-['Space_Grotesk'] max-w-4xl">
          Bangun Konten Kreatif dengan AI. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#D4AF37] via-[#FFF1B8] to-[#D4AF37] bg-clip-text text-transparent">
            Lebih Cepat. Lebih Konsisten.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-white/70 max-w-2xl mt-6 leading-relaxed">
          AI Creative Production Studio terpadu untuk merancang naskah video affiliate viral, frame pembuka photorealistic, model influencer virtual, hingga storyboard lengkap dalam satu workspace profesional.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleCta}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('pricing-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/[0.1] text-white text-sm font-semibold transition-all"
          >
            Lihat Paket Pro Lifetime
          </button>
        </div>

        {/* Key trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Tanpa API Key AI Pengguna</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Pembayaran Aman via Lynk</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Akses Lifetime Selamanya</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 lg:px-12 py-20 bg-[#0A0A0A] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Workspace Komprehensif
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-['Space_Grotesk']">
              Segala Kebutuhan Produksi Kreatif dalam Satu Atap
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto mt-2">
              Tak perlu berpindah-pindah puluhan tab atau membayar beragam langganan AI terpisah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-white/[0.08] group-hover:border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-4 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="px-6 lg:px-12 py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold mb-4">
          <Crown className="w-3.5 h-3.5" />
          <span>INVESTASI SEKALI SEUMUR HIDUP</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
          Satu Harga. Akses Penuh Selamanya.
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-lg mx-auto">
          Dapatkan akses penuh ke seluruh suite alat produksi Om Gio AI tanpa komitmen langganan bulanan yang mencekik.
        </p>

        {/* Pricing Card */}
        <div className="mt-12 rounded-3xl bg-gradient-to-b from-[#181818] to-[#101010] border border-[#D4AF37]/40 p-8 sm:p-10 shadow-[0_0_40px_rgba(212,175,55,0.15)] relative overflow-hidden max-w-lg mx-auto text-left">
          <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-xl tracking-wider">
            BEST VALUE
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span>OM GIO PRO LIFETIME</span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#D4AF37] font-['Space_Grotesk']">
              {settings?.pricing_idr || 'Rp 249.000'}
            </span>
            <span className="text-xs text-white/50 line-through">Rp 799.000</span>
            <span className="text-xs text-white/60 font-semibold">/ Sekali Bayar</span>
          </div>

          <p className="text-xs text-white/60 mt-2">
            Akses permanen ke software dan seluruh modul AI tanpa renewal bulanan.
          </p>

          <div className="my-6 border-t border-white/[0.08]" />

          <ul className="space-y-3 text-xs text-white/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Affiliate Prompt Generator + 18 Sudut Kamera</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>General Cinematic Prompt Studio (10 Pilar)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>First Frame & Image Generator (Ultra-HD 8K)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>AI Influencer Creator & Face Consistency DNA</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Storyboard Auto-Grid Generator + Export PDF/JSON</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Project & Asset Management Workspace</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Server-side Managed AI (User bebas ribet API key)</span>
            </li>
          </ul>

          <button
            onClick={() => {
              if (!user) {
                setOpenGoogleLoginModal(true);
              } else {
                setShowProUpgradeModal(true);
              }
            }}
            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 active:scale-98"
          >
            <span>BELI PRO LIFETIME SEKARANG</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 lg:px-12 py-16 bg-[#0A0A0A] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-8 font-['Space_Grotesk']">
            Pertanyaan yang Sering Diajukan
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#141414] border border-white/[0.08]">
                <h4 className="text-sm font-semibold text-white mb-1.5">{faq.q}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 lg:px-12 border-t border-white/[0.08] text-center text-xs text-white/40">
        <p>© 2026 OM GIO AI CREATIVE DIRECTOR. Seluruh hak cipta dilindungi.</p>
        <p className="mt-1 text-[11px] text-white/30">
          AI Creative Production Studio untuk menghasilkan konten, visual, video, prompt, influencer, storyboard, dan materi kreatif dalam satu workspace.
        </p>
      </footer>
    </div>
  );
};
