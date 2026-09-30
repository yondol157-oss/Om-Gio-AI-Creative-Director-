import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  User,
  Crown,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

export const ProfileMembershipPage: React.FC = () => {
  const { user, isPro, settings, setShowProUpgradeModal } = useAuth();
  const { showToast } = useToast();

  const handleLynkCheckout = async () => {
    try {
      const res = await api.createPayment();
      const lynkUrl = res.payment_url || settings?.payment_url || 'https://lynk.id/omgio/s/pro-lifetime';
      window.open(lynkUrl, '_blank');
      showToast('Halaman checkout Lynk telah dibuka.', 'INFO');
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`, 'ERROR');
    }
  };

  if (!user) return null;

  const proFeatures = [
    'Affiliate Prompt Generator (Hook 3 Detik, 18+ Angle & Movement Kamera)',
    'General Prompt Studio (Format Sinematik Standar 10 Pilar Industri)',
    'AI Image Gen (First Frame, Image-to-Image, Photorealistic 8K)',
    'AI Influencer Creator (DNA Wajah Konsisten di Berbagai Pose)',
    'AI Storyboard Generator (Kisi Multi-Shot, Dialog & Ekspor Lembar Sheet PNG)',
    'Asset Library & Multi-Project Workspace Tak Terbatas',
    'Server-side Gemini AI Engine (TIDAK PERLU beli atau input API key)',
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
            Profil & Status Membership
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
            ACCOUNT
          </span>
        </div>
        <p className="text-xs text-white/50 mt-1">
          Informasi autentikasi Google dan status akses akun OM GIO AI Creative Director Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Google Profile Card (1 Col) */}
        <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-6 text-center space-y-4">
          <div className="relative inline-block mx-auto">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-[#D4AF37]/50 mx-auto"
            />
            {isPro && (
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#D4AF37] text-black shadow-lg">
                <Crown className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{user.name}</h3>
            <p className="text-xs text-white/50">{user.email}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-white/40">Role Akun</span>
              <span className="font-semibold text-[#D4AF37]">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Autentikasi</span>
              <span className="text-white/80">Google OAuth (Gmail)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Bergabung Sejak</span>
              <span className="text-white/80">{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Membership Details & Status (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Membership Tier Box */}
          <div className="rounded-2xl bg-gradient-to-br from-[#161616] to-[#0E0E0E] border border-[#D4AF37]/30 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  {isPro ? 'PRO LIFETIME ACCESS' : 'FREE TIER ACCESS'}
                </h3>
              </div>
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                isPro ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'bg-white/[0.05] text-white/60'
              }`}>
                {isPro ? 'Aktif Permanen' : 'Free Preview'}
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {isPro
                ? 'Selamat! Akun Google Anda memiliki akses PRO LIFETIME penuh ke seluruh generator video affiliate, naskah prompt 10 pilar, model influencer virtual, dan storyboard AI tanpa batasan waktu dan tanpa langganan bulanan.'
                : 'Akun Anda saat ini berada di tier Free. Cukup lakukan pembelian satu kali di Lynk dan daftarkan akun Google Anda untuk membuka seluruh fitur Pro seumur hidup.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                <div className="text-[10px] text-white/40 uppercase font-semibold">Tipe Lisensi</div>
                <div className="text-xs font-bold text-white mt-0.5">
                  {user.membership_type === 'PRO_LIFETIME' || isPro ? 'Lifetime Access' : 'Free Preview'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                <div className="text-[10px] text-white/40 uppercase font-semibold">Masa Berlaku</div>
                <div className="text-xs font-bold text-[#D4AF37] mt-0.5">
                  {user.lifetime_access || isPro ? 'SELAMANYA (Permanent)' : 'Terbatas'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                <div className="text-[10px] text-white/40 uppercase font-semibold">Status Akun</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isPro ? 'Terverifikasi' : 'Aktif'}</span>
                </div>
              </div>
            </div>

            {/* If NOT pro, show Lynk checkout CTA */}
            {!isPro && (
              <div className="pt-2 space-y-3">
                <button
                  onClick={handleLynkCheckout}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Beli Pro Lifetime di Lynk ({settings?.pricing_idr || 'Rp 249.000'})</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-white/50">
                  Cukup beli di Lynk dan kirimkan akun Google Anda. Akses PRO LIFETIME langsung aktif otomatis tanpa perlu konfirmasi manual lagi!
                </p>
              </div>
            )}
          </div>

          {/* Active Features Privilege Box */}
          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span>Hak Akses Fitur Studio</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {proFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-xs transition-colors ${
                    isPro
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-white/90'
                      : 'bg-white/[0.02] border-white/[0.04] text-white/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isPro ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-white/30'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{feat}</span>
                  {isPro && (
                    <span className="ml-auto text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
