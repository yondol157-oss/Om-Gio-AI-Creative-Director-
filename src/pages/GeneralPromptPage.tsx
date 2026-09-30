import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Upload,
  Sparkles,
  Copy,
  Download,
  Bookmark,
  Check,
  RefreshCw,
  Trash2,
  Edit2,
  RotateCcw,
} from 'lucide-react';

export const GeneralPromptPage: React.FC = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  const [charImgs, setCharImgs] = useState<string[]>([]);
  const [outfitImgs, setOutfitImgs] = useState<string[]>([]);
  const [locationImgs, setLocationImgs] = useState<string[]>([]);

  const [shotsCount, setShotsCount] = useState(3);
  const [duration, setDuration] = useState('15 detik');
  const [styleVideo, setStyleVideo] = useState('Cinematic Video');
  const [videoContext, setVideoContext] = useState('');
  const [voiceOverNatural, setVoiceOverNatural] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedPillar, setCopiedPillar] = useState<string | null>(null);
  const [isEditingOutput, setIsEditingOutput] = useState(false);

  // Restore cached state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('om_gio_general_form');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.shotsCount) setShotsCount(p.shotsCount);
        if (p.duration) setDuration(p.duration);
        if (p.styleVideo) setStyleVideo(p.styleVideo);
        if (p.videoContext) setVideoContext(p.videoContext);
        if (p.voiceOverNatural !== undefined) setVoiceOverNatural(p.voiceOverNatural);
      }
      const savedRes = localStorage.getItem('om_gio_general_last_result');
      if (savedRes) {
        setResult(JSON.parse(savedRes));
      }
    } catch {}
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('om_gio_general_form', JSON.stringify({
        shotsCount,
        duration,
        styleVideo,
        videoContext,
        voiceOverNatural,
      }));
    } catch {}
  }, [shotsCount, duration, styleVideo, videoContext, voiceOverNatural]);

  const handleResetForm = () => {
    setVideoContext('');
    setCharImgs([]);
    setOutfitImgs([]);
    setLocationImgs([]);
    showToast('Formulir di-reset ke awal.', 'INFO');
  };

  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>, max: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(prev => (prev.length < max ? [...prev, reader.result as string] : prev));
        showToast('Referensi diupload.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!videoContext.trim()) {
      showToast('Konteks Video (WAJIB) harus diisi detail.', 'WARNING');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.generateGeneralPrompt({
        project_id: activeProjectId,
        video_context: videoContext,
        shots_count: shotsCount,
        duration,
        video_style: styleVideo,
        voice_over_natural: voiceOverNatural,
      });

      setResult(res.result);
      try {
        localStorage.setItem('om_gio_general_last_result', JSON.stringify(res.result));
      } catch {}
      showToast('Naskah Prompt Sinematik berhasil dibuat!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal merancang prompt: ${err.message}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPillar(key);
    showToast('Teks disalin ke clipboard.', 'INFO');
    setTimeout(() => setCopiedPillar(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const content = `=== OM GIO AI CREATIVE DIRECTOR: GENERAL CINEMATIC PROMPT ===
JUDUL: ${result.title}
STYLE: ${result.global_style}

[1. GLOBAL STYLE]
${result.global_style}

[2. CHARACTER]
${result.character}

[3. LOCATION]
${result.location}

[4. CAMERA & LENS]
${result.camera}

[5. LIGHTING]
${result.lighting}

[6. ACTION]
${result.action}

[7. DIALOGUE]
${result.dialogue}

[8. AUDIO & AMBIENCE]
${result.audio}

[9. TRANSITION]
${result.transition}

[10. NEGATIVE PROMPT]
${result.negative_prompt}

[FINAL COMBINED PROMPT]
${result.final_prompt}`;

    copyText(content, 'all');
  };

  const handleSaveToLibrary = async () => {
    if (!result) return;
    try {
      await api.createPrompt({
        project_id: activeProjectId,
        title: result.title || `Cinematic: ${videoContext.substring(0, 30)}`,
        category: 'GENERAL',
        content: result.final_prompt || JSON.stringify(result),
        negative_prompt: result.negative_prompt,
        structured_data: result,
        tags: ['cinematic', styleVideo.toLowerCase(), `${shotsCount}shots`],
      });
      showToast('Prompt berhasil disimpan ke Library!', 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message}`, 'ERROR');
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const content = `=== OM GIO AI CREATIVE DIRECTOR: GENERAL CINEMATIC PROMPT ===
JUDUL: ${result.title}
STYLE: ${result.global_style}

[1. GLOBAL STYLE]
${result.global_style}

[2. CHARACTER]
${result.character}

[3. LOCATION]
${result.location}

[4. CAMERA & LENS]
${result.camera}

[5. LIGHTING]
${result.lighting}

[6. ACTION]
${result.action}

[7. DIALOGUE]
${result.dialogue}

[8. AUDIO & AMBIENCE]
${result.audio}

[9. TRANSITION]
${result.transition}

[10. NEGATIVE PROMPT]
${result.negative_prompt}

[FINAL COMBINED PROMPT]
${result.final_prompt}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinematic-prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File prompt berhasil diunduh.', 'INFO');
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              General Prompt
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              STUDIO
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
        {/* Form Column (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Reference Slots matching 4444444.JPG */}
          <div className="space-y-3">
            {/* Karakter Max 4 */}
            <div className="p-3.5 rounded-xl bg-[#121212] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/80">Referensi Karakter (Max 4)</span>
                <span className="text-[10px] text-white/40">{charImgs.length} / 4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {charImgs.map((img, i) => (
                  <div key={i} className="relative h-16 rounded-lg overflow-hidden group border border-white/[0.08]">
                    <img src={img} alt="Char" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setCharImgs(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {charImgs.length < 4 && (
                  <label className="h-16 rounded-lg border border-dashed border-white/[0.15] hover:border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-[#D4AF37] transition-colors">
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px]">Upload</span>
                    <input type="file" accept="image/*" onChange={e => handleMultiUpload(e, setCharImgs, 4)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Outfit Max 4 */}
            <div className="p-3.5 rounded-xl bg-[#121212] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/80">Referensi Outfit (Max 4)</span>
                <span className="text-[10px] text-white/40">{outfitImgs.length} / 4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {outfitImgs.map((img, i) => (
                  <div key={i} className="relative h-16 rounded-lg overflow-hidden group border border-white/[0.08]">
                    <img src={img} alt="Outfit" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setOutfitImgs(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {outfitImgs.length < 4 && (
                  <label className="h-16 rounded-lg border border-dashed border-white/[0.15] hover:border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-[#D4AF37] transition-colors">
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px]">Upload</span>
                    <input type="file" accept="image/*" onChange={e => handleMultiUpload(e, setOutfitImgs, 4)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Lokasi Max 4 */}
            <div className="p-3.5 rounded-xl bg-[#121212] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/80">Referensi Lokasi (Max 4)</span>
                <span className="text-[10px] text-white/40">{locationImgs.length} / 4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {locationImgs.map((img, i) => (
                  <div key={i} className="relative h-16 rounded-lg overflow-hidden group border border-white/[0.08]">
                    <img src={img} alt="Lokasi" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setLocationImgs(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {locationImgs.length < 4 && (
                  <label className="h-16 rounded-lg border border-dashed border-white/[0.15] hover:border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-[#D4AF37] transition-colors">
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px]">Upload</span>
                    <input type="file" accept="image/*" onChange={e => handleMultiUpload(e, setLocationImgs, 4)} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Form Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Jumlah Shots</label>
              <select
                value={shotsCount}
                onChange={e => setShotsCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} Shot</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Durasi Video</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="15 detik">15 Detik (Reels/TikTok)</option>
                <option value="30 detik">30 Detik (Commercial)</option>
                <option value="60 detik">60 Detik (Storytelling)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Style Video</label>
              <select
                value={styleVideo}
                onChange={e => setStyleVideo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Cinematic Video">Cinematic Video</option>
                <option value="Commercial High-End">Commercial High-End</option>
                <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                <option value="Documentary Realistic">Documentary Realistic</option>
                <option value="Anime Aesthetic">Anime Aesthetic</option>
                <option value="Moody Film 35mm">Moody Film 35mm</option>
              </select>
            </div>
          </div>

          {/* Konteks Video (WAJIB) */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Konteks Video (WAJIB) *
            </label>
            <textarea
              rows={4}
              value={videoContext}
              onChange={e => setVideoContext(e.target.value)}
              placeholder="Ceritakan detail adegan, tujuan video, mood, pesan utama, dan suasana visual yang ingin dicapai..."
              required
              className="w-full p-3.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37] leading-relaxed"
            />
          </div>

          {/* Voice Over Natural Toggle */}
          <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.08]">
            <label className="flex items-center gap-2.5 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={voiceOverNatural}
                onChange={e => setVoiceOverNatural(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#D4AF37]"
              />
              <span>Voice Over Natural (Bahasa Indonesia Mengalir & Persuasif)</span>
            </label>
          </div>

          {/* Button: Generate General Prompt */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !videoContext}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Merancang Prompt 10 Pilar...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>GENERATE GENERAL PROMPT</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Column (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                10 Pilar Sinematografi AI
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
                    title={isEditingOutput ? 'Selesai Edit' : 'Edit Prompt'}
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
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-[#D4AF37] border border-white/[0.08]"
                    title="Simpan Prompt"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08]"
                    title="Unduh TXT"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
                <FileText className="w-12 h-12 stroke-[1.2] mb-3 text-white/20" />
                <h4 className="text-sm font-semibold text-white/60">Studio Siap Digunakan</h4>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Isi konteks video di sebelah kiri untuk menghasilkan prompt sinematik lengkap.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto max-h-[680px] pr-1 custom-scrollbar text-xs">
                {/* Copy All Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-white/60">
                    {isEditingOutput ? 'Mode Edit Aktif: Sesuaikan pilar sinematik' : '10 Pilar Siap Pakai'}
                  </span>
                  <button
                    onClick={handleCopyAll}
                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedPillar === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPillar === 'all' ? 'Tersalin Semua' : 'Salin Seluruh Naskah'}</span>
                  </button>
                </div>

                {/* Final Master Prompt */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#D4AF37]/40 shadow-lg space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      Master AI Video Prompt
                    </span>
                    <button
                      onClick={() => copyText(result.final_prompt, 'final')}
                      className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedPillar === 'final' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPillar === 'final' ? 'Tersalin' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  {isEditingOutput ? (
                    <textarea
                      rows={5}
                      value={result.final_prompt || ''}
                      onChange={e => setResult({ ...result, final_prompt: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-[#121212] border border-white/[0.08] text-white font-mono text-[11px] focus:outline-none focus:border-[#D4AF37]"
                    />
                  ) : (
                    <p className="text-white/95 leading-relaxed font-mono text-[11px] select-all">
                      {result.final_prompt}
                    </p>
                  )}
                </div>

                {/* 10 Pillars Grid */}
                <div className="space-y-2">
                  {[
                    { key: 'global_style', label: '1. Global Style', val: result.global_style },
                    { key: 'character', label: '2. Character', val: result.character },
                    { key: 'location', label: '3. Location', val: result.location },
                    { key: 'camera', label: '4. Camera & Lens', val: result.camera },
                    { key: 'lighting', label: '5. Lighting', val: result.lighting },
                    { key: 'action', label: '6. Action', val: result.action },
                    { key: 'dialogue', label: '7. Dialogue', val: result.dialogue },
                    { key: 'audio', label: '8. Audio & Ambience', val: result.audio },
                    { key: 'transition', label: '9. Transition', val: result.transition },
                    { key: 'negative_prompt', label: '10. Negative Prompt', val: result.negative_prompt },
                  ].map(pillar => (
                    <div key={pillar.key} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                          {pillar.label}
                        </span>
                        <button
                          onClick={() => copyText(pillar.val, pillar.key)}
                          className="text-[10px] text-white/40 hover:text-[#D4AF37]"
                        >
                          {copiedPillar === pillar.key ? 'Disalin' : 'Copy'}
                        </button>
                      </div>
                      {isEditingOutput ? (
                        <textarea
                          rows={2}
                          value={result[pillar.key] || ''}
                          onChange={e => setResult({ ...result, [pillar.key]: e.target.value })}
                          className="w-full p-2 rounded-lg bg-[#161616] border border-white/[0.08] text-white text-[11px] focus:outline-none focus:border-[#D4AF37]"
                        />
                      ) : (
                        <p className="text-white/80 leading-relaxed text-[11px]">{pillar.val}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
