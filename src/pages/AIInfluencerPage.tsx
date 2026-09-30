import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  UserCheck,
  Upload,
  Sparkles,
  Bookmark,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Edit2,
  Download,
  X,
  RotateCcw,
} from 'lucide-react';
import { Character } from '../types';

interface AIInfluencerPageProps {
  onUseCharacterInModule?: (char: Character, module: string) => void;
}

export const AIInfluencerPage: React.FC<AIInfluencerPageProps> = () => {
  const { activeProjectId } = useAuth();
  const { showToast } = useToast();

  const [refImg, setRefImg] = useState<string>('');
  const [name, setName] = useState('Neng Aitha');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [styleImg, setStyleImg] = useState('Realistic/Photorealistic');
  const [nationality, setNationality] = useState('Indonesia');
  const [gender, setGender] = useState('Wanita');
  const [faceShape, setFaceShape] = useState('Oval');
  const [eyeShape, setEyeShape] = useState('Almond');
  const [noseShape, setNoseShape] = useState('Mancung Lurus');
  const [lipShape, setLipShape] = useState('Penuh');
  const [hairStyle, setHairStyle] = useState('Panjang Lurus');
  const [skinTone, setSkinTone] = useState('Terang');
  const [bodyType, setBodyType] = useState('Langsing');
  const [vibe, setVibe] = useState('Ramah & Hangat');
  const [additionalNotes, setAdditionalNotes] = useState('Ada tahi lalat manis di dekat tulang pipi kiri');

  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activePersona, setActivePersona] = useState<any>(null);

  // Modals
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(null);
  const [deleteConfirmChar, setDeleteConfirmChar] = useState<Character | null>(null);

  useEffect(() => {
    loadCharacters();
    try {
      const saved = localStorage.getItem('om_gio_influencer_form');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.name) setName(p.name);
        if (p.nationality) setNationality(p.nationality);
        if (p.gender) setGender(p.gender);
        if (p.faceShape) setFaceShape(p.faceShape);
        if (p.eyeShape) setEyeShape(p.eyeShape);
        if (p.noseShape) setNoseShape(p.noseShape);
        if (p.lipShape) setLipShape(p.lipShape);
        if (p.hairStyle) setHairStyle(p.hairStyle);
        if (p.skinTone) setSkinTone(p.skinTone);
        if (p.bodyType) setBodyType(p.bodyType);
        if (p.vibe) setVibe(p.vibe);
        if (p.additionalNotes) setAdditionalNotes(p.additionalNotes);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('om_gio_influencer_form', JSON.stringify({
        name,
        nationality,
        gender,
        faceShape,
        eyeShape,
        noseShape,
        lipShape,
        hairStyle,
        skinTone,
        bodyType,
        vibe,
        additionalNotes,
      }));
    } catch {}
  }, [name, nationality, gender, faceShape, eyeShape, noseShape, lipShape, hairStyle, skinTone, bodyType, vibe, additionalNotes]);

  const loadCharacters = () => {
    api.getCharacters()
      .then(res => setCharacters(res.characters || []))
      .catch(() => {});
  };

  const handleResetForm = () => {
    setName('Neng Aitha');
    setNationality('Indonesia');
    setGender('Wanita');
    setFaceShape('Oval');
    setEyeShape('Almond');
    setNoseShape('Mancung Lurus');
    setLipShape('Penuh');
    setHairStyle('Panjang Lurus');
    setSkinTone('Terang');
    setBodyType('Langsing');
    setVibe('Ramah & Hangat');
    setAdditionalNotes('');
    setRefImg('');
    showToast('Form karakter di-reset ke nilai default.', 'INFO');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRefImg(reader.result as string);
        showToast('Foto referensi karakter diupload.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const payload = {
        name,
        nationality,
        gender,
        style: styleImg,
        face_shape: faceShape,
        eye_shape: eyeShape,
        nose_shape: noseShape,
        lip_shape: lipShape,
        hair_style: hairStyle,
        skin_tone: skinTone,
        body_type: bodyType,
        vibe,
        aspect_ratio: aspectRatio,
        additional_notes: additionalNotes,
        reference_image: refImg,
      };

      const res = await api.generateInfluencer(payload);
      setActivePersona(res.influencer);

      // Save character automatically to library
      const newChar = await api.createCharacter({
        project_id: activeProjectId,
        name: res.influencer.name || name,
        avatar: res.influencer.avatar_url || refImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        style: styleImg,
        nationality,
        gender,
        face_shape: faceShape,
        eye_shape: eyeShape,
        nose_shape: noseShape,
        lip_shape: lipShape,
        hair_style: hairStyle,
        skin_tone: skinTone,
        body_type: bodyType,
        vibe,
        appearance_prompt: res.influencer.appearance_prompt,
        negative_prompt: res.influencer.negative_prompt,
        aspect_ratio: aspectRatio,
        notes: res.influencer.tagline || additionalNotes,
      });

      setCharacters(prev => [newChar.character, ...prev]);
      showToast(`AI Influencer "${newChar.character.name}" berhasil diciptakan dan disimpan!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal generate influencer: ${err.message}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (char: Character) => {
    try {
      const res = await api.duplicateCharacter(char.id);
      setCharacters(prev => [res.character, ...prev]);
      showToast(`Karakter "${res.character.name}" berhasil diduplikasi.`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal menduplikasi: ${err.message}`, 'ERROR');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmChar) return;
    try {
      await api.deleteCharacter(deleteConfirmChar.id);
      setCharacters(prev => prev.filter(c => c.id !== deleteConfirmChar.id));
      if (viewingCharacter?.id === deleteConfirmChar.id) setViewingCharacter(null);
      showToast(`Karakter "${deleteConfirmChar.name}" dihapus.`, 'INFO');
      setDeleteConfirmChar(null);
    } catch (err: any) {
      showToast(`Gagal menghapus: ${err.message}`, 'ERROR');
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    showToast('Consistency Prompt DNA disalin!', 'INFO');
  };

  const handleDownloadDNA = (char: Character) => {
    const text = `=== OM GIO AI CREATIVE DIRECTOR: CHARACTER DNA CARD ===\nNAMA: ${char.name}\nGENDER: ${char.gender} | ASAL: ${char.nationality}\nSTYLE: ${char.style} | ASPECT RATIO: ${char.aspect_ratio || '3:4'}\n\n[CONSISTENCY APPEARANCE PROMPT]\n${char.appearance_prompt}\n\n[NEGATIVE PROMPT]\n${char.negative_prompt || '-'}\n\n[VIBE & NOTES]\n${char.vibe || '-'} - ${char.notes || '-'}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dna-${char.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File DNA Karakter diunduh.', 'INFO');
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header matching screenshot 666666.JPG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Space_Grotesk']">
              AI Influencer
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              CREATOR
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
        {/* Left Creator Parameters Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Referensi Contoh Karakter upload slot matching 666666.JPG */}
          <div className="p-4 rounded-xl bg-[#121212] border border-white/[0.08]">
            <span className="text-xs font-semibold text-white/80 block mb-2">
              Referensi Contoh Karakter (Opsional)
            </span>
            {refImg ? (
              <div className="relative h-28 rounded-lg overflow-hidden group max-w-xs">
                <img src={refImg} alt="Ref" className="w-full h-full object-cover" />
                <button
                  onClick={() => setRefImg('')}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-white/20 hover:border-[#D4AF37] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-[#D4AF37] transition-colors max-w-xs">
                <Upload className="w-6 h-6 mb-1 text-[#D4AF37]" />
                <span className="text-xs font-medium text-white/80">Klik Upload Foto Referensi</span>
                <span className="text-[10px] text-white/40 mt-0.5">PNG, JPG format</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Core Info Fields matching 666666.JPG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Nama Karakter</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Neng Aitha"
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Asal Negara</label>
              <select
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Jepang">Jepang</option>
                <option value="Korea Selatan">Korea Selatan</option>
                <option value="Thailand">Thailand</option>
                <option value="Amerika/Kaukasian">Amerika / Kaukasian</option>
                <option value="Timur Tengah">Timur Tengah</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Wanita">Wanita</option>
                <option value="Pria">Pria</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Style Gambar</label>
              <select
                value={styleImg}
                onChange={e => setStyleImg(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Realistic/Photorealistic">Realistic / Photorealistic 8K</option>
                <option value="Cinematic 35mm">Cinematic 35mm Film</option>
                <option value="Fashion Editorial">Fashion Editorial Magazine</option>
              </select>
            </div>
          </div>

          {/* Facial DNA Features matching 666666.JPG */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Bentuk Wajah</label>
              <select
                value={faceShape}
                onChange={e => setFaceShape(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Oval">Oval</option>
                <option value="Bulat (Round)">Bulat</option>
                <option value="Hati (Heart)">Hati</option>
                <option value="Persegi (Square)">Persegi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Bentuk Mata</label>
              <select
                value={eyeShape}
                onChange={e => setEyeShape(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Almond">Almond</option>
                <option value="Monolid">Monolid</option>
                <option value="Bulat Besar">Bulat Besar</option>
                <option value="Cat Eyes">Cat Eyes</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Bentuk Hidung</label>
              <select
                value={noseShape}
                onChange={e => setNoseShape(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Mancung Lurus">Mancung Lurus</option>
                <option value="Kecil Mungil">Kecil Mungil</option>
                <option value="Button Nose">Button Nose</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Bentuk Bibir</label>
              <select
                value={lipShape}
                onChange={e => setLipShape(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Penuh">Penuh</option>
                <option value="Tipis Elegan">Tipis Elegan</option>
                <option value="Plump Glossy">Plump Glossy</option>
              </select>
            </div>
          </div>

          {/* Hair & Skin Details matching 666666.JPG */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Style Rambut</label>
              <select
                value={hairStyle}
                onChange={e => setHairStyle(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Panjang Lurus">Panjang Lurus</option>
                <option value="Wavy Bergelombang">Wavy Bergelombang</option>
                <option value="Bob Pendek Modern">Bob Pendek Modern</option>
                <option value="Hijab Modern Elegan">Hijab Modern Elegan</option>
                <option value="Kuncir Kuda Rapi">Kuncir Kuda Rapi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Warna Kulit</label>
              <select
                value={skinTone}
                onChange={e => setSkinTone(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Terang">Terang (Fair)</option>
                <option value="Kuning Langsat">Kuning Langsat</option>
                <option value="Sawo Matang">Sawo Matang Eksotis</option>
                <option value="Tan">Tan Glowing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Postur Tubuh</label>
              <select
                value={bodyType}
                onChange={e => setBodyType(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Langsing">Langsing (Slim)</option>
                <option value="Atletis Proporsional">Atletis Proporsional</option>
                <option value="Curvy">Curvy</option>
                <option value="Tinggi Model">Tinggi Model</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1">Vibe Karakter</label>
              <select
                value={vibe}
                onChange={e => setVibe(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#141414] border border-white/[0.08] text-white text-xs"
              >
                <option value="Ramah & Hangat">Ramah & Hangat</option>
                <option value="Elegan & Mewah">Elegan & Mewah</option>
                <option value="Ceria & Energetik">Ceria & Energetik</option>
                <option value="Profesional & Tegas">Profesional & Tegas</option>
              </select>
            </div>
          </div>

          {/* Catatan Tambahan matching 666666.JPG */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Catatan Tambahan (Bisa Sebagai Acuan Tambahan)
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Contoh: Ada tahi lalat manis di pipi, lesung pipi saat tersenyum..."
              className="w-full p-3 rounded-xl bg-[#141414] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Generate Button matching 666666.JPG */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !name}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Menciptakan Karakter Influencer AI...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-black" />
                <span>Generate AI Influencer</span>
              </>
            )}
          </button>
        </div>

        {/* Right Stored Characters Column (5 Cols) matching 666666.JPG */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                KARAKTER TERSIMPAN ({characters.length})
              </span>
            </div>

            {/* If Persona just created, preview DNA Card */}
            {activePersona && (
              <div className="p-4 rounded-xl bg-[#161616] border border-[#D4AF37]/40 mb-4 shadow-lg space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activePersona.avatar_url}
                    alt={activePersona.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#D4AF37]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{activePersona.name}</h4>
                    <p className="text-[11px] text-[#D4AF37]">{activePersona.tagline}</p>
                    <p className="text-[10px] text-white/50">{activePersona.personality}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-white/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#D4AF37] text-[10px] uppercase">Consistency Prompt DNA</span>
                    <button
                      onClick={() => copyPrompt(activePersona.appearance_prompt)}
                      className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy DNA</span>
                    </button>
                  </div>
                  <p className="line-clamp-3 font-mono text-[10px] text-white/70">
                    {activePersona.appearance_prompt}
                  </p>
                </div>
              </div>
            )}

            {/* List of Saved Characters */}
            {characters.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
                <UserCheck className="w-12 h-12 stroke-[1.2] mb-3 text-white/20" />
                <h4 className="text-sm font-semibold text-white/60">Belum ada karakter tersimpan</h4>
                <p className="text-xs text-white/40 mt-1 max-w-xs">
                  Generate influencer di sebelah kiri untuk menyimpannya ke DNA Library Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar pr-1">
                {characters.map(char => (
                  <div
                    key={char.id}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all flex items-start justify-between gap-3 group cursor-pointer"
                    onClick={() => setViewingCharacter(char)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                          {char.name}
                        </h4>
                        <div className="text-[10px] text-white/50 truncate">
                          {char.gender} · {char.nationality} · {char.style}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                          {char.vibe || char.notes}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => copyPrompt(char.appearance_prompt)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-[#D4AF37] transition-colors"
                        title="Copy Character DNA Prompt"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(char)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-sky-400 transition-colors"
                        title="Duplikasi Karakter"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmChar(char)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-colors"
                        title="Hapus Karakter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewing Character DNA Modal */}
      {viewingCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6">
            <button
              onClick={() => setViewingCharacter(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/[0.08]">
              <img
                src={viewingCharacter.avatar}
                alt={viewingCharacter.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#D4AF37]"
              />
              <div>
                <h3 className="text-base font-bold text-white">{viewingCharacter.name}</h3>
                <div className="text-xs text-[#D4AF37]">
                  {viewingCharacter.gender} · {viewingCharacter.nationality}
                </div>
                <div className="text-[11px] text-white/50">{viewingCharacter.vibe}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">DNA Features</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-white/40 text-[10px] block">Wajah & Rambut</span>
                    <span className="text-white/80">{viewingCharacter.face_shape} · {viewingCharacter.hair_style}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-white/40 text-[10px] block">Kulit & Postur</span>
                    <span className="text-white/80">{viewingCharacter.skin_tone} · {viewingCharacter.body_type}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                    Master Consistency Prompt
                  </span>
                  <button
                    onClick={() => copyPrompt(viewingCharacter.appearance_prompt)}
                    className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Prompt</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-white/90 font-mono text-[11px] leading-relaxed">
                  {viewingCharacter.appearance_prompt}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => handleDownloadDNA(viewingCharacter)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download DNA Card</span>
              </button>

              <button
                onClick={() => {
                  setName(viewingCharacter.name);
                  if (viewingCharacter.nationality) setNationality(viewingCharacter.nationality);
                  if (viewingCharacter.gender) setGender(viewingCharacter.gender);
                  if (viewingCharacter.face_shape) setFaceShape(viewingCharacter.face_shape);
                  if (viewingCharacter.hair_style) setHairStyle(viewingCharacter.hair_style);
                  setViewingCharacter(null);
                  showToast('Parameter karakter dimuat ke formulir.', 'INFO');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold"
              >
                Muat ke Formulir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Avoid window.confirm) */}
      {deleteConfirmChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121212] border border-white/[0.1] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Karakter?</h3>
              <p className="text-xs text-white/50 mt-1">
                Karakter "{deleteConfirmChar.name}" akan dihapus dari perpustakaan influencer Anda.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmChar(null)}
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
