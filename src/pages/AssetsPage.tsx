import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  Upload,
  Search,
  Trash2,
  Download,
  Eye,
  Plus,
  X,
  FileImage,
  Video,
  UserCheck,
  Tag,
  Copy,
  Edit2,
  Check,
  Maximize2,
} from 'lucide-react';
import { Asset, AssetCategory } from '../types';

export const AssetsPage: React.FC = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('IMAGE');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetTags, setAssetTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<AssetCategory>('IMAGE');
  const [editTags, setEditTags] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal (replacing window.confirm)
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);

  // Preview modal
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAssets();
  }, [selectedCategory, activeProjectId]);

  const loadAssets = () => {
    api.getAssets(selectedCategory === 'ALL' ? undefined : selectedCategory, activeProjectId || undefined)
      .then(res => setAssets(res.assets || []))
      .catch(() => {});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!assetName) {
        setAssetName(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAssetUrl(reader.result as string);
        showToast('File siap diunggah.', 'INFO');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetUrl) {
      showToast('Nama dan file asset wajib diisi.', 'WARNING');
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = assetTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.createAsset({
        project_id: activeProjectId,
        name: assetName,
        category: assetCategory,
        url: assetUrl,
        file_type: 'image/jpeg',
        tags: tagsArray,
      });

      setAssets(prev => [res.asset, ...prev]);
      setShowUploadModal(false);
      setAssetName('');
      setAssetUrl('');
      setAssetTags('');
      showToast('Asset berhasil diunggah ke Library!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal mengunggah: ${err.message}`, 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditName(asset.name);
    setEditCategory(asset.category);
    setEditTags(asset.tags?.join(', ') || '');
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.updateAsset(editingAsset.id, {
        name: editName.trim(),
        category: editCategory,
        tags: tagsArray,
      });

      setAssets(prev => prev.map(a => a.id === editingAsset.id ? res.asset : a));
      setEditingAsset(null);
      showToast('Asset berhasil diperbarui!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal mengupdate asset: ${err.message}`, 'ERROR');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicateAsset = async (asset: Asset) => {
    try {
      const res = await api.createAsset({
        project_id: activeProjectId,
        name: `${asset.name} (Salinan)`,
        category: asset.category,
        url: asset.url,
        file_type: asset.file_type,
        tags: asset.tags,
      });
      setAssets(prev => [res.asset, ...prev]);
      showToast('Asset berhasil diduplikasi.', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menduplikasi: ${err.message}`, 'ERROR');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmAsset) return;
    try {
      await api.deleteAsset(deleteConfirmAsset.id);
      setAssets(prev => prev.filter(a => a.id !== deleteConfirmAsset.id));
      showToast(`Asset "${deleteConfirmAsset.name}" dihapus.`, 'INFO');
      setDeleteConfirmAsset(null);
    } catch (err: any) {
      showToast(`Gagal menghapus asset: ${err.message}`, 'ERROR');
    }
  };

  const handleDownloadAsset = (asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = `${asset.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
    showToast('Download dimulai.', 'INFO');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL / Data asset disalin ke clipboard.', 'INFO');
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'Semua Asset' },
    { id: 'IMAGE', label: 'Images' },
    { id: 'VIDEO', label: 'Videos' },
    { id: 'CHARACTER', label: 'Characters' },
    { id: 'PRODUCT', label: 'Products' },
    { id: 'OUTFIT', label: 'Outfits' },
    { id: 'LOCATION', label: 'Locations' },
  ];

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              My Asset Library
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              LIBRARY
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Koleksi gambar referensi, produk affiliate, pakaian, dan aset visual siap pakai.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Upload Asset Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari asset atau tags..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#121212] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-1 p-1 bg-[#121212] rounded-xl border border-white/[0.08]">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-12 text-center text-white/40">
          <Layers className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-white/20" />
          <h4 className="text-sm font-semibold text-white/70">Belum ada asset di kategori ini</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto mb-4">
            Upload gambar produk, karakter, atau pakaian referensi untuk digunakan dalam generator.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-black text-xs font-bold"
          >
            + Upload Asset Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(asset => (
            <div
              key={asset.id}
              className="rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
            >
              {/* Media Thumbnail */}
              <div
                className="relative aspect-square bg-[#181818] overflow-hidden cursor-pointer"
                onClick={() => setPreviewAsset(asset)}
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end justify-between">
                  <span className="text-[10px] text-white/80 font-mono bg-black/60 px-2 py-0.5 rounded">
                    {asset.category}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Asset Info & Action Bar */}
              <div className="p-3 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {asset.name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {asset.tags?.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/50">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-white/40">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownloadAsset(asset)}
                      className="p-1 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                      title="Download Asset"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(asset.url)}
                      className="p-1 rounded-md hover:bg-white/[0.06] hover:text-[#D4AF37] transition-colors"
                      title="Salin URL / Data Asset"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateAsset(asset)}
                      className="p-1 rounded-md hover:bg-white/[0.06] hover:text-sky-400 transition-colors"
                      title="Duplikasi Asset"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(asset)}
                      className="p-1 rounded-md hover:bg-white/[0.06] hover:text-amber-400 transition-colors"
                      title="Edit Asset"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setDeleteConfirmAsset(asset)}
                    className="p-1 rounded-md hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    title="Hapus Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Upload Asset Baru ke Library
            </h3>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              {/* File Dropzone */}
              <div>
                <label className="block text-white/70 font-semibold mb-1">File Gambar / Asset *</label>
                <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#D4AF37] transition-colors relative bg-[#161616]">
                  {assetUrl ? (
                    <div className="space-y-2">
                      <img src={assetUrl} alt="Preview" className="h-32 mx-auto rounded-lg object-contain" />
                      <button
                        type="button"
                        onClick={() => setAssetUrl('')}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Ganti File
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                      <Upload className="w-6 h-6 text-[#D4AF37] mb-2" />
                      <span className="text-white/80 font-medium">Klik untuk memilih file</span>
                      <span className="text-[10px] text-white/40 mt-1">PNG, JPG, WebP max 10MB</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Nama Asset *</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  placeholder="Contoh: Serum Retinol Tetes Mikro"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Kategori</label>
                  <select
                    value={assetCategory}
                    onChange={e => setAssetCategory(e.target.value as AssetCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="CHARACTER">Character</option>
                    <option value="PRODUCT">Product</option>
                    <option value="OUTFIT">Outfit</option>
                    <option value="LOCATION">Location</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Tags (Pisahkan Koma)</label>
                  <input
                    type="text"
                    value={assetTags}
                    onChange={e => setAssetTags(e.target.value)}
                    placeholder="skincare, serum, botol"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !assetUrl || !assetName}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengunggah...' : 'Simpan Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setEditingAsset(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Edit Metadata Asset
            </h3>

            <form onSubmit={handleUpdateAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Nama Asset *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as AssetCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="CHARACTER">Character</option>
                    <option value="PRODUCT">Product</option>
                    <option value="OUTFIT">Outfit</option>
                    <option value="LOCATION">Location</option>
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

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName}
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
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Asset?</h3>
              <p className="text-xs text-white/50 mt-1">
                Asset "{deleteConfirmAsset.name}" akan dihapus secara permanen dari perpustakaan Anda.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmAsset(null)}
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

      {/* Preview Fullscreen Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl overflow-hidden p-4">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden mb-4">
              <img src={previewAsset.url} alt={previewAsset.name} className="max-h-[68vh] object-contain mx-auto" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-sm font-bold text-white">{previewAsset.name}</h4>
                <p className="text-xs text-white/40">Kategori: {previewAsset.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadAsset(previewAsset)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleCopyUrl(previewAsset.url)}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-medium flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
