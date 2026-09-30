import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  Archive,
  Search,
  Check,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';

export const ProjectsPage: React.FC = () => {
  const { activeProjectId, setActiveProjectId } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    api.getProjects()
      .then(res => setProjects(res.projects || []))
      .catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createProject({
        name: newName.trim(),
        description: newDesc.trim(),
        status: newStatus,
      });

      setProjects(prev => [res.project, ...prev]);
      setActiveProjectId(res.project.id);
      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
      showToast(`Project "${res.project.name}" berhasil dibuat!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal membuat project: ${err.message}`, 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDesc(project.description || '');
    setEditStatus(project.status);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const res = await api.updateProject(editingProject.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        status: editStatus,
      });

      setProjects(prev => prev.map(p => p.id === editingProject.id ? res.project : p));
      setEditingProject(null);
      showToast(`Project "${res.project.name}" berhasil diperbarui!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal mengupdate project: ${err.message}`, 'ERROR');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const res = await api.duplicateProject(project.id);
      setProjects(prev => [res.project, ...prev]);
      showToast(`Project berhasil diduplikasi: "${res.project.name}"`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menduplikasi: ${err.message}`, 'ERROR');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProject) return;
    try {
      await api.deleteProject(deleteConfirmProject.id);
      setProjects(prev => prev.filter(p => p.id !== deleteConfirmProject.id));
      if (activeProjectId === deleteConfirmProject.id) setActiveProjectId(null);
      showToast(`Project "${deleteConfirmProject.name}" berhasil dihapus.`, 'INFO');
      setDeleteConfirmProject(null);
    } catch (err: any) {
      showToast(`Gagal menghapus: ${err.message}`, 'ERROR');
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Projects Management
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              WORKSPACE
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Atur kampanye konten kreatif, aset referensi, dan naskah produksi Anda.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Buat Project Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari project..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#121212] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#121212] rounded-xl border border-white/[0.08]">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'DRAFT', label: 'Draft' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-12 text-center text-white/40">
          <FolderOpen className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-white/20" />
          <h4 className="text-sm font-semibold text-white/70">Tidak ada project ditemukan</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto mb-4">
            Mulai buat project baru untuk mengorganisasi naskah prompt, visual gambar, dan storyboard Anda.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-black text-xs font-bold"
          >
            + Buat Project Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(proj => {
            const isActive = activeProjectId === proj.id;

            return (
              <div
                key={proj.id}
                className={`rounded-2xl bg-[#121212] border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
                  isActive
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative h-32 bg-[#181818] overflow-hidden">
                    <img
                      src={proj.thumbnail}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      proj.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : proj.status === 'IN_PROGRESS' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/[0.1] text-white/60'
                    }`}>
                      {proj.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 font-['Space_Grotesk']">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {proj.description || 'Tidak ada deskripsi.'}
                    </p>
                    <div className="text-[10px] text-white/40 pt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Dibuat: {new Date(proj.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      showToast(`Project "${proj.name}" diset sebagai active project.`, 'SUCCESS');
                    }}
                    className={`text-xs font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                        : 'text-white/60 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{isActive ? 'Aktif di Workspace' : 'Pilih Project'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(proj)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                      title="Duplikasi Project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmProject(proj)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Buat Project Workspace Baru
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Nama Project *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Contoh: Kampanye Serum Viral TikTok"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Deskripsi Project</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Ringkasan brief kampanye konten, target audience, format output..."
                  className="w-full p-3 rounded-xl bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Status Awal</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DRAFT">Draft</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Membuat...' : 'Buat Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Edit Project Workspace
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Nama Project *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Deskripsi Project</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DRAFT">Draft</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs disabled:opacity-50"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Project?</h3>
              <p className="text-xs text-white/50 mt-1">
                Project "{deleteConfirmProject.name}" dan referensi terkait akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmProject(null)}
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
