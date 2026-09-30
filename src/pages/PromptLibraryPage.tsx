import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Bookmark,
  Star,
  Copy,
  Trash2,
  Plus,
  Search,
  Check,
  X,
  Sparkles,
  Layers,
  Edit2,
  Download,
} from 'lucide-react';
import { PromptItem, PromptTemplate } from '../types';

export const PromptLibraryPage: React.FC = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'my-prompts' | 'templates'>('my-prompts');
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New prompt modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PromptItem['category']>('AFFILIATE');
  const [content, setContent] = useState('');
  const [negPrompt, setNegPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<PromptItem['category']>('AFFILIATE');
  const [editContent, setEditContent] = useState('');
  const [editNegPrompt, setEditNegPrompt] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal (replacing window.confirm)
  const [deleteConfirmPrompt, setDeleteConfirmPrompt] = useState<PromptItem | null>(null);

  useEffect(() => {
    loadPrompts();
    api.getPromptTemplates()
      .then(res => setTemplates(res.templates || []))
      .catch(() => {});
  }, [selectedCategory]);

  const loadPrompts = () => {
    api.getPrompts(selectedCategory === 'ALL' ? undefined : selectedCategory)
      .then(res => setPrompts(res.prompts || []))
      .catch(() => {});
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Prompt disalin ke clipboard!', 'INFO');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.toggleFavoritePrompt(id);
      setPrompts(prev => prev.map(p => p.id === id ? res.prompt : p));
      showToast(res.prompt.is_favorite ? 'Ditambahkan ke favorit.' : 'Dihapus dari favorit.', 'INFO');
    } catch (err: any) {
      showToast(`Gagal update favorit: ${err.message}`, 'ERROR');
    }
  };

  const handleDuplicatePrompt = async (prompt: PromptItem) => {
    try {
      const res = await api.duplicatePrompt(prompt.id);
      setPrompts(prev => [res.prompt, ...prev]);
      showToast(`Prompt "${res.prompt.title}" berhasil diduplikasi!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menduplikasi: ${err.message}`, 'ERROR');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPrompt) return;
    try {
      await api.deletePrompt(deleteConfirmPrompt.id);
      setPrompts(prev => prev.filter(p => p.id !== deleteConfirmPrompt.id));
      showToast(`Prompt "${deleteConfirmPrompt.title}" dihapus.`, 'INFO');
      setDeleteConfirmPrompt(null);
    } catch (err: any) {
      showToast(`Gagal menghapus: ${err.message}`, 'ERROR');
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.createPrompt({
        project_id: activeProjectId,
        title: title.trim(),
        category,
        content: content.trim(),
        negative_prompt: negPrompt.trim(),
        tags: tagsArray,
      });

      setPrompts(prev => [res.prompt, ...prev]);
      setShowAddModal(false);
      setTitle('');
      setContent('');
      setNegPrompt('');
      setTags('');
      showToast('Prompt berhasil disimpan ke Library!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan prompt: ${err.message}`, 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (prompt: PromptItem) => {
    setEditingPrompt(prompt);
    setEditTitle(prompt.title);
    setEditCategory(prompt.category);
    setEditContent(prompt.content);
    setEditNegPrompt(prompt.negative_prompt || '');
    setEditTags(prompt.tags?.join(', ') || '');
  };

  const handleUpdatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt || !editTitle.trim() || !editContent.trim()) return;

    setIsUpdating(true);
    try {
      const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.updatePrompt(editingPrompt.id, {
        title: editTitle.trim(),
        category: editCategory,
        content: editContent.trim(),
        negative_prompt: editNegPrompt.trim(),
        tags: tagsArray,
      });

      setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? res.prompt : p));
      setEditingPrompt(null);
      showToast('Prompt berhasil diperbarui!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal mengupdate prompt: ${err.message}`, 'ERROR');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTemplatePromptText = (tpl: PromptTemplate): string => {
    if (!tpl.template_data || Object.keys(tpl.template_data).length === 0) {
      return tpl.description || '';
    }
    return Object.entries(tpl.template_data)
      .map(([k, v]) => `${k.replace(/_/g, ' ').toUpperCase()}: ${v}`)
      .join('\n');
  };

  const handleUseTemplate = async (tpl: PromptTemplate) => {
    try {
      const normalizedCategory = (
        ['AFFILIATE', 'GENERAL', 'IMAGE', 'VIDEO', 'INFLUENCER', 'STORYBOARD', 'PRODUCT'].includes(tpl.category?.toUpperCase())
          ? tpl.category.toUpperCase()
          : 'GENERAL'
      ) as PromptItem['category'];

      const res = await api.createPrompt({
        project_id: activeProjectId,
        title: tpl.title,
        category: normalizedCategory,
        content: getTemplatePromptText(tpl),
        tags: ['template', tpl.category?.toLowerCase() || 'curated'],
      });
      setPrompts(prev => [res.prompt, ...prev]);
      setActiveTab('my-prompts');
      showToast(`Template "${tpl.title}" disimpan ke My Prompts!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal memakai template: ${err.message}`, 'ERROR');
    }
  };

  const handleDownloadPrompt = (prompt: PromptItem) => {
    const text = `JUDUL: ${prompt.title}\nKATEGORI: ${prompt.category}\nTAGS: ${prompt.tags?.join(', ') || '-'}\n\n[PROMPT CONTENT]\n${prompt.content}\n\n${prompt.negative_prompt ? `[NEGATIVE PROMPT]\n${prompt.negative_prompt}\n` : ''}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${prompt.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File prompt diunduh.', 'INFO');
  };

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTemplates = templates.filter(t => {
    const promptText = getTemplatePromptText(t);
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Prompt Library & Templates
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              TEMPLATES
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Simpan prompt terbaik Anda atau gunakan formula naskah viral kurasi studio.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Tambah Prompt Baru</span>
        </button>
      </div>

      {/* Tabs: My Prompts vs System Curated Templates */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex p-1 bg-[#121212] rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('my-prompts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'my-prompts' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Prompt Saya ({prompts.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'templates' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Template Kurasi Studio ({templates.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari naskah atau tag..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#121212] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Tab Content: My Prompts */}
      {activeTab === 'my-prompts' && (
        <div className="space-y-4">
          {filteredPrompts.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-12 text-center text-white/40">
              <Bookmark className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-white/20" />
              <h4 className="text-sm font-semibold text-white/70">Library prompt masih kosong</h4>
              <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto mb-4">
                Simpan naskah dari Affiliate Prompt, General Prompt, atau buat manual untuk koleksi pribadi Anda.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-black text-xs font-bold"
              >
                + Buat Prompt Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map(p => (
                <div
                  key={p.id}
                  className="rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all p-5 flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] uppercase tracking-wider">
                        {p.category}
                      </span>
                      <button
                        onClick={() => handleToggleFavorite(p.id)}
                        className={`p-1 rounded-md transition-colors ${
                          p.is_favorite ? 'text-amber-400' : 'text-white/30 hover:text-amber-400'
                        }`}
                        title={p.is_favorite ? 'Hapus favorit' : 'Bintang favorit'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 mb-2">
                      {p.title}
                    </h3>

                    <p className="text-xs text-white/70 line-clamp-4 leading-relaxed font-mono text-[11px] bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                      {p.content}
                    </p>

                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.tags.map((t, idx) => (
                          <span key={idx} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(p.content, p.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === p.id ? 'Tersalin' : 'Copy'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadPrompt(p)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Download TXT"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicatePrompt(p)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                        title="Duplikasi Prompt"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 hover:bg-white/[0.06] transition-colors"
                        title="Edit Prompt"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmPrompt(p)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Prompt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Curated Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 uppercase tracking-wider">
                    {tpl.category}
                  </span>
                  <span className="text-[10px] text-white/40 font-semibold uppercase">CURATED FORMULA</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 font-['Space_Grotesk']">{tpl.title}</h3>
                <p className="text-xs text-white/50 mb-3">{tpl.description}</p>

                <p className="text-xs text-white/80 line-clamp-4 leading-relaxed font-mono text-[11px] bg-black/40 p-3 rounded-xl border border-white/[0.04]">
                  {getTemplatePromptText(tpl)}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
                <button
                  onClick={() => handleCopy(getTemplatePromptText(tpl), tpl.id)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Formula</span>
                </button>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black text-xs font-bold transition-all"
                >
                  Simpan ke Library
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Tambah Prompt Baru ke Library
            </h3>

            <form onSubmit={handleCreatePrompt} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Judul Prompt *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Formula Hook Serum Viral TikTok"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="AFFILIATE">Affiliate Video</option>
                    <option value="GENERAL">General Cinematic</option>
                    <option value="IMAGE">Image Gen</option>
                    <option value="INFLUENCER">AI Influencer</option>
                    <option value="STORYBOARD">Storyboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Tags (Pisahkan koma)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="viral, skincare, hook"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Isi Prompt *</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Ketik teks prompt lengkap di sini..."
                  required
                  className="w-full p-3 rounded-xl bg-[#161616] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Negative Prompt (Opsional)</label>
                <input
                  type="text"
                  value={negPrompt}
                  onChange={e => setNegPrompt(e.target.value)}
                  placeholder="blurry, distorted, low quality, oversaturated"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !content}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan ke Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prompt Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setEditingPrompt(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Edit Prompt Library
            </h3>

            <form onSubmit={handleUpdatePrompt} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Judul Prompt *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="AFFILIATE">Affiliate Video</option>
                    <option value="GENERAL">General Cinematic</option>
                    <option value="IMAGE">Image Gen</option>
                    <option value="INFLUENCER">AI Influencer</option>
                    <option value="STORYBOARD">Storyboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Tags</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={e => setEditTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Isi Prompt *</label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-[#161616] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Negative Prompt</label>
                <input
                  type="text"
                  value={editNegPrompt}
                  onChange={e => setEditNegPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPrompt(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editTitle || !editContent}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold disabled:opacity-50"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Prompt?</h3>
              <p className="text-xs text-white/50 mt-1">
                Prompt "{deleteConfirmPrompt.title}" akan dihapus dari library Anda.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmPrompt(null)}
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
