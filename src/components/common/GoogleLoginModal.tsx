import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, Sparkles, CheckCircle2, Crown, Check } from 'lucide-react';

export const GoogleLoginModal: React.FC = () => {
  const {
    openGoogleLoginModal,
    setOpenGoogleLoginModal,
    loginWithGoogle,
    initialLynkBuyerMode,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLynkBuyer, setIsLynkBuyer] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialLynkBuyerMode) {
      setIsLynkBuyer(true);
    }
  }, [initialLynkBuyerMode]);

  if (!openGoogleLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await loginWithGoogle(email, name, undefined, isLynkBuyer, orderId || undefined);
    } catch {
      // Handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickGoogle = (demoEmail: string, demoName: string) => {
    loginWithGoogle(demoEmail, demoName, undefined, isLynkBuyer, orderId || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111111] border border-[#D4AF37]/30 shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Close Button */}
        <button
          onClick={() => setOpenGoogleLoginModal(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] items-center justify-center text-black font-extrabold text-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-2">
            OG
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide font-['Space_Grotesk']">
            OM GIO AI CREATIVE DIRECTOR
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Masuk langsung menggunakan akun Google / Gmail Anda
          </p>
        </div>

        {/* Lynk Buyer Auto-Activation Mode Banner */}
        <div
          onClick={() => setIsLynkBuyer(!isLynkBuyer)}
          className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
            isLynkBuyer
              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
              : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
              isLynkBuyer ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'border-white/30'
            }`}>
              {isLynkBuyer && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5 text-[#D4AF37]">
                <Crown className="w-3.5 h-3.5" />
                <span>Saya Sudah Membeli di Lynk.id</span>
              </div>
              <p className="text-[10px] text-white/60 mt-0.5 leading-snug">
                Auto-aktifkan akses PRO LIFETIME otomatis saat login tanpa persetujuan admin.
              </p>
            </div>
          </div>

          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
            isLynkBuyer ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white/50'
          }`}>
            {isLynkBuyer ? 'PRO AKTIF' : 'KLIK DISINI'}
          </span>
        </div>

        {/* One-Tap Google Button */}
        <div>
          <button
            onClick={() => handleQuickGoogle('yondol157@gmail.com', 'Om Gio (Master)')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-xs transition-all shadow-md active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLynkBuyer ? 'Masuk dengan Akun Google & Aktifkan PRO' : 'Lanjutkan dengan Akun Google'}</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#111111] px-3 text-[10px] text-white/40 uppercase">Atau masukkan Gmail</span>
        </div>

        {/* Custom Gmail Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Alamat Email Google / Gmail {isLynkBuyer && '(Sesuai Checkout Lynk)'} *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="pembeli@gmail.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Nama Lengkap (Opsional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama Anda"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {isLynkBuyer && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">No. Order / Ref Lynk (Opsional)</label>
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="LYNK-123456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Memproses Akses...</span>
            ) : isLynkBuyer ? (
              <>
                <Crown className="w-4 h-4" />
                <span>Masuk & Auto-Aktifkan PRO LIFETIME</span>
              </>
            ) : (
              <span>Masuk ke Workspace</span>
            )}
          </button>
        </form>

        {/* Security & Access Guarantee notes */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-[10.5px] text-white/50">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>Akses instan otomatis: Tidak perlu menunggu persetujuan admin manual.</span>
        </div>
      </div>
    </div>
  );
};
