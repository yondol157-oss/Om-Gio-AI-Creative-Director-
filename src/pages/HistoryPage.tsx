import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  History,
  Clock,
  Video,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Grid,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Trash2,
  X,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Generation, GenerationModule } from '../types';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmGen, setDeleteConfirmGen] = useState<Generation | null>(null);

  useEffect(() => {
    loadHistory();
  }, [filterModule]);

  const loadHistory = () => {
    api.getGenerations(filterModule === 'ALL' ? undefined : filterModule, 100)
      .then(res => setGenerations(res.generations || []))
      .catch(() => {});
  };

  const getModuleIcon = (mod: GenerationModule) => {
    switch (mod) {
      case 'AFFILIATE_PROMPT':
        return <Video className="w-4 h-4 text-[#D4AF37]" />;
      case 'GENERAL_PROMPT':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'IMAGE_GEN':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'AI_INFLUENCER':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'STORYBOARD':
        return <Grid className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-white/50" />;
    }
  };

  const copyResult = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Hasil generation disalin ke clipboard.', 'INFO');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmGen) return;
    try {
      await api.deleteGeneration(deleteConfirmGen.id);
      setGenerations(prev => prev.filter(g => g.id !== deleteConfirmGen.id));
      if (selectedGen?.id === deleteConfirmGen.id) setSelectedGen(null);
      showToast('Riwayat berhasil dihapus.', 'INFO');
      setDeleteConfirmGen(null);
    } catch (err: any) {
      showToast(`Gagal menghapus riwayat: ${err.message}`, 'ERROR');
    }
  };

  const handleDownloadResult = (gen: Generation) => {
    const text = JSON.stringify(gen.result_data, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generation-${gen.module.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File JSON riwayat diunduh.', 'INFO');
  };

  const dateFiltered = generations.filter(g => {
    if (filterDate === 'ALL') return true;
    const gDate = new Date(g.created_at).getTime();
    const now = Date.now();
    const diffHours = (now - gDate) / (1000 * 60 * 60);

    if (filterDate === 'TODAY') return diffHours <= 24;
    if (filterDate === '7DAYS') return diffHours <= 24 * 7;
    if (filterDate === '30DAYS') return diffHours <= 24 * 30;
    return true;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Riwayat Aktivitas Studio
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              ACTIVITY
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Pantau seluruh log pembuatan konten AI, naskah prompt, visual, dan storyboard Anda.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Refresh Riwayat</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        {/* Module Filters */}
        <div className="flex flex-wrap gap-1 p-1 bg-[#121212] rounded-xl border border-white/[0.08]">
          {[
            { id: 'ALL', label: 'Semua Modul' },
            { id: 'AFFILIATE_PROMPT', label: 'Affiliate' },
            { id: 'GENERAL_PROMPT', label: 'General' },
            { id: 'IMAGE_GEN', label: 'Image Gen' },
            { id: 'AI_INFLUENCER', label: 'Influencer' },
            { id: 'STORYBOARD', label: 'Storyboard' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterModule(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterModule === tab.id ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex gap-1.5 p-1 bg-[#121212] rounded-xl border border-white/[0.08]">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'TODAY', label: 'Hari Ini' },
            { id: '7DAYS', label: '7 Hari' },
            { id: '30DAYS', label: '30 Hari' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setFilterDate(d.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filterDate === d.id ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Timeline List */}
      {dateFiltered.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-12 text-center text-white/40">
          <History className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-white/20" />
          <h4 className="text-sm font-semibold text-white/70">Belum ada riwayat aktivitas</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
            Aktivitas generate konten prompt, gambar, dan storyboard Anda akan otomatis tersimpan di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dateFiltered.map(gen => {
            const previewText =
              gen.prompt_input?.product_name ||
              gen.prompt_input?.video_context ||
              gen.prompt_input?.concept ||
              gen.prompt_input?.name ||
              'Generation Input';
            const outputString = JSON.stringify(gen.result_data, null, 2);

            return (
              <div
                key={gen.id}
                className="p-4 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                onClick={() => setSelectedGen(gen)}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
                    {getModuleIcon(gen.module)}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                        {gen.module.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-white/30">·</span>
                      <span className="text-[10px] text-white/40 font-mono">{gen.model}</span>
                      <span className="text-[10px] text-white/30">·</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{gen.status}</span>
                    </div>

                    <div className="text-xs font-semibold text-white truncate mt-1">{previewText}</div>

                    <div className="text-[11px] text-white/40 truncate font-mono mt-0.5">
                      {gen.result_data?.main_prompt ||
                        gen.result_data?.final_prompt ||
                        gen.result_data?.title ||
                        'Output result generated'}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div
                  className="flex items-center gap-3 shrink-0 sm:border-l sm:border-white/[0.06] sm:pl-4"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-[10px] text-white/40">
                    {new Date(gen.created_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    onClick={() => copyResult(outputString, gen.id)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/15 text-[#D4AF37] transition-colors"
                    title="Copy Result JSON"
                  >
                    {copiedId === gen.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setDeleteConfirmGen(gen)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-colors"
                    title="Hapus dari Riwayat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Generation Detail Modal */}
      {selectedGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedGen(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.08]">
              {getModuleIcon(selectedGen.module)}
              <div>
                <h3 className="text-sm font-bold text-white">Detail Riwayat: {selectedGen.module.replace('_', ' ')}</h3>
                <span className="text-[10px] text-white/40">
                  {new Date(selectedGen.created_at).toLocaleString('id-ID')} · Engine: {selectedGen.model}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-xs pr-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Input Parameter</span>
                <pre className="mt-1 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/80 font-mono text-[11px] overflow-auto">
                  {JSON.stringify(selectedGen.prompt_input, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Output Hasil AI</span>
                <pre className="mt-1 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/90 font-mono text-[11px] overflow-auto select-all">
                  {JSON.stringify(selectedGen.result_data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => setDeleteConfirmGen(selectedGen)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Item</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadResult(selectedGen)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={() => copyResult(JSON.stringify(selectedGen.result_data, null, 2), selectedGen.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-black text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Output</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus dari Riwayat?</h3>
              <p className="text-xs text-white/50 mt-1">Item riwayat ini akan dihapus dari log aktivitas akun Anda.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmGen(null)}
                className="w-1/2 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
