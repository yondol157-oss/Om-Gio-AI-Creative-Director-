import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Bell,
  Cpu,
  ShieldCheck,
  Moon,
  Sparkles,
  Save,
  RefreshCw,
  Crown,
  CheckCircle2,
  XCircle,
  Activity,
  RotateCcw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isPro, isAdmin, settings } = useAuth();
  const { showToast } = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSavePrompts, setAutoSavePrompts] = useState(true);
  const [preferredModel, setPreferredModel] = useState('gemini-3.8-flash');
  const [preferredAspect, setPreferredAspect] = useState('16:9');

  // AI test connectivity
  const [testingAI, setTestingAI] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      'om_gio_user_prefs',
      JSON.stringify({
        notificationsEnabled,
        autoSavePrompts,
        preferredModel,
        preferredAspect,
      })
    );
    showToast('Preferensi workspace berhasil disimpan.', 'SUCCESS');
  };

  const handleResetDefaults = () => {
    setNotificationsEnabled(true);
    setAutoSavePrompts(true);
    setPreferredModel('gemini-3.8-flash');
    setPreferredAspect('16:9');
    localStorage.removeItem('om_gio_user_prefs');
    showToast('Preferensi dikembalikan ke nilai default pabrik.', 'INFO');
  };

  const handleTestConnection = async () => {
    setTestingAI(true);
    setTestResult(null);
    try {
      const res = await api.testAdminProvider();
      setTestResult(res);
      if (res.success) {
        showToast(res.message, 'SUCCESS');
      } else {
        showToast(res.message, 'WARNING');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Koneksi ke AI server gagal.',
      });
      showToast(err.message, 'ERROR');
    } finally {
      setTestingAI(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('om_gio_user_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notificationsEnabled !== undefined) setNotificationsEnabled(parsed.notificationsEnabled);
        if (parsed.autoSavePrompts !== undefined) setAutoSavePrompts(parsed.autoSavePrompts);
        if (parsed.preferredModel) setPreferredModel(parsed.preferredModel);
        if (parsed.preferredAspect) setPreferredAspect(parsed.preferredAspect);
      }
    } catch {}
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Studio Settings & Preferences
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              SETTINGS
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Sesuaikan preferensi kerja, notifikasi, dan parameter default engine kreatif Anda.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/40" />
          <span>Reset Default</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Profile Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] text-center space-y-3">
            <img
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#D4AF37] mx-auto"
            />
            <div>
              <h3 className="text-sm font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-white/40">{user?.email}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold">
              <Crown className="w-3.5 h-3.5" />
              <span>{isPro ? 'PRO LIFETIME' : 'FREE USER'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-3 text-xs">
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">AI Engine Status</div>
            <div className="flex items-center justify-between text-white/80">
              <span>Text Engine</span>
              <span className="font-mono text-[#D4AF37]">gemini-3.8-flash</span>
            </div>
            <div className="flex items-center justify-between text-white/80">
              <span>Image Engine</span>
              <span className="font-mono text-[#D4AF37]">gemini-3.1-flash-lite-image</span>
            </div>
            <div className="flex items-center justify-between text-white/80">
              <span>Server Mode</span>
              <span className="text-emerald-400 font-semibold">Online & Secured</span>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={handleTestConnection}
                disabled={testingAI}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/[0.08] disabled:opacity-50"
              >
                {testingAI ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                )}
                <span>{testingAI ? 'Menguji Koneksi...' : 'Uji Koneksi AI Engine'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{testResult.success ? 'Terkoneksi' : 'Gagal'}</span>
                </div>
                <p className="mt-0.5 text-[10px]">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preferences Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#121212] border border-white/[0.08]">
            <h3 className="text-base font-bold text-white mb-4 font-['Space_Grotesk']">
              Preferensi Produksi Konten
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-5 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Model Teks Utama</label>
                <select
                  value={preferredModel}
                  onChange={e => setPreferredModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Cepat & Responsif - Recommended)</option>
                  <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Deep Cinematic Reasoning)</option>
                </select>
                <span className="text-[10px] text-white/40 mt-1 block">
                  Model yang digunakan untuk merancang naskah video affiliate dan storyboard 10 pilar.
                </span>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Aspek Rasio Default</label>
                <select
                  value={preferredAspect}
                  onChange={e => setPreferredAspect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="16:9">16:9 (Landscape Video / Film)</option>
                  <option value="9:16">9:16 (Vertical Reels & TikTok)</option>
                  <option value="1:1">1:1 (Square Feed)</option>
                  <option value="3:4">3:4 (Portrait Influencer)</option>
                  <option value="4:5">4:5 (Instagram Feed)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/[0.04]">
                <label className="flex items-center gap-2.5 text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSavePrompts}
                    onChange={e => setAutoSavePrompts(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
                  />
                  <span>Simpan otomatis prompt hasil generate ke Riwayat Aktivitas</span>
                </label>

                <label className="flex items-center gap-2.5 text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={e => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
                  />
                  <span>Tampilkan pop-up notifikasi toast saat operasi AI selesai</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
                >
                  <Save className="w-4 h-4 text-black" />
                  <span>Simpan Preferensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
