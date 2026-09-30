import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Cpu,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Crown,
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  Sparkles,
  Plus,
  Send,
  Copy,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { User, Payment, AIProvider, AuditLog } from '../types';

export const AdminPanel: React.FC = () => {
  const { showToast } = useToast();
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'payments' | 'providers' | 'settings' | 'audit'>('overview');

  // Stats & metrics
  const [stats, setStats] = useState<any>(null);

  // Users state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Lynk Buyer Activation state
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [grantNotes, setGrantNotes] = useState('');
  const [isSubmittingGrant, setIsSubmittingGrant] = useState(false);
  const [grantSuccessData, setGrantSuccessData] = useState<{
    email: string;
    name: string;
    messageText: string;
  } | null>(null);
  const [copiedGrantMessage, setCopiedGrantMessage] = useState(false);

  // Payments state
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);

  // Providers state
  const [providersList, setProvidersList] = useState<AIProvider[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Settings state
  const [appName, setAppName] = useState('OM GIO AI CREATIVE DIRECTOR');
  const [tagline, setTagline] = useState('AI Creative Production Studio untuk menghasilkan konten, visual, video, prompt, influencer, storyboard, dan materi kreatif dalam satu workspace.');
  const [pricingIdr, setPricingIdr] = useState('Rp 249.000');
  const [paymentUrl, setPaymentUrl] = useState('https://lynk.id/omgio/s/pro-lifetime');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = () => {
    api.getAdminStats().then(r => setStats(r.metrics)).catch(() => {});
    api.getAdminUsers().then(r => setUsersList(r.users || [])).catch(() => {});
    api.getAdminPayments().then(r => setPaymentsList(r.payments || [])).catch(() => {});
    api.getAdminProviders().then(r => setProvidersList(r.providers || [])).catch(() => {});
    api.getAdminAuditLogs().then(r => setAuditLogs(r.audit_logs || [])).catch(() => {});
    api.getPublicSettings().then(s => {
      if (s) {
        setAppName(s.app_name || '');
        setTagline(s.tagline || '');
        setPricingIdr(s.pricing_idr || '');
        setPaymentUrl(s.payment_url || '');
        setMaintenanceMode(s.maintenance_mode || false);
      }
    }).catch(() => {});
  };

  // 1. Verify Payment Action
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await api.verifyAdminPayment(paymentId);
      if (res.success) {
        showToast(res.message, 'SUCCESS');
        loadAllAdminData();
      } else {
        showToast(res.message, 'ERROR');
      }
    } catch (err: any) {
      showToast(`Gagal verifikasi payment: ${err.message}`, 'ERROR');
    }
  };

  // 2. Grant/Revoke Pro Role
  const handleTogglePro = async (user: User) => {
    const isCurrentlyPro = user.role === 'PRO' || user.lifetime_access;
    const newRole = isCurrentlyPro ? 'USER' : 'PRO';
    const newType = isCurrentlyPro ? 'FREE' : 'PRO_LIFETIME';
    const newLifetime = !isCurrentlyPro;

    try {
      await api.updateAdminUserRole(user.id, {
        role: newRole,
        membership_type: newType,
        lifetime_access: newLifetime,
      });
      showToast(`Akses user ${user.name} diubah menjadi ${newRole} (${newType}).`, 'SUCCESS');
      loadAllAdminData();
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`, 'ERROR');
    }
  };

  // 3. Suspend/Unsuspend
  const handleToggleSuspend = async (user: User) => {
    const isSuspended = user.role === 'SUSPENDED';
    const newRole = isSuspended ? 'USER' : 'SUSPENDED';

    try {
      await api.updateAdminUserRole(user.id, { role: newRole });
      showToast(`User ${user.name} sekarang ${newRole}.`, 'INFO');
      loadAllAdminData();
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`, 'ERROR');
    }
  };

  // 4. Grant Pro Lifetime by Email directly
  const handleGrantProByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim() || !grantEmail.includes('@')) {
      showToast('Alamat email Gmail/Google wajib diisi.', 'WARNING');
      return;
    }

    setIsSubmittingGrant(true);
    try {
      const cleanEmail = grantEmail.trim().toLowerCase();
      const res = await api.grantProByEmail(cleanEmail, grantName.trim(), grantNotes.trim() || 'Aktivasi Pembeli Lynk');
      showToast(res.message, 'SUCCESS');

      const appUrl = window.location.origin;
      const buyerName = grantName.trim() || cleanEmail.split('@')[0];
      const deliveryMessage = `Halo ${buyerName}! Terima kasih telah melakukan pembelian di Lynk.id.

Akses akun Google Anda (${cleanEmail}) telah AKTIF sebagai PRO LIFETIME di OM GIO AI CREATIVE DIRECTOR.

Silakan langsung buka studio aplikasi melalui link ini:
👉 ${appUrl}

Langkah Masuk:
1. Buka link di atas melalui browser (Chrome/Safari)
2. Klik tombol "Masuk dengan Google"
3. Pilih akun Gmail: ${cleanEmail}
4. Status PRO LIFETIME Anda otomatis aktif dan semua fitur AI (Affiliate Prompt, General Prompt, Image Gen, AI Influencer, Storyboard) siap digunakan tanpa batasan!

Selamat berkarya dengan AI Creative Director!`;

      setGrantSuccessData({
        email: cleanEmail,
        name: buyerName,
        messageText: deliveryMessage,
      });

      loadAllAdminData();
    } catch (err: any) {
      showToast(`Gagal mengaktifkan user: ${err.message}`, 'ERROR');
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  const handleCopyGrantMessage = () => {
    if (!grantSuccessData) return;
    navigator.clipboard.writeText(grantSuccessData.messageText);
    setCopiedGrantMessage(true);
    showToast('Template pesan & link akses disalin! Siap dikirim ke pembeli.', 'SUCCESS');
    setTimeout(() => setCopiedGrantMessage(false), 2000);
  };

  // 5. Test AI Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
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
      setTestResult({ success: false, message: err.message });
      showToast(err.message, 'ERROR');
    } finally {
      setTestingConnection(false);
    }
  };

  // 5. Save System Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings({
        app_name: appName,
        tagline,
        pricing_idr: pricingIdr,
        payment_url: paymentUrl,
        maintenance_mode: maintenanceMode,
      });
      showToast('Pengaturan sistem berhasil disimpan.', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan pengaturan: ${err.message}`, 'ERROR');
    }
  };

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk'] flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />
              <span>Admin Control Panel</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#D4AF37] border border-amber-500/40">
              OWNER DASHBOARD
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Pusat kendali pengguna, verifikasi pembayaran Lynk, pengaturan model AI, dan audit sistem.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex p-1 bg-[#121212] rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: `Users (${usersList.length})`, icon: Users },
          { id: 'payments', label: `Payments & Verification (${paymentsList.filter(p => p.status === 'PENDING').length} Pending)`, icon: CreditCard },
          { id: 'providers', label: 'AI Providers & Models', icon: Cpu },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'audit', label: 'Audit Logs', icon: Clock },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                adminTab === t.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview Metrics */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Total Users</span>
              <div className="text-2xl font-black text-white font-['Space_Grotesk']">{stats?.totalUsers || 0}</div>
              <span className="text-[11px] text-white/50">{stats?.lifetimeUsers || 0} PRO Lifetime</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Payments</span>
              <div className="text-2xl font-black text-amber-300 font-['Space_Grotesk']">{stats?.pendingPayments || 0}</div>
              <span className="text-[11px] text-white/50">Membutuhkan verifikasi</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Verified Payments</span>
              <div className="text-2xl font-black text-[#D4AF37] font-['Space_Grotesk']">{stats?.verifiedPayments || 0}</div>
              <span className="text-[11px] text-white/50">Total IDR {(stats?.totalRevenueIdr || 0).toLocaleString('id-ID')}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">AI Generations</span>
              <div className="text-2xl font-black text-purple-300 font-['Space_Grotesk']">{stats?.totalGenerations || 0}</div>
              <span className="text-[11px] text-white/50">Prompt & visual assets</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Cari user berdasarkan nama / email..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#121212] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={() => {
                setGrantSuccessData(null);
                setGrantEmail('');
                setGrantName('');
                setGrantNotes('');
                setShowGrantModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Aktivasi Pembeli Lynk (Beri Pro)</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-white/50 uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Membership</th>
                  <th className="py-3 px-4">Lifetime</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-white/40">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        u.role === 'ADMIN' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : u.role === 'PRO' ? 'bg-amber-400/20 text-amber-300' : u.role === 'SUSPENDED' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/[0.05] text-white/60'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/80">{u.membership_type}</td>
                    <td className="py-3 px-4">
                      {u.lifetime_access ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ya
                        </span>
                      ) : (
                        <span className="text-white/40">Tidak</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/70">{u.payment_status}</td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePro(u)}
                            className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-[#D4AF37]/20 text-[#D4AF37] font-semibold text-[11px] transition-colors"
                          >
                            {u.lifetime_access ? 'Revoke Pro' : 'Grant PRO'}
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px] transition-colors"
                          >
                            {u.role === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payments & Verification Queue */}
      {adminTab === 'payments' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-white/50 uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Ref Transaksi</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Catatan / Bukti</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paymentsList.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.user_name}</div>
                      <div className="text-[11px] text-white/40">{p.user_email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#D4AF37]">
                      {p.provider_transaction_id}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      Rp {p.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        p.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' : p.status === 'PENDING' ? 'bg-amber-400/20 text-amber-300' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/70 max-w-xs">
                      <div>{p.notes || '-'}</div>
                      {p.proof_image && (
                        <a
                          href={p.proof_image}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1 mt-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Bukti Foto</span>
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleVerifyPayment(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-extrabold text-xs shadow-md transition-all active:scale-95"
                        >
                          Verify & Aktifkan Pro
                        </button>
                      )}
                      {p.status === 'VERIFIED' && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: AI Providers & Models Configuration */}
      {adminTab === 'providers' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-white/80 leading-relaxed">
            <strong className="text-[#D4AF37]">Keamanan Ketat API Key:</strong> API Key engine AI hanya dikonfigurasi dan disimpan di server side (environment secret). Pelanggan tidak dapat melihat, menyalin, atau menerima API key melalui response jaringan/browser.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {providersList.map(prov => (
              <div key={prov.id} className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-white">{prov.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                    {prov.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-semibold">API Key Secret</span>
                    <span className="font-mono text-white/80">{prov.api_key_masked}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase font-semibold">Text Model</span>
                      <span className="font-mono text-[#D4AF37]">{prov.active_text_model}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase font-semibold">Image Model</span>
                      <span className="font-mono text-[#D4AF37]">{prov.active_image_model}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" /> : <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>Test Connection</span>
                  </button>

                  <span className="text-[10px] text-white/40">
                    Batas: {prov.daily_limit} req/hari
                  </span>
                </div>
              </div>
            ))}
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{testResult.success ? 'Koneksi Berhasil' : 'Koneksi Gagal'}</span>
              </div>
              <p className="mt-1">{testResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: System Settings */}
      {adminTab === 'settings' && (
        <div className="max-w-2xl rounded-2xl bg-[#121212] border border-white/[0.08] p-6">
          <h3 className="text-base font-bold text-white mb-4 font-['Space_Grotesk']">
            Pengaturan Sistem & Branding
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-white/70 font-medium mb-1">Nama Aplikasi</label>
              <input
                type="text"
                value={appName}
                onChange={e => setAppName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-white/70 font-medium mb-1">Tagline Aplikasi</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-white/70 font-medium mb-1">Harga Display Pro Lifetime</label>
              <input
                type="text"
                value={pricingIdr}
                onChange={e => setPricingIdr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-white/70 font-medium mb-1">URL Checkout Lynk (Link Toko/Produk Anda di Lynk.id)</label>
              <input
                type="text"
                value={paymentUrl}
                onChange={e => setPaymentUrl(e.target.value)}
                placeholder="https://lynk.id/username/s/nama-produk"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-[10px] text-white/40 mt-1">
                Link ini akan terbuka saat pengguna di dalam aplikasi menekan tombol "Beli Pro Lifetime".
              </p>
            </div>

            {/* Kotak Bantuan Link untuk Dipasang di Dashboard Lynk.id */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#D4AF37]/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                <ExternalLink className="w-4 h-4" />
                <span>Link yang Perlu Dipasang di Akun Lynk.id Anda:</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div>
                  <span className="text-white/60 block mb-0.5 font-medium">
                    1. Redirect URL Setelah Pembelian (di Dashboard Lynk &gt; Edit Produk &gt; Redirect):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/?lynk_paid=true`}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-[10.5px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/?lynk_paid=true`);
                        showToast('Link Redirect Lynk disalin!', 'SUCCESS');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] font-semibold text-[11px] shrink-0"
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-white/60 block mb-0.5 font-medium">
                    2. URL Webhook Otomatis (di Dashboard Lynk &gt; Integrasi &gt; Webhook):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/api/payments/webhook`}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-[10.5px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/payments/webhook`);
                        showToast('URL Webhook Lynk disalin!', 'SUCCESS');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] font-semibold text-[11px] shrink-0"
                    >
                      Salin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={e => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
                />
                <span>Aktifkan Maintenance Mode (Hanya Admin yang dapat login)</span>
              </label>
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs shadow-md"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {adminTab === 'audit' && (
        <div className="rounded-2xl bg-[#121212] border border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-white/50 uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-mono text-[11px] text-white/40">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-white/80">{log.user_email || 'System'}</td>
                  <td className="py-3 px-4 font-semibold text-[#D4AF37]">{log.action}</td>
                  <td className="py-3 px-4 text-white/60">{log.resource}</td>
                  <td className="py-3 px-4 text-white/40 font-mono text-[10px] max-w-xs truncate">
                    {JSON.stringify(log.metadata || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Aktivasi Pembeli Lynk (Beri Akses Pro via Gmail) */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 space-y-4">
            <button
              onClick={() => {
                setShowGrantModal(false);
                setGrantSuccessData(null);
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Aktivasi Pembeli Lynk (Pro Lifetime)
                </h3>
                <p className="text-xs text-white/50">
                  Beri akses PRO langsung menggunakan akun Google / Gmail pembeli.
                </p>
              </div>
            </div>

            {!grantSuccessData ? (
              <form onSubmit={handleGrantProByEmail} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/80 font-semibold mb-1">
                    Alamat Email Google / Gmail Pembeli *
                  </label>
                  <input
                    type="email"
                    value={grantEmail}
                    onChange={e => setGrantEmail(e.target.value)}
                    placeholder="contoh: pembeli@gmail.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p className="text-[10px] text-white/40 mt-1">
                    Saat pembeli menekan "Masuk dengan Google" dengan email ini, akses PRO LIFETIME otomatis aktif.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/80 font-semibold mb-1">Nama Pembeli (Opsional)</label>
                    <input
                      type="text"
                      value={grantName}
                      onChange={e => setGrantName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-semibold mb-1">Ref / No Order Lynk</label>
                    <input
                      type="text"
                      value={grantNotes}
                      onChange={e => setGrantNotes(e.target.value)}
                      placeholder="LYNK-123456"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Panduan Cepat Lynk */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5 text-[11px] text-white/60">
                  <div className="flex items-center gap-1.5 font-semibold text-[#D4AF37]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Cara Kerja Alur Pembeli Lynk:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-white/50">
                    <li>Pembeli bayar melalui link Lynk Anda.</li>
                    <li>Pembeli memasukkan Gmail di form Lynk atau mengirim bukti bayar ke WA Admin.</li>
                    <li>Admin masukkan Gmail di form ini lalu klik tombol di bawah.</li>
                    <li>Sistem langsung mengaktifkan akun Google tersebut sebagai PRO LIFETIME & menghasilkan template pesan link login siap kirim.</li>
                  </ol>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGrantModal(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGrant}
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingGrant ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengaktifkan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Aktifkan PRO LIFETIME</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success delivery template */
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Akses PRO LIFETIME Berhasil Diaktifkan!</span>
                    <span className="text-[11px] text-emerald-300/80">
                      Akun {grantSuccessData.email} kini memiliki akses Pro penuh tanpa batasan waktu.
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-white/80">Template Pesan & Link Akses (Kirim ke Pembeli)</span>
                    <button
                      onClick={handleCopyGrantMessage}
                      className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedGrantMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedGrantMessage ? 'Tersalin!' : 'Salin Pesan'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    readOnly
                    value={grantSuccessData.messageText}
                    className="w-full p-3 rounded-xl bg-[#161616] border border-white/[0.08] text-white/90 font-mono text-[11px] focus:outline-none select-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setGrantSuccessData(null);
                      setGrantEmail('');
                      setGrantName('');
                      setGrantNotes('');
                    }}
                    className="w-1/2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold"
                  >
                    + Aktivasi Pembeli Lain
                  </button>
                  <button
                    onClick={handleCopyGrantMessage}
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold flex items-center justify-center gap-2"
                  >
                    {copiedGrantMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedGrantMessage ? 'Pesan Tersalin!' : 'Salin Pesan WA/Lynk'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
