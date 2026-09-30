import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Grid,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  FileDown,
  Layers,
  Film,
  Edit2,
  Plus,
  X,
  RotateCcw,
  Image as ImageIcon,
  Maximize2,
  FileImage,
  Bookmark,
} from 'lucide-react';
import { Character, Storyboard, StoryboardShot } from '../types';

export const StoryboardPage: React.FC = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  // Global references matching 33333333.JPG
  const [refImages, setRefImages] = useState<Record<string, string>>({
    karakter1: '',
    karakter2: '',
    outfit1: '',
    outfit2: '',
    tempat1: '',
    tempat2: '',
  });

  // Characters library
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);
  const [useSavedInfluencer, setUseSavedInfluencer] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  // Form Fields matching 33333333.JPG
  const [characterDescription, setCharacterDescription] = useState('');
  const [concept, setConcept] = useState('');
  const [shotsCount, setShotsCount] = useState(4);
  const [duration, setDuration] = useState('15');
  const [styleImg, setStyleImg] = useState('Realistic/Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Generation & Storyboard State
  const [isLoading, setIsLoading] = useState(false);
  const [activeStoryboard, setActiveStoryboard] = useState<Storyboard | null>(null);
  const [copiedShotPrompt, setCopiedShotPrompt] = useState<number | null>(null);

  // Visual Image Generation states
  const [generatingShotNumbers, setGeneratingShotNumbers] = useState<number[]>([]);
  const [isGeneratingAllShots, setIsGeneratingAllShots] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState('');
  const [isExportingSheet, setIsExportingSheet] = useState(false);

  // Modals
  const [editingShot, setEditingShot] = useState<StoryboardShot | null>(null);
  const [editAction, setEditAction] = useState('');
  const [editDialogue, setEditDialogue] = useState('');
  const [editAngle, setEditAngle] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPrompt, setEditPrompt] = useState('');

  const [deleteConfirmShot, setDeleteConfirmShot] = useState<number | null>(null);
  const [fullscreenShot, setFullscreenShot] = useState<StoryboardShot | null>(null);

  useEffect(() => {
    // Restore cached inputs
    try {
      const saved = localStorage.getItem('om_gio_storyboard_form');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.characterDescription) setCharacterDescription(p.characterDescription);
        if (p.concept) setConcept(p.concept);
        if (p.shotsCount) setShotsCount(p.shotsCount);
        if (p.duration) setDuration(p.duration);
        if (p.styleImg) setStyleImg(p.styleImg);
        if (p.aspectRatio) setAspectRatio(p.aspectRatio);
      }
    } catch {}

    api.getCharacters()
      .then(res => {
        setSavedCharacters(res.characters || []);
        if (res.characters?.length > 0) {
          setSelectedCharacterId(res.characters[0].id);
        }
      })
      .catch(() => {});

    // Load active or latest storyboard
    api.getStoryboards()
      .then(res => {
        if (res.storyboards?.length > 0) {
          setActiveStoryboard(res.storyboards[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Save form to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('om_gio_storyboard_form', JSON.stringify({
        characterDescription,
        concept,
        shotsCount,
        duration,
        styleImg,
        aspectRatio,
      }));
    } catch {}
  }, [characterDescription, concept, shotsCount, duration, styleImg, aspectRatio]);

  const handleResetForm = () => {
    setCharacterDescription('');
    setConcept('');
    setShotsCount(4);
    setDuration('15');
    setRefImages({
      karakter1: '',
      karakter2: '',
      outfit1: '',
      outfit2: '',
      tempat1: '',
      tempat2: '',
    });
    showToast('Form storyboard di-reset.', 'INFO');
  };

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRefImages(prev => ({ ...prev, [key]: reader.result as string }));
        showToast('Referensi visual berhasil diupload.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!concept.trim()) {
      showToast('Deskripsi Cerita/Konsep (WAJIB) harus diisi.', 'WARNING');
      return;
    }

    setIsLoading(true);
    try {
      const selectedChar = savedCharacters.find(c => c.id === selectedCharacterId);
      const res = await api.generateStoryboard({
        project_id: activeProjectId,
        concept,
        character_name: useSavedInfluencer && selectedChar ? selectedChar.name : '',
        character_description: useSavedInfluencer && selectedChar ? selectedChar.appearance_prompt : characterDescription,
        shots_count: shotsCount,
        duration: `${duration} detik`,
        style: styleImg,
        aspect_ratio: aspectRatio,
        use_saved_influencer: useSavedInfluencer,
      });

      // Save storyboard to DB
      const savedStb = await api.createStoryboard({
        project_id: activeProjectId,
        title: res.storyboard.title || `Storyboard: ${concept.substring(0, 30)}`,
        concept,
        character_name: useSavedInfluencer && selectedChar ? selectedChar.name : undefined,
        character_id: useSavedInfluencer ? selectedCharacterId : undefined,
        style: styleImg,
        aspect_ratio: aspectRatio,
        total_shots: res.storyboard.shots?.length || shotsCount,
        total_duration: `${duration} detik`,
        shots: res.storyboard.shots || [],
      });

      setActiveStoryboard(savedStb.storyboard);
      showToast('Storyboard AI Auto-Grid berhasil dirancang! Klik "Generate Visual" pada shot untuk membuat gambar.', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal merancang storyboard: ${err.message}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate visual image for a single shot
  const handleGenerateShotVisual = async (shot: StoryboardShot) => {
    if (!activeStoryboard) return;
    setGeneratingShotNumbers(prev => [...prev, shot.shot_number]);
    try {
      const promptToUse = shot.prompt || `${shot.action}, ${shot.camera_angle}, ${activeStoryboard.style}, cinematic 8k photorealistic`;
      const res = await api.generateImage(promptToUse, activeStoryboard.aspect_ratio || '16:9', activeStoryboard.style);

      const updatedShots = activeStoryboard.shots.map(s =>
        s.shot_number === shot.shot_number ? { ...s, image_url: res.imageUrl } : s
      );

      const updatedStoryboard = { ...activeStoryboard, shots: updatedShots };
      setActiveStoryboard(updatedStoryboard);

      try {
        await api.updateStoryboard(activeStoryboard.id, { shots: updatedShots });
      } catch {}

      showToast(`Gambar visual Shot #${shot.shot_number} berhasil dibuat!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal generate visual Shot #${shot.shot_number}: ${err.message}`, 'ERROR');
    } finally {
      setGeneratingShotNumbers(prev => prev.filter(num => num !== shot.shot_number));
    }
  };

  // Generate visual images for ALL shots sequentially
  const handleGenerateAllShotVisuals = async () => {
    if (!activeStoryboard || activeStoryboard.shots.length === 0) return;
    setIsGeneratingAllShots(true);
    let currentShots = [...activeStoryboard.shots];
    let successCount = 0;

    for (let i = 0; i < currentShots.length; i++) {
      const shot = currentShots[i];
      setGeneratingProgress(`Menghasilkan gambar Shot #${shot.shot_number} (${i + 1}/${currentShots.length})...`);
      setGeneratingShotNumbers(prev => [...prev, shot.shot_number]);

      try {
        const promptToUse = shot.prompt || `${shot.action}, ${shot.camera_angle}, ${activeStoryboard.style}, cinematic 8k photorealistic`;
        const res = await api.generateImage(promptToUse, activeStoryboard.aspect_ratio || '16:9', activeStoryboard.style);
        currentShots = currentShots.map(s =>
          s.shot_number === shot.shot_number ? { ...s, image_url: res.imageUrl } : s
        );
        setActiveStoryboard(prev => prev ? { ...prev, shots: currentShots } : null);
        successCount++;
      } catch (err) {
        console.warn(`Error generating visual for shot #${shot.shot_number}`, err);
      } finally {
        setGeneratingShotNumbers(prev => prev.filter(num => num !== shot.shot_number));
      }
    }

    try {
      await api.updateStoryboard(activeStoryboard.id, { shots: currentShots });
    } catch {}

    setIsGeneratingAllShots(false);
    setGeneratingProgress('');
    showToast(`Selesai! ${successCount} dari ${currentShots.length} visual shot berhasil digenerate.`, 'SUCCESS');
  };

  // Download individual shot image
  const handleDownloadShotImage = async (shot: StoryboardShot) => {
    if (!shot.image_url) {
      showToast('Belum ada gambar untuk shot ini. Silakan generate gambar terlebih dahulu.', 'WARNING');
      return;
    }

    try {
      const fileName = `${(activeStoryboard?.title || 'storyboard').toLowerCase().replace(/\s+/g, '_')}_shot_${shot.shot_number}.jpg`;
      if (shot.image_url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = shot.image_url;
        link.download = fileName;
        link.click();
      } else {
        const res = await fetch(shot.image_url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
      showToast(`Gambar Shot #${shot.shot_number} diunduh.`, 'SUCCESS');
    } catch {
      const link = document.createElement('a');
      link.href = shot.image_url;
      link.target = '_blank';
      link.download = `shot_${shot.shot_number}.jpg`;
      link.click();
      showToast(`Gambar Shot #${shot.shot_number} dibuka untuk diunduh.`, 'INFO');
    }
  };

  // Download all shot images
  const handleDownloadAllShotImages = async () => {
    if (!activeStoryboard || activeStoryboard.shots.length === 0) return;
    showToast(`Mengunduh ${activeStoryboard.shots.length} gambar shot...`, 'INFO');

    for (const shot of activeStoryboard.shots) {
      if (shot.image_url) {
        handleDownloadShotImage(shot);
        // Small interval to let browser trigger downloads safely
        await new Promise(r => setTimeout(r, 400));
      }
    }
  };

  // Save shot image to asset library
  const handleSaveShotToAsset = async (shot: StoryboardShot) => {
    if (!shot.image_url) return;
    try {
      await api.createAsset({
        project_id: activeProjectId,
        name: `Shot #${shot.shot_number} - ${activeStoryboard?.title || 'Storyboard'}`,
        category: 'STORYBOARD',
        url: shot.image_url,
        tags: ['storyboard', `shot-${shot.shot_number}`, activeStoryboard?.aspect_ratio || '16:9'],
      });
      showToast(`Gambar Shot #${shot.shot_number} disimpan ke Asset Library!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan asset: ${err.message}`, 'ERROR');
    }
  };

  // Export full production Storyboard Sheet as Composite Image (PNG)
  const handleExportStoryboardSheetImage = async () => {
    if (!activeStoryboard || activeStoryboard.shots.length === 0) return;
    setIsExportingSheet(true);
    showToast('Menyusun lembar produksi Storyboard Sheet Image...', 'INFO');

    try {
      const shots = activeStoryboard.shots;
      const cols = shots.length <= 4 ? shots.length : shots.length <= 6 ? 3 : 4;
      const rows = Math.ceil(shots.length / cols);

      const cardWidth = 440;
      const cardHeight = 370;
      const padding = 40;
      const gap = 24;
      const headerHeight = 160;

      const canvasWidth = padding * 2 + cols * cardWidth + (cols - 1) * gap;
      const canvasHeight = headerHeight + padding + rows * cardHeight + (rows - 1) * gap + 60;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D tidak didukung di browser ini.');

      // Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Decorative top gold line
      const goldGrad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
      goldGrad.addColorStop(0, '#D4AF37');
      goldGrad.addColorStop(0.5, '#F4C542');
      goldGrad.addColorStop(1, '#996515');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, canvasWidth, 6);

      // Header text
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('OM GIO AI CREATIVE DIRECTOR', padding, 55);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`STORYBOARD PRODUCTION BOARD: ${activeStoryboard.title}`, padding, 92);

      ctx.fillStyle = '#a3a3a3';
      ctx.font = '14px sans-serif';
      ctx.fillText(
        `Konsep: ${activeStoryboard.concept.substring(0, 80)}... | Style: ${activeStoryboard.style} | Rasio: ${activeStoryboard.aspect_ratio} | Durasi: ${activeStoryboard.total_duration}`,
        padding,
        122
      );

      // Load each image asynchronously
      const loadedImages: (HTMLImageElement | null)[] = [];
      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const ok = await new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = shot.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
        });
        loadedImages.push(ok ? img : null);
      }

      // Render cards
      shots.forEach((shot, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = padding + col * (cardWidth + gap);
        const y = headerHeight + padding + row * (cardHeight + gap);

        // Card background
        ctx.fillStyle = '#141414';
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeStyle = '#262626';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        // Shot image
        const imgHeight = 210;
        const img = loadedImages[idx];
        if (img && img.width > 0) {
          ctx.drawImage(img, x + 10, y + 10, cardWidth - 20, imgHeight);
        } else {
          ctx.fillStyle = '#1f1f1f';
          ctx.fillRect(x + 10, y + 10, cardWidth - 20, imgHeight);
        }

        // Shot badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x + 18, y + 18, 90, 26);
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`Shot #${shot.shot_number}`, x + 26, y + 36);

        // Angle tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x + cardWidth - 140, y + 18, 120, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText(shot.camera_angle.substring(0, 16), x + cardWidth - 132, y + 36);

        // Action text
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('ACTION & SCENE:', x + 14, y + imgHeight + 32);

        ctx.fillStyle = '#d4d4d4';
        ctx.font = '12px sans-serif';
        const actionText = shot.action.length > 55 ? shot.action.substring(0, 52) + '...' : shot.action;
        ctx.fillText(actionText, x + 14, y + imgHeight + 52);

        // Dialogue text
        if (shot.dialogue) {
          ctx.fillStyle = '#888888';
          ctx.font = 'italic 11px sans-serif';
          const diagText = `"${shot.dialogue.length > 50 ? shot.dialogue.substring(0, 47) + '...' : shot.dialogue}"`;
          ctx.fillText(diagText, x + 14, y + imgHeight + 74);
        }

        // Duration footer
        ctx.fillStyle = '#555555';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Durasi: ${shot.duration} | Gerakan: ${shot.camera_movement || 'Natural'}`, x + 14, y + cardHeight - 12);
      });

      // Watermark footer
      ctx.fillStyle = '#444444';
      ctx.font = '11px sans-serif';
      ctx.fillText('Generated by OM GIO AI CREATIVE DIRECTOR • Creative Production Studio', padding, canvasHeight - 20);

      // Download PNG
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `storyboard-sheet-${(activeStoryboard.title || 'project').toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();

      showToast('Lembar visual Storyboard Sheet (PNG) berhasil diunduh!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal membuat lembar gambar: ${err.message}`, 'ERROR');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const copyPrompt = (prompt: string, shotNum: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedShotPrompt(shotNum);
    showToast(`Prompt Shot #${shotNum} disalin ke clipboard!`, 'INFO');
    setTimeout(() => setCopiedShotPrompt(null), 2000);
  };

  const handleOpenEditShot = (shot: StoryboardShot) => {
    setEditingShot(shot);
    setEditAction(shot.action);
    setEditDialogue(shot.dialogue || '');
    setEditAngle(shot.camera_angle);
    setEditDuration(shot.duration);
    setEditPrompt(shot.prompt);
  };

  const handleSaveEditShot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShot || !activeStoryboard) return;

    const updatedShots = activeStoryboard.shots.map(s =>
      s.shot_number === editingShot.shot_number
        ? {
            ...s,
            action: editAction.trim(),
            dialogue: editDialogue.trim(),
            camera_angle: editAngle.trim(),
            duration: editDuration.trim(),
            prompt: editPrompt.trim(),
          }
        : s
    );

    try {
      const res = await api.updateStoryboard(activeStoryboard.id, {
        shots: updatedShots,
      });
      setActiveStoryboard(res.storyboard);
      setEditingShot(null);
      showToast(`Shot #${editingShot.shot_number} berhasil diperbarui.`, 'SUCCESS');
    } catch (err: any) {
      setActiveStoryboard({
        ...activeStoryboard,
        shots: updatedShots,
      });
      setEditingShot(null);
      showToast(`Shot #${editingShot.shot_number} diperbarui lokal.`, 'SUCCESS');
    }
  };

  const handleDuplicateShot = (shot: StoryboardShot) => {
    if (!activeStoryboard) return;
    const newShotNum = activeStoryboard.shots.length + 1;
    const newShot: StoryboardShot = {
      ...shot,
      shot_number: newShotNum,
      action: `${shot.action} (Variasi)`,
    };
    const updatedShots = [...activeStoryboard.shots, newShot];
    setActiveStoryboard({
      ...activeStoryboard,
      total_shots: updatedShots.length,
      shots: updatedShots,
    });
    showToast(`Shot #${shot.shot_number} diduplikasi menjadi Shot #${newShotNum}.`, 'INFO');
  };

  const handleDeleteShotConfirm = () => {
    if (!deleteConfirmShot || !activeStoryboard) return;
    const updatedShots = activeStoryboard.shots
      .filter(s => s.shot_number !== deleteConfirmShot)
      .map((s, idx) => ({ ...s, shot_number: idx + 1 }));

    setActiveStoryboard({
      ...activeStoryboard,
      total_shots: updatedShots.length,
      shots: updatedShots,
    });
    setDeleteConfirmShot(null);
    showToast(`Shot #${deleteConfirmShot} dihapus.`, 'INFO');
  };

  const handleExportJSON = () => {
    if (!activeStoryboard) return;
    const blob = new Blob([JSON.stringify(activeStoryboard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File JSON Storyboard diunduh.', 'INFO');
  };

  const handleExportSummary = () => {
    if (!activeStoryboard) return;
    let text = `=== OM GIO AI CREATIVE DIRECTOR: STORYBOARD PRODUCTION GRID ===\n`;
    text += `JUDUL: ${activeStoryboard.title}\n`;
    text += `KONSEP: ${activeStoryboard.concept}\n`;
    text += `STYLE: ${activeStoryboard.style} | ASPECT RATIO: ${activeStoryboard.aspect_ratio}\n`;
    text += `TOTAL DURASI: ${activeStoryboard.total_duration} | TOTAL SHOT: ${activeStoryboard.total_shots}\n\n`;

    activeStoryboard.shots.forEach(s => {
      text += `--- SHOT #${s.shot_number} (${s.duration}) ---\n`;
      text += `CAMERA: ${s.camera_angle} - ${s.camera_movement || 'Natural'}\n`;
      text += `AKSI: ${s.action}\n`;
      if (s.dialogue) text += `DIALOG: "${s.dialogue}"\n`;
      if (s.lighting) text += `LIGHTING: ${s.lighting}\n`;
      text += `AI PROMPT: ${s.prompt}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard-summary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Ringkasan naskah produksi diunduh.', 'INFO');
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header matching screenshot 33333333.JPG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Storyboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              GENERATOR
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Rancang kisi adegan dan hasilkan visual shot storyboard beresolusi tinggi dengan AI.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetForm}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white/40" />
            <span>Reset Input</span>
          </button>

          {activeStoryboard && (
            <>
              {/* Export Storyboard Sheet PNG Image */}
              <button
                onClick={handleExportStoryboardSheetImage}
                disabled={isExportingSheet}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                title="Download lembar gambar storyboard lengkap (Sheet PNG)"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>{isExportingSheet ? 'Menyusun...' : 'Unduh Storyboard Sheet (Image)'}</span>
              </button>

              <button
                onClick={handleDownloadAllShotImages}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/[0.08]"
                title="Unduh seluruh file gambar shot satu per satu"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Unduh Semua Gambar</span>
              </button>

              <button
                onClick={handleExportSummary}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/[0.08]"
              >
                <FileDown className="w-3.5 h-3.5 text-white/60" />
                <span>Export TXT</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/[0.08]"
              >
                <Download className="w-3.5 h-3.5 text-white/60" />
                <span>JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* GAMBAR REFERENSI GLOBAL matching screenshot 33333333.JPG */}
      <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 space-y-4">
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
          GAMBAR REFERENSI GLOBAL
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { key: 'karakter1', label: 'Karakter 1' },
            { key: 'karakter2', label: 'Karakter 2' },
            { key: 'outfit1', label: 'Outfit 1' },
            { key: 'outfit2', label: 'Outfit 2' },
            { key: 'tempat1', label: 'Tempat 1' },
            { key: 'tempat2', label: 'Tempat 2' },
          ].map(slot => (
            <div key={slot.key} className="rounded-xl border border-white/[0.08] bg-[#161616] p-2.5 text-center min-h-[90px] flex flex-col justify-center items-center">
              <span className="text-[10px] text-white/60 mb-1.5 font-medium">{slot.label}</span>
              {refImages[slot.key] ? (
                <div className="relative w-full h-14 rounded-lg overflow-hidden group">
                  <img src={refImages[slot.key]} alt={slot.label} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setRefImages(prev => ({ ...prev, [slot.key]: '' }))}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-white/30 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleRefUpload(e, slot.key)} className="hidden" />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inputs Form matching screenshot 33333333.JPG */}
      <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 space-y-4">
        {/* Toggle & Character Select matching 33333333.JPG */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-[#161616] border border-white/[0.06]">
          <label className="flex items-center gap-2.5 text-xs text-white/80 cursor-pointer">
            <input
              type="checkbox"
              checked={useSavedInfluencer}
              onChange={e => setUseSavedInfluencer(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
            />
            <span className="font-semibold text-white">Pakai Karakter AI Influencer Tersimpan</span>
          </label>

          {useSavedInfluencer && (
            <select
              value={selectedCharacterId}
              onChange={e => setSelectedCharacterId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#D4AF37]/40 text-xs text-[#D4AF37] focus:outline-none"
            >
              {savedCharacters.map(char => (
                <option key={char.id} value={char.id}>
                  {char.name} ({char.style})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Textareas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Deskripsi Karakter Bebas
            </label>
            <textarea
              rows={3}
              value={characterDescription}
              onChange={e => setCharacterDescription(e.target.value)}
              placeholder="Gambarkan karakter secara detail jika tidak memakai influencer tersimpan..."
              className="w-full p-3 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Deskripsi Cerita/Konsep (WAJIB) *
            </label>
            <textarea
              rows={3}
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="Contoh: Seorang wanita muda sedang terburu-buru bersiap berangkat ke kantor, lalu menemukan serum ajaib..."
              required
              className="w-full p-3 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Sliders and Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/70 font-semibold">Jumlah Shot</span>
              <span className="font-bold text-[#D4AF37]">{shotsCount} shot</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={shotsCount}
              onChange={e => setShotsCount(parseInt(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/70 font-semibold">Durasi Video</span>
              <span className="font-bold text-[#D4AF37]">{duration} detik</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Style Gambar</label>
            <select
              value={styleImg}
              onChange={e => setStyleImg(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              <option>Realistic/Photorealistic</option>
              <option>Cinematic Film</option>
              <option>Anime / Manga 4K</option>
              <option>3D Animation Pixar</option>
              <option>Cyberpunk Neon</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Aspek Rasio</label>
            <select
              value={aspectRatio}
              onChange={e => setAspectRatio(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="16:9">16:9 (Landscape YouTube)</option>
              <option value="9:16">9:16 (Vertical TikTok/Reels)</option>
              <option value="1:1">1:1 (Square Feed)</option>
              <option value="4:3">4:3 (Classic TV)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Merancang Kisi Storyboard dengan AI...</span>
            </>
          ) : (
            <>
              <Grid className="w-4 h-4 text-black" />
              <span>Generate Storyboard (AI Auto-Grid)</span>
            </>
          )}
        </button>
      </div>

      {/* Auto-Grid Storyboard Cards Showcase */}
      {activeStoryboard && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141414] border border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Film className="w-4 h-4 text-[#D4AF37]" />
                <span>{activeStoryboard.title} ({activeStoryboard.shots?.length} Shot)</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Rasio: {activeStoryboard.aspect_ratio} • Total Durasi: {activeStoryboard.total_duration} • Style: {activeStoryboard.style}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Batch generate all visuals */}
              <button
                onClick={handleGenerateAllShotVisuals}
                disabled={isGeneratingAllShots}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                title="Generate gambar visual untuk semua shot adegan secara otomatis"
              >
                {isGeneratingAllShots ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{generatingProgress || 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Semua Visual Shot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grid of shots */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeStoryboard.shots.map(shot => {
              const isShotGenerating = generatingShotNumbers.includes(shot.shot_number);

              return (
                <div
                  key={shot.shot_number}
                  className="rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all overflow-hidden flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    {/* Shot Header */}
                    <div className="p-3 bg-[#161616] border-b border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#D4AF37]">Shot #{shot.shot_number}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-white/70 font-mono">
                          {shot.duration}
                        </span>
                        <button
                          onClick={() => handleOpenEditShot(shot)}
                          className="p-1 rounded hover:bg-white/[0.1] text-white/50 hover:text-white"
                          title="Edit Shot"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDuplicateShot(shot)}
                          className="p-1 rounded hover:bg-white/[0.1] text-white/50 hover:text-[#D4AF37]"
                          title="Duplikasi Shot"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmShot(shot.shot_number)}
                          className="p-1 rounded hover:bg-rose-500/20 text-white/50 hover:text-rose-400"
                          title="Hapus Shot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Shot Visual Frame */}
                    <div className="relative aspect-video bg-black/60 overflow-hidden group">
                      <img
                        src={shot.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                        alt={`Shot ${shot.shot_number}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Camera Angle Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] text-white/90 font-mono border border-white/10">
                        {shot.camera_angle}
                      </div>

                      {/* Image Action Buttons Overlay on Hover */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setFullscreenShot(shot)}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white hover:text-[#D4AF37] transition-colors"
                          title="Lihat Fullscreen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadShotImage(shot)}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white hover:text-[#D4AF37] transition-colors"
                          title="Unduh Gambar Shot Ini"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSaveShotToAsset(shot)}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white hover:text-[#D4AF37] transition-colors"
                          title="Simpan ke Asset Library"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Loading indicator if this shot is generating */}
                      {isShotGenerating && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                          <span className="text-[11px] font-semibold text-white/90">Merender Gambar AI...</span>
                        </div>
                      )}
                    </div>

                    {/* Direct Visual Generate Bar */}
                    <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-white/[0.04] bg-[#141414]">
                      <button
                        onClick={() => handleGenerateShotVisual(shot)}
                        disabled={isShotGenerating}
                        className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
                        title="Generate gambar visual khusus adegan ini menggunakan AI"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isShotGenerating ? 'animate-spin' : ''}`} />
                        <span>{shot.image_url ? 'Regenerate Gambar' : 'Generate Visual AI'}</span>
                      </button>

                      {shot.image_url && (
                        <button
                          onClick={() => handleDownloadShotImage(shot)}
                          className="text-[10px] text-white/50 hover:text-white flex items-center gap-1"
                          title="Unduh file gambar shot ini"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh</span>
                        </button>
                      )}
                    </div>

                    {/* Shot Info */}
                    <div className="p-3 space-y-2 text-xs">
                      <div>
                        <div className="text-[10px] font-semibold text-white/40 uppercase">Action & Scene</div>
                        <p className="text-white/80 text-[11px] leading-relaxed mt-0.5 line-clamp-3">
                          {shot.action}
                        </p>
                      </div>

                      {shot.dialogue && (
                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-[9px] font-semibold text-[#D4AF37] uppercase">Dialog / VO</div>
                          <p className="text-white/70 italic text-[11px] mt-0.5 font-serif line-clamp-2">
                            "{shot.dialogue}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Copy Prompt */}
                  <div className="p-3 pt-0 border-t border-white/[0.04] mt-2">
                    <button
                      onClick={() => copyPrompt(shot.prompt, shot.shot_number)}
                      className="w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#D4AF37]/10 text-white/70 hover:text-[#D4AF37] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedShotPrompt === shot.shot_number ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedShotPrompt === shot.shot_number ? 'Tersalin' : 'Copy Prompt Shot'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Shot Modal */}
      {editingShot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setEditingShot(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
              Edit Shot #{editingShot.shot_number}
            </h3>

            <form onSubmit={handleSaveEditShot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Durasi</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={e => setEditDuration(e.target.value)}
                    placeholder="3s"
                    className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Camera Angle</label>
                  <input
                    type="text"
                    value={editAngle}
                    onChange={e => setEditAngle(e.target.value)}
                    placeholder="Medium Close Up"
                    className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Aksi & Scene *</label>
                <textarea
                  rows={3}
                  value={editAction}
                  onChange={e => setEditAction(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Dialog / Voice Over</label>
                <input
                  type="text"
                  value={editDialogue}
                  onChange={e => setEditDialogue(e.target.value)}
                  placeholder="Ketik narasi jika ada..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-white/[0.08] text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">AI Prompt Frame</label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#161616] border border-white/[0.08] text-white font-mono text-[11px] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingShot(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:brightness-110 text-black font-bold"
                >
                  Simpan Shot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Shot Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmShot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Shot #{deleteConfirmShot}?</h3>
              <p className="text-xs text-white/50 mt-1">Shot ini akan dihapus dari kisi storyboard Anda.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmShot(null)}
                className="w-1/2 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteShotConfirm}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Shot Image Modal */}
      {fullscreenShot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          onClick={() => setFullscreenShot(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setFullscreenShot(null)}
              className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={fullscreenShot.image_url || ''}
              alt={`Shot ${fullscreenShot.shot_number}`}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />

            <div className="w-full mt-4 p-4 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#D4AF37]">Shot #{fullscreenShot.shot_number}</span>
                <span className="text-white/40 ml-2">({fullscreenShot.camera_angle})</span>
                <p className="text-white/80 mt-1 text-[11px]">{fullscreenShot.action}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadShotImage(fullscreenShot)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Gambar</span>
                </button>
                <button
                  onClick={() => handleSaveShotToAsset(fullscreenShot)}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:brightness-110 text-black font-bold flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Simpan ke Asset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
