import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Video,
  Upload,
  Sparkles,
  Copy,
  Download,
  Bookmark,
  Check,
  Code,
  FileText,
  Trash2,
  RefreshCw,
  Edit2,
  RotateCcw,
} from 'lucide-react';

export const AffiliatePromptPage: React.FC = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [characterImg, setCharacterImg] = useState<string>('');
  const [outfitImg, setOutfitImg] = useState<string>('');
  const [locationImg, setLocationImg] = useState<string>('');
  const [productImgs, setProductImgs] = useState<string[]>([]);

  const [duration, setDuration] = useState('15 detik');
  const [gender, setGender] = useState('Wanita');
  const [age, setAge] = useState('24');
  const [videoStyle, setVideoStyle] = useState('UGC Video');

  const [selectedAngle, setSelectedAngle] = useState('Medium Close Up');
  const [selectedMovement, setSelectedMovement] = useState('Push In Perlahan');

  const [hasDialogue, setHasDialogue] = useState(false);
  const [voiceOverNatural, setVoiceOverNatural] = useState(true);
  const [hasTextOverlay, setHasTextOverlay] = useState(true);

  const [productName, setProductName] = useState('');
  const [characterAction, setCharacterAction] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [outputTab, setOutputTab] = useState<'formatted' | 'json' | 'scenes'>('formatted');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingOutput, setIsEditingOutput] = useState(false);

  // Restore cached state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('om_gio_affiliate_form');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.productName) setProductName(p.productName);
        if (p.duration) setDuration(p.duration);
        if (p.gender) setGender(p.gender);
        if (p.age) setAge(p.age);
        if (p.videoStyle) setVideoStyle(p.videoStyle);
        if (p.selectedAngle) setSelectedAngle(p.selectedAngle);
        if (p.selectedMovement) setSelectedMovement(p.selectedMovement);
        if (p.characterAction) setCharacterAction(p.characterAction);
        if (p.additionalNotes) setAdditionalNotes(p.additionalNotes);
      }
      const savedRes = localStorage.getItem('om_gio_affiliate_last_result');
      if (savedRes) {
        setResult(JSON.parse(savedRes));
      }
    } catch {}
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('om_gio_affiliate_form', JSON.stringify({
        productName,
        duration,
        gender,
        age,
        videoStyle,
        selectedAngle,
        selectedMovement,
        characterAction,
        additionalNotes,
      }));
    } catch {}
  }, [productName, duration, gender, age, videoStyle, selectedAngle, selectedMovement, characterAction, additionalNotes]);

  const handleResetForm = () => {
    setProductName('');
    setCharacterAction('');
    setAdditionalNotes('');
    setCharacterImg('');
    setOutfitImg('');
    setLocationImg('');
    setProductImgs([]);
    showToast('Formulir di-reset ke default.', 'INFO');
  };

  const cameraAngles = [
    'Eye Level',
    'Low Angle',
    'High Angle',
    'Dutch Angle',
    'Over-the-Shoulder',
    'Close-Up',
    'Extreme Close-Up',
    'Medium Shot',
    'Medium Close Up',
    'Full Body Shot',
    'Bird\'s Eye View',
    'Worm\'s Eye View',
    'Three-Quarter View',
    'Profile/Side View',
    'POV Selfie',
    'POV Orang Pertama',
    'Mirror Selfie',
    'Top-Down Flat Lay',
    'Wide Establishing Shot',
    'Macro Shot',
  ];

  const cameraMovements = [
    'Static/Tidak Bergerak',
    'Pan Kiri-Kanan',
    'Tilt Atas-Bawah',
    'Dolly In (Mendekat)',
    'Dolly Out (Menjauh)',
    'Tracking Shot',
    'Handheld Natural',
    'Steadicam Smooth',
    'Crane/Jib Shot',
    'Whip Pan',
    'Push In Perlahan',
    'Pull Out Perlahan',
    'Orbit/Arc Mengelilingi',
    'Zoom In',
    'Zoom Out',
    'Rack Focus',
    'Drone/Aerial Shot',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
        showToast('Foto referensi berhasil diupload.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && productImgs.length < 4) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductImgs(prev => [...prev, reader.result as string]);
        showToast(`Produk ${productImgs.length + 1} diupload.`, 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      showToast('Harap isi jenis/nama produk terlebih dahulu.', 'WARNING');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        project_id: activeProjectId,
        product_name: productName,
        character_gender: gender,
        character_age: age,
        duration,
        video_style: videoStyle,
        camera_angle: selectedAngle,
        camera_movement: selectedMovement,
        character_action: characterAction,
        voice_over_natural: voiceOverNatural,
        has_dialogue: hasDialogue,
        has_text_overlay: hasTextOverlay,
        additional_notes: additionalNotes,
        reference_images_count: (characterImg ? 1 : 0) + productImgs.length,
      };

      const res = await api.generateAffiliatePrompt(payload);
      setResult(res.result);
      try {
        localStorage.setItem('om_gio_affiliate_last_result', JSON.stringify(res.result));
      } catch {}
      showToast('Prompt Affiliate berhasil dirancang oleh Creative Director AI!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal merancang prompt: ${err.message}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Teks berhasil disalin ke clipboard!', 'INFO');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToLibrary = async () => {
    if (!result) return;
    try {
      await api.createPrompt({
        project_id: activeProjectId,
        title: result.title || `Affiliate: ${productName}`,
        category: 'AFFILIATE',
        content: result.main_prompt,
        negative_prompt: result.negative_prompt,
        structured_data: result,
        tags: ['affiliate', gender.toLowerCase(), videoStyle.toLowerCase()],
      });
      showToast('Berhasil disimpan ke Prompt Library!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message}`, 'ERROR');
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const content = `=== OM GIO AI CREATIVE DIRECTOR: AFFILIATE PROMPT ===
JUDUL: ${result.title}
PRODUK: ${productName}
STYLE: ${videoStyle} | KAMERA: ${selectedAngle} (${selectedMovement})

[MAIN PROMPT]
${result.main_prompt}

[NEGATIVE PROMPT]
${result.negative_prompt}

[CAMERA DIRECTION]
${result.camera_direction}

[CHARACTER DIRECTION]
${result.character_direction}

[PRODUCT DIRECTION]
${result.product_direction}

[VOICE OVER (VO)]
${result.voice_over}

[CALL TO ACTION]
${result.call_to_action}

Di-generate dengan Om Gio AI Creative Director (2026)`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `affiliate-prompt-${productName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File TXT berhasil diunduh.', 'INFO');
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              Affiliate Prompt
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              GENERATOR
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Konfigurasi parameter dan hasilkan karya dengan AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetForm}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white/40" />
            <span>Reset Input</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Reference Upload Slots matching 111.JPG */}
          <div className="grid grid-cols-3 gap-3">
            {/* Karakter Slot */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-3 text-center flex flex-col items-center justify-center relative min-h-[110px]">
              <span className="text-[11px] font-semibold text-white/70 mb-2">Karakter</span>
              {characterImg ? (
                <div className="relative w-full h-16 rounded-lg overflow-hidden group">
                  <img src={characterImg} alt="Karakter" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCharacterImg('')}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setCharacterImg)} className="hidden" />
                </label>
              )}
            </div>

            {/* Outfit Slot */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-3 text-center flex flex-col items-center justify-center relative min-h-[110px]">
              <span className="text-[11px] font-semibold text-white/70 mb-2">Outfit</span>
              {outfitImg ? (
                <div className="relative w-full h-16 rounded-lg overflow-hidden group">
                  <img src={outfitImg} alt="Outfit" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setOutfitImg('')}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setOutfitImg)} className="hidden" />
                </label>
              )}
            </div>

            {/* Lokasi Slot */}
            <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-3 text-center flex flex-col items-center justify-center relative min-h-[110px]">
              <span className="text-[11px] font-semibold text-white/70 mb-2">Lokasi</span>
              {locationImg ? (
                <div className="relative w-full h-16 rounded-lg overflow-hidden group">
                  <img src={locationImg} alt="Lokasi" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setLocationImg('')}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Klik upload</span>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setLocationImg)} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Referensi Produk (Max 4) matching 111.JPG */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/80">Referensi Produk (Max 4)</span>
              <span className="text-[10px] text-white/40">{productImgs.length} / 4 foto</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {productImgs.map((img, idx) => (
                <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-white/[0.08] group">
                  <img src={img} alt={`Produk ${idx+1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setProductImgs(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {productImgs.length < 4 && (
                <label className="h-20 rounded-lg border border-dashed border-white/[0.15] hover:border-[#D4AF37]/50 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-[#D4AF37] transition-colors">
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[10px]">Produk {productImgs.length + 1}</span>
                  <input type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Row 1: Durasi, Gender, Usia, Style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Durasi Video</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Wanita">Wanita</option>
                <option value="Pria">Pria</option>
                <option value="Unisex / Duo">Unisex / Duo</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Usia Talent</label>
              <input
                type="text"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Style Video</label>
              <select
                value={videoStyle}
                onChange={e => setVideoStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="UGC Video">UGC Video</option>
                <option value="Cinematic Commercial">Cinematic Commercial</option>
                <option value="Review Jujur / Unboxing">Review Jujur / Unboxing</option>
                <option value="Storytelling POV">Storytelling POV</option>
                <option value="Problem Solution">Problem Solution</option>
              </select>
            </div>
          </div>

          {/* Camera Angles Selection Pills */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-4">
            <label className="block text-xs font-semibold text-white/80 mb-2">
              Angle Kamera ({selectedAngle})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
              {cameraAngles.map(angle => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setSelectedAngle(angle)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedAngle === angle
                      ? 'bg-[#D4AF37] text-black font-semibold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : 'bg-[#181818] text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Movement Selection Pills */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121212] p-4">
            <label className="block text-xs font-semibold text-white/80 mb-2">
              Movement Kamera ({selectedMovement})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
              {cameraMovements.map(mov => (
                <button
                  key={mov}
                  type="button"
                  onClick={() => setSelectedMovement(mov)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedMovement === mov
                      ? 'bg-[#D4AF37] text-black font-semibold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : 'bg-[#181818] text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {mov}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles on Right / Middle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#121212] border border-white/[0.08]">
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDialogue}
                onChange={e => setHasDialogue(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
              />
              <span>Pakai Dialog Khusus</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={voiceOverNatural}
                onChange={e => setVoiceOverNatural(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
              />
              <span>Voice Over Natural</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTextOverlay}
                onChange={e => setHasTextOverlay(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
              />
              <span>Text Overlay Grafis</span>
            </label>
          </div>

          {/* Product & Action Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Jenis / Nama Produk *
              </label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Contoh: Skincare Serum Anti-aging 24K Gold / Jaket Bomber Kulit"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Aksi Karakter
              </label>
              <input
                type="text"
                value={characterAction}
                onChange={e => setCharacterAction(e.target.value)}
                placeholder="Contoh: Mengaplikasikan serum ke pipi lalu tersenyum puas di depan cermin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                rows={2}
                placeholder="Catatan mood, tone warna, highlight USP produk, dll..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !productName}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Merancang Naskah Affiliate AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>GENERATE AFFILIATE PROMPT</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Showcase (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Output Studio
              </span>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingOutput(!isEditingOutput)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isEditingOutput
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-[#D4AF37] border-white/[0.08]'
                    }`}
                    title={isEditingOutput ? 'Selesai Edit' : 'Edit Prompt Langsung'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-[#D4AF37] border border-white/[0.08] transition-colors disabled:opacity-50"
                    title="Regenerate Prompt"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-[#D4AF37] transition-colors"
                    title="Simpan ke Library"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                    title="Download TXT"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mode Tabs */}
            {result && (
              <div className="flex p-1 bg-[#181818] rounded-lg mb-4 text-xs">
                <button
                  onClick={() => setOutputTab('formatted')}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    outputTab === 'formatted' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Prompt Lengkap
                </button>
                <button
                  onClick={() => setOutputTab('scenes')}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    outputTab === 'scenes' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Scene Breakdown
                </button>
                <button
                  onClick={() => setOutputTab('json')}
                  className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                    outputTab === 'json' ? 'bg-[#D4AF37] text-black font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  JSON Mode
                </button>
              </div>
            )}

            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
                <Video className="w-12 h-12 stroke-[1.2] mb-3 text-white/20" />
                <h4 className="text-sm font-semibold text-white/60">Belum ada output</h4>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Isi parameter video affiliate di sebelah kiri dan klik tombol Generate untuk menghasilkan prompt komprehensif.
                </p>
              </div>
            ) : outputTab === 'formatted' ? (
              <div className="space-y-4 overflow-y-auto max-h-[650px] pr-1 custom-scrollbar text-xs">
                {/* Copy All Button Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-white/60">
                    {isEditingOutput ? 'Mode Edit Aktif: Ubah teks di bawah lalu klik Selesai' : 'Siap diproduksi ke TikTok / Reels'}
                  </span>
                  <button
                    onClick={() => {
                      const fullText = `JUDUL: ${result.title}\nHOOK: ${result.hook_3_second}\n\n[MAIN PROMPT]\n${result.main_prompt}\n\n[NEGATIVE PROMPT]\n${result.negative_prompt}\n\n[CAMERA DIRECTION]\n${result.camera_direction}\n\n[CHARACTER DIRECTION]\n${result.character_direction}\n\n[VOICE OVER]\n${result.voice_over}\n\n[CTA]\n${result.call_to_action}`;
                      copyToClipboard(fullText, 'all');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'all' ? 'Tersalin Semua' : 'Salin Seluruh Naskah'}</span>
                  </button>
                </div>

                {/* Title & Hook */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider mb-1">
                    Judul & Hook 3 Detik
                  </div>
                  {isEditingOutput ? (
                    <>
                      <input
                        type="text"
                        value={result.title || ''}
                        onChange={e => setResult({ ...result, title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                      <textarea
                        rows={2}
                        value={result.hook_3_second || ''}
                        onChange={e => setResult({ ...result, hook_3_second: e.target.value })}
                        className="w-full p-2 rounded-lg bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-white text-sm">{result.title}</div>
                      <div className="mt-1 text-white/80 italic font-serif">"{result.hook_3_second}"</div>
                    </>
                  )}
                </div>

                {/* Main Prompt */}
                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                      Main Video / Image Prompt
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.main_prompt, 'main')}
                      className="flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline"
                    >
                      {copiedKey === 'main' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'main' ? 'Tersalin' : 'Copy'}</span>
                    </button>
                  </div>
                  {isEditingOutput ? (
                    <textarea
                      rows={4}
                      value={result.main_prompt || ''}
                      onChange={e => setResult({ ...result, main_prompt: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-[#121212] border border-white/[0.08] text-white font-mono text-[11px] focus:outline-none focus:border-[#D4AF37]"
                    />
                  ) : (
                    <p className="text-white/90 leading-relaxed font-mono text-[11px] select-all">
                      {result.main_prompt}
                    </p>
                  )}
                </div>

                {/* Negative Prompt */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      Negative Prompt
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.negative_prompt, 'neg')}
                      className="text-[10px] text-white/50 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  {isEditingOutput ? (
                    <input
                      type="text"
                      value={result.negative_prompt || ''}
                      onChange={e => setResult({ ...result, negative_prompt: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#161616] border border-white/[0.08] text-white font-mono text-[11px] focus:outline-none focus:border-[#D4AF37]"
                    />
                  ) : (
                    <p className="text-white/60 text-[11px] font-mono">{result.negative_prompt}</p>
                  )}
                </div>

                {/* Camera & Direction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] uppercase font-semibold text-white/50">Camera Direction</div>
                    {isEditingOutput ? (
                      <input
                        type="text"
                        value={result.camera_direction || ''}
                        onChange={e => setResult({ ...result, camera_direction: e.target.value })}
                        className="w-full px-2 py-1 rounded bg-[#161616] border border-white/[0.08] text-white text-xs mt-1"
                      />
                    ) : (
                      <div className="text-white/80 mt-1">{result.camera_direction}</div>
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] uppercase font-semibold text-white/50">Character Direction</div>
                    {isEditingOutput ? (
                      <input
                        type="text"
                        value={result.character_direction || ''}
                        onChange={e => setResult({ ...result, character_direction: e.target.value })}
                        className="w-full px-2 py-1 rounded bg-[#161616] border border-white/[0.08] text-white text-xs mt-1"
                      />
                    ) : (
                      <div className="text-white/80 mt-1">{result.character_direction}</div>
                    )}
                  </div>
                </div>

                {/* Voice Over */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                      Voice Over Script (Narasi)
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.voice_over, 'vo')}
                      className="text-[10px] text-[#D4AF37] hover:underline"
                    >
                      Copy VO
                    </button>
                  </div>
                  {isEditingOutput ? (
                    <textarea
                      rows={3}
                      value={result.voice_over || ''}
                      onChange={e => setResult({ ...result, voice_over: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-[#161616] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  ) : (
                    <p className="text-white/90 leading-relaxed">{result.voice_over}</p>
                  )}
                </div>

                {/* CTA */}
                <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider mb-1">
                    Call To Action (Closing Keranjang Kuning)
                  </div>
                  {isEditingOutput ? (
                    <input
                      type="text"
                      value={result.call_to_action || ''}
                      onChange={e => setResult({ ...result, call_to_action: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#161616] border border-[#D4AF37]/40 text-white font-semibold text-xs"
                    />
                  ) : (
                    <div className="font-semibold text-white">{result.call_to_action}</div>
                  )}
                </div>
              </div>
            ) : outputTab === 'scenes' ? (
              <div className="space-y-3 overflow-y-auto max-h-[650px] custom-scrollbar text-xs">
                {result.scene_breakdown?.map((sc: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#D4AF37]">Scene #{idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/60">
                        {sc.second}
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed mb-2">
                      <strong className="text-white">Visual:</strong> {sc.visual}
                    </p>
                    <div className="text-[11px] text-white/60">
                      <div><strong className="text-white/80">Audio:</strong> {sc.audio}</div>
                      <div><strong className="text-white/80">Kamera:</strong> {sc.camera}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] font-mono text-white/80 overflow-auto max-h-[650px] custom-scrollbar select-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
