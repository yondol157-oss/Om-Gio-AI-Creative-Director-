import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Download,
  Check,
  Edit2,
  Layers,
  Video,
  Grid,
  Camera,
  MessageSquare,
  UserCheck,
  StickyNote,
  Maximize2,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export interface CanvasNode {
  id: string;
  type: 'concept' | 'character' | 'camera' | 'script' | 'note' | 'asset';
  title: string;
  content: string;
  tag?: string;
  color?: string;
}

interface PemilikCanvasPageProps {
  onNavigate?: (tab: string) => void;
}

export const PemilikCanvasPage: React.FC<PemilikCanvasPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, isPro, setShowProUpgradeModal, activeProjectId } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'canvas' | 'owner-metrics' | 'compiled'>('canvas');

  // Canvas Nodes State with local persistence
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: 'node_1',
      type: 'concept',
      title: 'Hook 3 Detik: Formula Masalah & Penasaran',
      content: 'Karakter memegang produk serum dengan ekspresi kaget menatap kamera. Text overlay: "STOP jangan beli serum ini sebelum tahu efek sampingnya!"',
      tag: 'HOOK VIRAL',
      color: '#D4AF37',
    },
    {
      id: 'node_2',
      type: 'character',
      title: 'Persona: Neng Aitha (24 Thn)',
      content: 'Wajah oval khas Indonesia, kulit terang mulus, rambut panjang terurai rapi, outfit smart casual blazer pastel, vibe ramah dan meyakinkan.',
      tag: 'CHARACTER DNA',
      color: '#A855F7',
    },
    {
      id: 'node_3',
      type: 'camera',
      title: 'Camera Direction: Medium Close Up + Push In',
      content: 'Sudut kamera Eye Level perlahan bergerak push-in mendekat ke wajah karakter untuk membangun intimacy dan rasa percaya audiens.',
      tag: 'CINEMATOGRAPHY',
      color: '#38BDF8',
    },
    {
      id: 'node_4',
      type: 'script',
      title: 'Voice-Over: Edukasi & Rekomendasi',
      content: '"Kulit kusam gara-gara begadang? Aku nemu formula retinol gentle yang langsung bikin glowing semalaman tanpa bikin iritasi."',
      tag: 'VOICE OVER',
      color: '#34D399',
    },
    {
      id: 'node_5',
      type: 'note',
      title: 'Catatan Director: Closing Keranjang Kuning',
      content: 'Pastikan thumbnail video memperlihatkan tekstur serum tetes mikro 8K agar click-through rate (CTR) affiliate naik 40%.',
      tag: 'DIRECTOR NOTE',
      color: '#F59E0B',
    },
  ]);

  // Modal State for Adding/Editing Node
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeType, setNodeType] = useState<CanvasNode['type']>('concept');
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeContent, setNodeContent] = useState('');
  const [nodeTag, setNodeTag] = useState('');

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compilation state
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [copiedCompiled, setCopiedCompiled] = useState(false);

  // Owner studio stats
  const [studioStats, setStudioStats] = useState({
    projectsCount: 0,
    assetsCount: 0,
    promptsCount: 0,
    charactersCount: 0,
  });

  // Load saved canvas from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('om_gio_pemilik_canvas_nodes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNodes(parsed);
        }
      }
    } catch {}

    // Load metrics
    Promise.all([
      api.getProjects().catch(() => ({ projects: [] })),
      api.getAssets().catch(() => ({ assets: [] })),
      api.getPrompts().catch(() => ({ prompts: [] })),
      api.getCharacters().catch(() => ({ characters: [] })),
    ]).then(([p, a, pr, c]) => {
      setStudioStats({
        projectsCount: p.projects?.length || 0,
        assetsCount: a.assets?.length || 0,
        promptsCount: pr.prompts?.length || 0,
        charactersCount: c.characters?.length || 0,
      });
    });
  }, []);

  const saveNodesToStorage = (updatedNodes: CanvasNode[]) => {
    setNodes(updatedNodes);
    try {
      localStorage.setItem('om_gio_pemilik_canvas_nodes', JSON.stringify(updatedNodes));
    } catch {}
  };

  const handleOpenAddNode = () => {
    setEditingNodeId(null);
    setNodeType('concept');
    setNodeTitle('');
    setNodeContent('');
    setNodeTag('CONCEPT');
    setShowNodeModal(true);
  };

  const handleOpenEditNode = (node: CanvasNode) => {
    setEditingNodeId(node.id);
    setNodeType(node.type);
    setNodeTitle(node.title);
    setNodeContent(node.content);
    setNodeTag(node.tag || '');
    setShowNodeModal(true);
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeTitle.trim() || !nodeContent.trim()) {
      showToast('Judul dan isi kartu node wajib diisi.', 'WARNING');
      return;
    }

    const typeColors: Record<string, string> = {
      concept: '#D4AF37',
      character: '#A855F7',
      camera: '#38BDF8',
      script: '#34D399',
      note: '#F59E0B',
      asset: '#EC4899',
    };

    if (editingNodeId) {
      const updated = nodes.map(n =>
        n.id === editingNodeId
          ? {
              ...n,
              type: nodeType,
              title: nodeTitle.trim(),
              content: nodeContent.trim(),
              tag: nodeTag.trim() || nodeType.toUpperCase(),
              color: typeColors[nodeType],
            }
          : n
      );
      saveNodesToStorage(updated);
      showToast('Kartu node canvas berhasil diperbarui.', 'SUCCESS');
    } else {
      const newNode: CanvasNode = {
        id: 'node_' + Date.now(),
        type: nodeType,
        title: nodeTitle.trim(),
        content: nodeContent.trim(),
        tag: nodeTag.trim() || nodeType.toUpperCase(),
        color: typeColors[nodeType],
      };
      saveNodesToStorage([...nodes, newNode]);
      showToast('Kartu node baru ditambahkan ke canvas.', 'SUCCESS');
    }

    setShowNodeModal(false);
  };

  const handleDuplicateNode = (node: CanvasNode) => {
    const copyNode: CanvasNode = {
      ...node,
      id: 'node_' + Date.now(),
      title: `${node.title} (Salinan)`,
    };
    saveNodesToStorage([...nodes, copyNode]);
    showToast('Kartu node berhasil diduplikasi.', 'INFO');
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter(n => n.id !== id);
    saveNodesToStorage(updated);
    setDeleteConfirmId(null);
    showToast('Kartu node dihapus dari canvas.', 'INFO');
  };

  const handleClearCanvas = () => {
    saveNodesToStorage([]);
    showToast('Canvas dikosongkan.', 'INFO');
  };

  const handleResetPreset = () => {
    const presetNodes: CanvasNode[] = [
      {
        id: 'node_' + Date.now() + '_1',
        type: 'concept',
        title: 'Hook 3 Detik: Formula Masalah & Penasaran',
        content: 'Karakter memegang produk serum dengan ekspresi kaget menatap kamera. Text overlay: "STOP jangan beli serum ini sebelum tahu efek sampingnya!"',
        tag: 'HOOK VIRAL',
        color: '#D4AF37',
      },
      {
        id: 'node_' + Date.now() + '_2',
        type: 'character',
        title: 'Persona: Neng Aitha (24 Thn)',
        content: 'Wajah oval khas Indonesia, kulit terang mulus, rambut panjang terurai rapi, outfit smart casual blazer pastel, vibe ramah dan meyakinkan.',
        tag: 'CHARACTER DNA',
        color: '#A855F7',
      },
      {
        id: 'node_' + Date.now() + '_3',
        type: 'camera',
        title: 'Camera Direction: Medium Close Up + Push In',
        content: 'Sudut kamera Eye Level perlahan bergerak push-in mendekat ke wajah karakter untuk membangun intimacy dan rasa percaya audiens.',
        tag: 'CINEMATOGRAPHY',
        color: '#38BDF8',
      },
      {
        id: 'node_' + Date.now() + '_4',
        type: 'script',
        title: 'Voice-Over: Edukasi & Rekomendasi',
        content: '"Kulit kusam gara-gara begadang? Aku nemu formula retinol gentle yang langsung bikin glowing semalaman tanpa bikin iritasi."',
        tag: 'VOICE OVER',
        color: '#34D399',
      },
      {
        id: 'node_' + Date.now() + '_5',
        type: 'note',
        title: 'Catatan Director: Closing Keranjang Kuning',
        content: 'Pastikan thumbnail video memperlihatkan tekstur serum tetes mikro 8K agar click-through rate (CTR) affiliate naik 40%.',
        tag: 'DIRECTOR NOTE',
        color: '#F59E0B',
      },
    ];
    saveNodesToStorage(presetNodes);
    showToast('Preset Creative Director berhasil dimuat.', 'SUCCESS');
  };

  // Compile canvas cards into unified production master prompt
  const handleCompileCanvas = () => {
    if (nodes.length === 0) {
      showToast('Canvas masih kosong. Tambahkan node terlebih dahulu.', 'WARNING');
      return;
    }

    setIsCompiling(true);
    let prompt = `=== OM GIO AI CREATIVE DIRECTOR: MASTER PRODUCTION BRIEF ===\n`;
    prompt += `TANGGAL: ${new Date().toLocaleDateString('id-ID')} | STATUS: APPROVED BY OWNER CANVAS\n\n`;

    const concepts = nodes.filter(n => n.type === 'concept');
    const characters = nodes.filter(n => n.type === 'character');
    const cameras = nodes.filter(n => n.type === 'camera');
    const scripts = nodes.filter(n => n.type === 'script');
    const notes = nodes.filter(n => n.type === 'note' || n.type === 'asset');

    if (concepts.length > 0) {
      prompt += `[1. KONSEP & HOOK UTAMA]\n`;
      concepts.forEach(c => (prompt += `• ${c.title}: ${c.content}\n`));
      prompt += `\n`;
    }

    if (characters.length > 0) {
      prompt += `[2. KARAKTER & DNA VISUAL]\n`;
      characters.forEach(c => (prompt += `• ${c.title}: ${c.content}\n`));
      prompt += `\n`;
    }

    if (cameras.length > 0) {
      prompt += `[3. SINEMATOGRAFI & KAMERA]\n`;
      cameras.forEach(c => (prompt += `• ${c.title}: ${c.content}\n`));
      prompt += `\n`;
    }

    if (scripts.length > 0) {
      prompt += `[4. NASKAH & SUARA NARASI (VO)]\n`;
      scripts.forEach(c => (prompt += `• ${c.title}: ${c.content}\n`));
      prompt += `\n`;
    }

    if (notes.length > 0) {
      prompt += `[5. CATATAN TEKNIS & CTA DIRECTOR]\n`;
      notes.forEach(c => (prompt += `• ${c.title}: ${c.content}\n`));
      prompt += `\n`;
    }

    prompt += `[PROMPT SINTESIS STUDIO]\n`;
    prompt += `Cinematic UGC commercial, highly photorealistic 8K, commercial studio grade lighting, character consistency DNA locked, dynamic camera pacing, clean color grading --ar 16:9 --v 6.0`;

    setCompiledPrompt(prompt);
    setActiveTab('compiled');
    setIsCompiling(false);
    showToast('Canvas berhasil dikompilasi menjadi Master Production Prompt!', 'SUCCESS');
  };

  const handleCopyCompiled = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopiedCompiled(true);
    showToast('Master Prompt berhasil disalin ke clipboard!', 'SUCCESS');
    setTimeout(() => setCopiedCompiled(false), 2000);
  };

  const handleDownloadCompiled = () => {
    const blob = new Blob([compiledPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pemilik-canvas-master-prompt-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File Master Prompt diunduh.', 'INFO');
  };

  const handleSaveToPromptLibrary = async () => {
    if (!compiledPrompt) return;
    try {
      await api.createPrompt({
        project_id: activeProjectId,
        title: `Pemilik Canvas: Master Brief ${new Date().toLocaleDateString('id-ID')}`,
        category: 'GENERAL',
        content: compiledPrompt,
        tags: ['pemilik-canvas', 'director-brief', 'compiled'],
      });
      showToast('Master Brief berhasil disimpan ke Prompt Library!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message}`, 'ERROR');
    }
  };

  const getNodeIcon = (type: CanvasNode['type']) => {
    switch (type) {
      case 'concept':
        return <Sparkles className="w-4 h-4 text-[#D4AF37]" />;
      case 'character':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-sky-400" />;
      case 'script':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'note':
        return <StickyNote className="w-4 h-4 text-amber-400" />;
      case 'asset':
        return <Layers className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk'] flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />
              <span>Pemilik Canvas</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              OWNER DASHBOARD & CANVAS
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Studio papan visual konseptual & pusat kendali creative director untuk merajut ide, karakter, kamera, dan naskah.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetPreset}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-semibold border border-white/[0.08] transition-colors"
          >
            Reset Preset
          </button>
          <button
            onClick={handleOpenAddNode}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Tambah Node Kartu</span>
          </button>
          <button
            onClick={handleCompileCanvas}
            disabled={isCompiling || nodes.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Kompilasi Master Prompt</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex p-1 bg-[#121212] rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'canvas' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Papan Canvas ({nodes.length} Kartu)
          </button>
          <button
            onClick={() => setActiveTab('compiled')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'compiled' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Master Prompt Terkompilasi
          </button>
          <button
            onClick={() => setActiveTab('owner-metrics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'owner-metrics' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Status Ekosistem Studio
          </button>
        </div>

        {isAdmin && onNavigate && (
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>Buka Admin Master Control</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tab 1: Papan Canvas Interaktif */}
      {activeTab === 'canvas' && (
        <div className="space-y-6">
          {nodes.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-12 text-center text-white/40">
              <Grid className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-white/20" />
              <h4 className="text-sm font-semibold text-white/70">Canvas masih kosong</h4>
              <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto mb-4">
                Mulai susun ide konsep video, karakter persona, sudut kamera, dan naskah narasi di kanvas kreatif Anda.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleResetPreset}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold"
                >
                  Muat Preset Contoh
                </button>
                <button
                  onClick={handleOpenAddNode}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-black text-xs font-bold"
                >
                  + Tambah Kartu Pertama
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nodes.map(node => (
                <div
                  key={node.id}
                  className="rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all p-5 flex flex-col justify-between shadow-lg group relative overflow-hidden"
                >
                  {/* Accent border top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: node.color || '#D4AF37' }}
                  />

                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-3 pt-1">
                      <div className="flex items-center gap-2">
                        {getNodeIcon(node.type)}
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${node.color || '#D4AF37'}20`,
                            color: node.color || '#D4AF37',
                          }}
                        >
                          {node.tag || node.type}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditNode(node)}
                          className="p-1 rounded-md hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors"
                          title="Edit Kartu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateNode(node)}
                          className="p-1 rounded-md hover:bg-white/[0.06] text-white/50 hover:text-[#D4AF37] transition-colors"
                          title="Duplikasi Kartu"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(node.id)}
                          className="p-1 rounded-md hover:bg-rose-500/10 text-white/50 hover:text-rose-400 transition-colors"
                          title="Hapus Kartu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] leading-snug mb-2">
                      {node.title}
                    </h3>

                    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                      {node.content}
                    </p>
                  </div>

                  {/* Footer Quick Action */}
                  <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/40">
                    <span className="font-mono text-[10px]">Tipe: {node.type}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${node.title}\n${node.content}`);
                        showToast('Isi kartu disalin!', 'INFO');
                      }}
                      className="text-[10px] text-[#D4AF37] hover:underline"
                    >
                      Salin Konten
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {nodes.length > 0 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleClearCanvas}
                className="text-xs text-rose-400/80 hover:text-rose-300 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Seluruh Canvas</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Master Prompt Terkompilasi */}
      {activeTab === 'compiled' && (
        <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Master Production Brief (AI Ready)</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Hasil sintesis seluruh kartu node di kanvas Anda menjadi satu paket naskah komprehensif.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCompiled}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08]"
              >
                {copiedCompiled ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCompiled ? 'Tersalin' : 'Copy All'}</span>
              </button>
              <button
                onClick={handleDownloadCompiled}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>
              <button
                onClick={handleSaveToPromptLibrary}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black text-xs font-bold transition-all shadow-md"
              >
                Simpan ke Library
              </button>
            </div>
          </div>

          {!compiledPrompt ? (
            <div className="text-center py-10 text-white/40">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-xs">Klik tombol "Kompilasi Master Prompt" di bagian atas untuk menyatukan kartu kanvas.</p>
              <button
                onClick={handleCompileCanvas}
                className="mt-3 px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
              >
                Kompilasi Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                rows={14}
                value={compiledPrompt}
                onChange={e => setCompiledPrompt(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#161616] border border-white/[0.08] text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-[11px] text-white/40">
                Tip: Anda dapat mengedit teks di atas secara langsung sebelum menyalin atau mengunduh.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Status Ekosistem Studio */}
      {activeTab === 'owner-metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Active Projects</span>
              <div className="text-2xl font-black text-white font-['Space_Grotesk']">{studioStats.projectsCount}</div>
              <span className="text-[11px] text-white/50">Kampanye konten berjalan</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Production Assets</span>
              <div className="text-2xl font-black text-[#D4AF37] font-['Space_Grotesk']">{studioStats.assetsCount}</div>
              <span className="text-[11px] text-white/50">Foto produk & referensi</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Prompt Library</span>
              <div className="text-2xl font-black text-sky-300 font-['Space_Grotesk']">{studioStats.promptsCount}</div>
              <span className="text-[11px] text-white/50">Naskah tersimpan</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">AI Personas</span>
              <div className="text-2xl font-black text-purple-300 font-['Space_Grotesk']">{studioStats.charactersCount}</div>
              <span className="text-[11px] text-white/50">Karakter konsisten aktif</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Status Server & Engine AI Studio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-white/40 uppercase text-[10px] font-bold">Text Generation Engine</div>
                <div className="text-white font-mono text-sm mt-1">gemini-3.8-flash</div>
                <div className="text-emerald-400 text-[11px] mt-1 font-semibold">Ready & Optimized</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-white/40 uppercase text-[10px] font-bold">Image Rendering Engine</div>
                <div className="text-white font-mono text-sm mt-1">gemini-3.1-flash-lite-image</div>
                <div className="text-emerald-400 text-[11px] mt-1 font-semibold">Active Studio Model</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-white/40 uppercase text-[10px] font-bold">Payment Gateway</div>
                <div className="text-white font-mono text-sm mt-1">Lynk.id Webhook & Instant Verification</div>
                <div className="text-[#D4AF37] text-[11px] mt-1 font-semibold">PRO Lifetime Enabled</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Node Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              {editingNodeId ? 'Edit Kartu Canvas' : 'Tambah Kartu Canvas Baru'}
            </h3>

            <form onSubmit={handleSaveNode} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Tipe Kartu</label>
                  <select
                    value={nodeType}
                    onChange={e => setNodeType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="concept">Konsep & Hook</option>
                    <option value="character">Karakter Persona</option>
                    <option value="camera">Sudut & Kamera</option>
                    <option value="script">Naskah & Narasi</option>
                    <option value="note">Catatan Director</option>
                    <option value="asset">Aset Visual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={nodeTag}
                    onChange={e => setNodeTag(e.target.value)}
                    placeholder="Contoh: HOOK VIRAL"
                    className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Judul Kartu *</label>
                <input
                  type="text"
                  value={nodeTitle}
                  onChange={e => setNodeTitle(e.target.value)}
                  placeholder="Contoh: Hook 3 Detik Pembuka..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Isi Konten & Instruksi *</label>
                <textarea
                  rows={4}
                  value={nodeContent}
                  onChange={e => setNodeContent(e.target.value)}
                  placeholder="Detail ide, instruksi visual, dialog narasi, atau parameter kamera..."
                  required
                  className="w-full p-3 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNodeModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold"
                >
                  {editingNodeId ? 'Simpan Perubahan' : 'Tambahkan ke Canvas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Kartu Canvas?</h3>
              <p className="text-xs text-white/50 mt-1">Kartu node ini akan dihapus dari papan canvas aktif Anda.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteNode(deleteConfirmId)}
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
