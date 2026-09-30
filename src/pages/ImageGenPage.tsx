import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Download,
  Trash2,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Bookmark,
  Layers,
  X,
  RotateCcw,
} from 'lucide-react';

export const ImageGenPage: React.FC = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  const [activeMode, setActiveMode] = useState<'First Frame' | 'Gambar Umum' | 'Image Variation' | 'Image-to-Image'>('First Frame');

  // References
  const [charImg, setCharImg] = useState<string>('');
  const [outfitImg, setOutfitImg] = useState<string>('');
  const [locationImg, setLocationImg] = useState<string>('');
  const [productImgs, setProductImgs] = useState<string[]>([]);

  // Inputs
  const [styleImg, setStyleImg] = useState('Realistic/Photorealistic');
  const [poseChar, setPoseChar] = useState('Berdiri Rileks');
  const [angleCamera, setAngleCamera] = useState('Medium Shot');
  const [expressionChar, setExpressionChar] = useState('Tersenyum Natural');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Generation & History State
  const [isLoading, setIsLoading] = useState(false);
  const [historyFrames, setHistoryFrames] = useState<Array<{ id: string; url: string; prompt: string; ratio: string; createdAt: string }>>([]);
  const [activeFrame, setActiveFrame] = useState<{ id: string; url: string; prompt: string; ratio: string } | null>(null);

  // Modals
  const [fullscreenFrame, setFullscreenFrame] = useState<{ id: string; url: string; prompt: string; ratio: string } | null>(null);
  const [deleteConfirmFrame, setDeleteConfirmFrame] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    // Restore cached inputs
    try {
      const saved = localStorage.getItem('om_gio_image_gen_form');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.activeMode) setActiveMode(p.activeMode);
        if (p.styleImg) setStyleImg(p.styleImg);
        if (p.poseChar) setPoseChar(p.poseChar);
        if (p.angleCamera) setAngleCamera(p.angleCamera);
        if (p.expressionChar) setExpressionChar(p.expressionChar);
        if (p.aspectRatio) setAspectRatio(p.aspectRatio);
        if (p.additionalNotes) setAdditionalNotes(p.additionalNotes);
      }
    } catch {}

    // Load existing generated images from generations
    api.getGenerations('IMAGE_GEN', 10)
      .then(res => {
        const frames = (res.generations || [])
          .filter(g => g.result_data?.imageUrl)
          .map(g => ({
            id: g.id,
            url: g.result_data.imageUrl,
            prompt: g.result_data.prompt || g.prompt_input?.prompt || 'AI Frame',
            ratio: g.prompt_input?.aspect_ratio || '16:9',
            createdAt: g.created_at,
          }));
        setHistoryFrames(frames);
        if (frames.length > 0) setActiveFrame(frames[0]);
      })
      .catch(() => {});
  }, []);

  // Save inputs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('om_gio_image_gen_form', JSON.stringify({
        activeMode,
        styleImg,
        poseChar,
        angleCamera,
        expressionChar,
        aspectRatio,
        additionalNotes,
      }));
    } catch {}
  }, [activeMode, styleImg, poseChar, angleCamera, expressionChar, aspectRatio, additionalNotes]);

  const handleResetForm = () => {
    setPoseChar('Berdiri Rileks');
    setAngleCamera('Medium Shot');
    setExpressionChar('Tersenyum Natural');
    setAdditionalNotes('');
    setCharImg('');
    setOutfitImg('');
    setLocationImg('');
    setProductImgs([]);
    showToast('Form Image Gen di-reset.', 'INFO');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
        showToast('Referensi gambar diupload.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && productImgs.length < 4) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductImgs(p => [...p, reader.result as string]);
        showToast('Referensi produk ditambahkan.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const promptDraft = `${poseChar} ${expressionChar}, ${angleCamera}, ${additionalNotes || 'in photorealistic commercial setting'}, ${styleImg}`;
      const res = await api.generateImage(promptDraft, aspectRatio, styleImg);

      const newFrame = {
        id: 'frame_' + Date.now(),
        url: res.imageUrl,
        prompt: res.prompt,
        ratio: aspectRatio,
        createdAt: new Date().toISOString(),
      };

      setHistoryFrames(prev => [newFrame, ...prev]);
      setActiveFrame(newFrame);
      showToast('Frame visual berhasil di-generate!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal generate gambar: ${err.message}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToAsset = async (frame: any) => {
    try {
      await api.createAsset({
        project_id: activeProjectId,
        name: `Frame ${frame.ratio} - ${frame.prompt.substring(0, 25)}`,
        category: 'IMAGE',
        url: frame.url,
        tags: ['image-gen', frame.ratio],
      });
      showToast('Asset visual berhasil disimpan ke Library!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan asset: ${err.message}`, 'ERROR');
    }
  };

  const handleDownload = (frame: any) => {
    const link = document.createElement('a');
    link.href = frame.url;
    link.download = `om-gio-frame-${Date.now()}.jpg`;
    link.click();
    showToast('Download dimulai.', 'INFO');
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    showToast('Prompt disalin ke clipboard.', 'INFO');
  };

  const handleReusePrompt = (frame: any) => {
    setAdditionalNotes(`Variasi dari: ${frame.prompt}`);
    showToast('Prompt frame dimuat ke formulir untuk variasi.', 'INFO');
  };

  const handleDeleteFrameConfirm = () => {
    if (!deleteConfirmFrame) return;
    setHistoryFrames(prev => prev.filter(f => f.id !== deleteConfirmFrame.id));
    if (activeFrame?.id === deleteConfirmFrame.id) {
      setActiveFrame(historyFrames.find(f => f.id !== deleteConfirmFrame.id) || null);
    }
    setDeleteConfirmFrame(null);
    showToast('Frame dihapus dari riwayat.', 'INFO');
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header matching screenshot 5555555.JPG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Image Gen
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              GENERATOR
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Konfigurasi parameter dan hasilkan karya dengan AI.
          </p>
        </div>

        <button
          onClick={handleResetForm}
          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/40" />
          <span>Reset Input</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Settings Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Tabs matching 5555555.JPG */}
          <div className="flex p-1 bg-[#121212] rounded-xl border border-white/[0.08] overflow-x-auto">
            {['First Frame', 'Gambar Umum', 'Image Variation', 'Image-to-Image'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setActiveMode(m as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeMode === m
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Reference Slots matching 5555555.JPG */}
          <div className="grid grid-cols-3 gap-3">
            {/* Karakter Slot */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-3 text-center min-h-[110px] flex flex-col justify-center items-center">
              <span className="text-[11px] font-semibold text-white/70 mb-2">Karakter</span>
              {charImg ? (
                <div className="relative w-full h-16 rounded-lg overflow-hidden group">
                  <img src={charImg} alt="Karakter" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCharImg('')}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setCharImg)} className="hidden" />
                </label>
              )}
            </div>

            {/* Outfit Slot */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-3 text-center min-h-[110px] flex flex-col justify-center items-center">
              <span className="text-[11px] font-semibold text-white/70 mb-2">Outfit</span>
              {outfitImg ? (
                <div className="relative w-full h-16 rounded-lg overflow-hidden group">
                  <img src={outfitImg} alt="Outfit" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setOutfitImg('')}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setOutfitImg)} className="hidden" />
                </label>
              )}
            </div>

            {/* Lokasi Slot */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-3 text-center min-h-[110px] flex flex-col justify-center items-center">
              <span className="text-[11px] font-semibold text-white/70 mb-2">Lokasi</span>
              {locationImg ? (
                <div className="relative w-full h-16 rounded-lg overflow-hidden group">
                  <img src={locationImg} alt="Lokasi" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setLocationImg('')}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setLocationImg)} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Referensi Produk (Max 4) matching 5555555.JPG */}
          <div className="p-3.5 rounded-xl bg-[#121212] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80">Referensi Produk (Max 4)</span>
              <span className="text-[10px] text-white/40">{productImgs.length} / 4</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImgs.map((img, i) => (
                <div key={i} className="relative h-16 rounded-lg overflow-hidden group border border-white/[0.08]">
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setProductImgs(p => p.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {productImgs.length < 4 && (
                <label className="h-16 rounded-lg border border-dashed border-white/[0.15] hover:border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px]">Upload</span>
                  <input type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Form Fields matching 5555555.JPG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Style Gambar</label>
              <select
                value={styleImg}
                onChange={e => setStyleImg(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Realistic/Photorealistic">Realistic/Photorealistic (Commercial)</option>
                <option value="Cinematic Movie Shot">Cinematic Movie Shot (35mm)</option>
                <option value="Editorial Fashion">Editorial Fashion Magazine</option>
                <option value="3D Anime Render">3D Anime Render</option>
                <option value="Minimalist Studio">Minimalist Studio Lighting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Pose Karakter</label>
              <select
                value={poseChar}
                onChange={e => setPoseChar(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Berdiri Rileks">Berdiri Rileks</option>
                <option value="Memegang Produk Menghadap Kamera">Memegang Produk Menghadap Kamera</option>
                <option value="Mengoleskan Serum ke Wajah">Mengoleskan Serum ke Wajah</option>
                <option value="Duduk Anggun di Studio">Duduk Anggun di Studio</option>
                <option value="Pose Mirror Selfie">Pose Mirror Selfie</option>
                <option value="Walking/Berjalan Percaya Diri">Walking/Berjalan Percaya Diri</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Angle Kamera</label>
              <select
                value={angleCamera}
                onChange={e => setAngleCamera(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Medium Shot">Medium Shot</option>
                <option value="Close-Up">Close-Up (Fokus Wajah)</option>
                <option value="Extreme Close-Up">Extreme Close-Up (Tekstur Kulit/Produk)</option>
                <option value="Eye Level">Eye Level Natural</option>
                <option value="Low Angle">Low Angle Heroik</option>
                <option value="Top-Down Flat Lay">Top-Down Flat Lay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Ekspresi Karakter</label>
              <select
                value={expressionChar}
                onChange={e => setExpressionChar(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Tersenyum Natural">Tersenyum Natural</option>
                <option value="Ekspresi Kaget/Puas">Ekspresi Kaget/Puas Terhadap Hasil</option>
                <option value="Fokus & Percaya Diri">Fokus & Percaya Diri</option>
                <option value="Ceria & Energik">Ceria & Energik</option>
                <option value="Tenang & Elegan">Tenang & Elegan</option>
              </select>
            </div>
          </div>

          {/* Aspek Rasio Buttons matching 5555555.JPG */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">Aspek Rasio</label>
            <div className="flex gap-2">
              {['16:9', '9:16', '1:1', '3:4', '4:5'].map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    aspectRatio === ratio
                      ? 'bg-[#D4AF37] text-black shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                      : 'bg-[#141414] border border-white/[0.08] text-white/60 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan matching 5555555.JPG */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Catatan Tambahan (Bisa Sebagai Acuan Tambahan)
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Ketik aksi khusus atau catatan tambahan untuk acuan detail pose..."
              className="w-full p-3 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Generate Button matching 5555555.JPG */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Merender Frame Visual AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Generate First Frame</span>
              </>
            )}
          </button>
        </div>

        {/* Right Riwayat Frame Column (5 Cols) matching 5555555.JPG */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Riwayat Frame ({historyFrames.length})
              </span>
            </div>

            {/* Active Canvas Frame Viewer */}
            {activeFrame ? (
              <div className="space-y-4 mb-6">
                <div
                  className="relative rounded-xl overflow-hidden bg-black/60 border border-white/[0.08] flex items-center justify-center cursor-pointer group"
                  onClick={() => setFullscreenFrame(activeFrame)}
                >
                  <img
                    src={activeFrame.url}
                    alt="Active Frame"
                    className="w-full max-h-[380px] object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-[#D4AF37] border border-white/[0.1] font-mono">
                    {activeFrame.ratio}
                  </span>
                </div>

                {/* Actions row */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleSaveToAsset(activeFrame)}
                    className="py-2 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Simpan ke Asset Library"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="truncate">Simpan</span>
                  </button>

                  <button
                    onClick={() => handleDownload(activeFrame)}
                    className="py-2 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Unduh Gambar"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="truncate">Unduh</span>
                  </button>

                  <button
                    onClick={() => handleCopyPrompt(activeFrame.prompt)}
                    className="py-2 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Salin Prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="truncate">Prompt</span>
                  </button>

                  <button
                    onClick={() => handleReusePrompt(activeFrame)}
                    className="py-2 px-2 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Jadikan Variasi Baru"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="truncate">Variasi</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Riwayat Thumbnail Grid */}
            {historyFrames.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
                <ImageIcon className="w-12 h-12 stroke-[1.2] mb-3 text-white/20" />
                <h4 className="text-sm font-semibold text-white/60">Belum ada riwayat generate</h4>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Gambar yang Anda generate akan tersimpan dan tampil di panel ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-72 custom-scrollbar pr-1">
                {historyFrames.map(frame => (
                  <div
                    key={frame.id}
                    onClick={() => setActiveFrame(frame)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video group ${
                      activeFrame?.id === frame.id
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : 'border-white/[0.08] hover:border-white/30'
                    }`}
                  >
                    <img src={frame.url} alt="Frame" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end justify-between">
                      <span className="text-[10px] text-white font-mono">{frame.ratio}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteConfirmFrame(frame);
                        }}
                        className="p-1 rounded bg-black/60 text-white/60 hover:text-rose-400"
                        title="Hapus Frame"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl overflow-hidden p-4">
            <button
              onClick={() => setFullscreenFrame(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden mb-4">
              <img src={fullscreenFrame.url} alt="Fullscreen Frame" className="max-h-[73vh] object-contain mx-auto" />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div className="max-w-md truncate text-white/70">
                <span className="font-mono text-[#D4AF37] mr-2">[{fullscreenFrame.ratio}]</span>
                <span>{fullscreenFrame.prompt}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(fullscreenFrame)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold"
                >
                  Download Frame
                </button>
                <button
                  onClick={() => handleSaveToAsset(fullscreenFrame)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold"
                >
                  Simpan Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Frame Ini?</h3>
              <p className="text-xs text-white/50 mt-1">Frame akan dihapus dari riwayat visual Anda.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmFrame(null)}
                className="w-1/2 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteFrameConfirm}
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
