import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Sparkles, Check, Crown, ExternalLink, ShieldCheck, CreditCard } from 'lucide-react';

export const ProUpgradeModal: React.FC = () => {
  const { showProUpgradeModal, setShowProUpgradeModal, settings } = useAuth();
  const { showToast } = useToast();

  if (!showProUpgradeModal) return null;

  const handleLynkCheckout = async () => {
    try {
      const res = await api.createPayment();
      const lynkUrl = res.payment_url || settings?.payment_url || 'https://lynk.id/omgio/s/pro-lifetime';
      window.open(lynkUrl, '_blank');
      showToast('Halaman pembayaran Lynk dibuka. Selesaikan pembelian untuk akses Pro Lifetime.', 'INFO');
    } catch (err: any) {
      showToast(`Gagal membuka pembayaran: ${err.message}`, 'ERROR');
    }
  };

  const perks = [
    'Akses Penuh Selamanya (PRO LIFETIME - Tanpa Biaya Bulanan)',
    'Affiliate Prompt Generator dengan 18+ Angle & Movement Kamera',
    'General Prompt Studio (Format Sinematik 10 Pilar)',
    'AI Image Generator (First Frame, Img-to-Img, 8K Upscale)',
    'AI Influencer Creator & Face Consistency DNA',
    'AI Storyboard Auto-Grid & Visual Frame Exporter (PNG Sheet)',
    'Project Management & Multi-Asset Library',
    'Server-side AI Engine (Pengguna TIDAK PERLU beli/masukkan API key)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f0f0f] border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setShowProUpgradeModal(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] p-1 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-black">
            <Crown className="w-3.5 h-3.5" />
            <span>Akses Seumur Hidup · Pro Lifetime</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              OM GIO AI PRO LIFETIME
            </h2>
            <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto leading-relaxed">
              Satu kali bayar untuk akses tak terbatas ke seluruh modul AI Creative Production Studio.
            </p>

            <div className="mt-4 inline-flex items-baseline gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-xs text-white/40 line-through">Rp 799.000</span>
              <span className="text-2xl font-black text-[#D4AF37]">{settings?.pricing_idr || 'Rp 249.000'}</span>
              <span className="text-xs text-white/50 font-medium">/ Sekali Bayar</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-2 py-1 bg-[#141414] p-4 rounded-xl border border-white/[0.06]">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          {/* Lynk info box - Streamlined: no manual confirmation needed */}
          <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 space-y-1.5 text-xs text-left">
            <div className="flex items-center gap-1.5 font-bold text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akses Pro Otomatis via Akun Google:</span>
            </div>
            <p className="text-[11px] text-white/75 leading-relaxed">
              Cukup selesaikan pembelian di Lynk dan gunakan akun Gmail Anda. Akun Google Anda otomatis mendapatkan hak akses <strong>PRO LIFETIME</strong> saat login tanpa perlu konfirmasi manual lagi!
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleLynkCheckout}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 active:scale-98"
          >
            <CreditCard className="w-4 h-4" />
            <span>BELI SEKARANG DI LYNK</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Security guarantee */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Pembayaran Resmi Lynk.id
            </span>
            <span>Garansi Akses Permanen</span>
          </div>
        </div>
      </div>
    </div>
  );
};
