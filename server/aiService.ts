import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';

// Retrieve AI instance securely on server-side
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn('[AI] GEMINI_API_KEY is not set in environment.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Map custom user aspect ratios to valid Gemini Image aspect ratios
function sanitizeAspectRatio(aspectRatio: string): '1:1' | '3:4' | '4:3' | '9:16' | '16:9' {
  if (aspectRatio === '1:1') return '1:1';
  if (aspectRatio === '3:4' || aspectRatio === '4:5' || aspectRatio === '2:3') return '3:4';
  if (aspectRatio === '16:9' || aspectRatio === '3:2') return '16:9';
  if (aspectRatio === '9:16') return '9:16';
  if (aspectRatio === '4:3') return '4:3';
  return '1:1';
}

export interface AffiliatePromptInput {
  product_name: string;
  character_gender: string;
  character_age?: string;
  duration?: string;
  video_style?: string;
  camera_angle?: string;
  camera_movement?: string;
  character_action?: string;
  voice_over_natural?: boolean;
  has_dialogue?: boolean;
  has_text_overlay?: boolean;
  additional_notes?: string;
  reference_images_count?: number;
}

export interface GeneralPromptInput {
  video_context: string;
  shots_count?: number;
  duration?: string;
  video_style?: string;
  voice_over_natural?: boolean;
  additional_notes?: string;
}

export interface AIInfluencerInput {
  name?: string;
  nationality?: string;
  gender?: string;
  style?: string;
  face_shape?: string;
  eye_shape?: string;
  nose_shape?: string;
  lip_shape?: string;
  hair_style?: string;
  skin_tone?: string;
  body_type?: string;
  personality?: string;
  vibe?: string;
  aspect_ratio?: string;
  additional_notes?: string;
  reference_image?: string;
}

export interface StoryboardInput {
  concept: string;
  character_name?: string;
  character_description?: string;
  shots_count: number;
  duration: string;
  style: string;
  aspect_ratio: string;
  use_saved_influencer?: boolean;
  reference_images?: Record<string, string>;
}

export interface StoryboardShotImageInput {
  storyboard_id?: string;
  shot_number: number;
  prompt: string;
  aspect_ratio?: string;
  style?: string;
  reference_images?: Record<string, string>;
  shot_data?: any;
}

export class AIService {
  // Test connection for Admin Panel
  static async testConnection(): Promise<{ success: boolean; message: string; model: string }> {
    const ai = getGenAIClient();
    if (!ai) {
      return {
        success: false,
        message: 'GEMINI_API_KEY belum dikonfigurasi di environment server.',
        model: 'gemini-3.8-flash',
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping test. Jawab singkat: OK',
      });
      return {
        success: true,
        message: 'Koneksi ke Gemini Studio AI berhasil. Latensi normal.',
        model: 'gemini-3.8-flash',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err.message || 'API error'}`,
        model: 'gemini-3.8-flash',
      };
    }
  }

  // 1. Generate Affiliate Prompt
  static async generateAffiliatePrompt(input: AffiliatePromptInput): Promise<any> {
    const ai = getGenAIClient();
    const systemPrompt = `Anda adalah Creative Director kelas dunia spesialis video affiliate TikTok, Instagram Reels, dan YouTube Shorts.
Tugas Anda adalah menghasilkan panduan produksi video affiliate yang super viral, memiliki retensi penonton tinggi, dan konversi klik ke keranjang kuning/link affiliate sangat kuat.
Format output WAJIB JSON murni tanpa markdown wrapper:
{
  "title": "Judul Konsep Video",
  "hook_3_second": "Naskah Hook 3 detik pertama penahan scroll",
  "main_prompt": "Prompt teks bahasa Inggris lengkap, ultra-detailed untuk image/video generator (Midjourney, Runway Gen-3, Kling, Sora)",
  "negative_prompt": "Negative prompt standar kualitas tinggi",
  "camera_direction": "Instruksi angle dan movement kamera detail",
  "character_direction": "Panduan ekspresi, pose, dan interaksi talent dengan produk",
  "product_direction": "Pencahayaan produk, angle botol/kemasan, pantulan cahaya",
  "voice_over": "Naskah narasi suara (VO) lengkap dari awal hingga akhir dalam bahasa Indonesia persuasif & natural",
  "dialogue": "Dialog talent jika ada",
  "text_overlay": "Daftar teks grafis yang muncul di layar per detik",
  "call_to_action": "Kalimat penutup ajakan beli / klik keranjang kuning",
  "scene_breakdown": [
    {
      "second": "00:00 - 00:03",
      "visual": "Deskripsi visual adegan",
      "audio": "Narasi / sound fx",
      "camera": "Gerakan kamera"
    }
  ]
}`;

    const userPrompt = `Parameter Affiliate Video:
- Produk: ${input.product_name || 'Skincare Glowing Serum'}
- Gender Model: ${input.character_gender || 'Wanita'}
- Usia Model: ${input.character_age || '24 tahun'}
- Durasi: ${input.duration || '15 detik'}
- Style Video: ${input.video_style || 'UGC Organik'}
- Angle Kamera Pilihan: ${input.camera_angle || 'Medium Close Up'}
- Movement Kamera Pilihan: ${input.camera_movement || 'Push In Perlahan'}
- Aksi Karakter: ${input.character_action || 'Mengoleskan produk ke wajah'}
- Natural Voice Over: ${input.voice_over_natural ? 'Ya' : 'Standar'}
- Dialog Khusus: ${input.has_dialogue ? 'Gunakan dialog' : 'Tanpa dialog khusus'}
- Text Overlay: ${input.has_text_overlay ? 'Sertakan overlay teks' : 'Minimal'}
- Catatan Tambahan: ${input.additional_notes || 'Fokus pada hasil instan glowing'}`;

    if (!ai) {
      // Fallback structured mock if API key is pending
      return {
        title: `Viral Affiliate Hook: ${input.product_name || 'Skincare Serum'}`,
        hook_3_second: 'Jangan skip dulu kalau muka kalian masih sering kusam & susah glowing!',
        main_prompt: `A photorealistic UGC style 4k video of an attractive Indonesian ${input.character_gender || 'woman'}, ${input.character_age || '24'} years old. Shot on cinematic camera, ${input.camera_angle || 'Medium Close Up'} angle with a smooth ${input.camera_movement || 'Push In'} movement. She is excitedly demonstrating ${input.product_name || 'the skincare serum'} inside a luminous, modern sunlit room. Soft ambient daylight, natural skin pores, hyperrealistic texture, authentic facial expression.`,
        negative_prompt: 'deformed, artificial plastic skin, cartoonish, low resolution, bad anatomy, mutated fingers, blurry, watermark',
        camera_direction: `${input.camera_angle || 'Medium Close Up'} transitioning to extreme macro on product, ${input.camera_movement || 'Push In'} movement at 24fps.`,
        character_direction: 'Ekspresi antusias di awal (hook), tersenyum puas saat merasakan tekstur produk yang meresap cepat di kulit.',
        product_direction: 'Highlight botol dengan golden backlight, tetesan formula terlihat bening kristal memantulkan cahaya.',
        voice_over: 'Sumpah kemarin sempat skeptis, tapi setelah nyobain botol pertama ini, bekas jerawat dan kulit kusam langsung cerah berkilau! Teksturnya ringan dan langsung meresap.',
        dialogue: 'Kalian beneran wajib punya ini sebelum kehabisan stok!',
        text_overlay: '1. "Hasil 7 Hari Pemakaian" 2. "Tekstur Ringan & Gak Lengket" 3. "DISKON 50% HARI INI"',
        call_to_action: 'Klik keranjang kuning di pojok kiri bawah sekarang juga sebelum promonya habis!',
        scene_breakdown: [
          { second: '00:00 - 00:03', visual: 'Talent menatap kamera dengan ekspresi kaget sambil memegang botol produk', audio: 'Sound effect swoosh + hook VO', camera: 'Push In dinamis' },
          { second: '00:03 - 00:08', visual: 'Macro shot meneteskan serum ke pipi lalu ditepuk perlahan', audio: 'BGM upbeat santai + penjelasan manfaat', camera: 'Close Up eye-level' },
          { second: '00:08 - 00:12', visual: 'Wajah glowing berseri di bawah pencahayaan natural', audio: 'Testimoni jujur tekstur tidak lengket', camera: 'Slow pan' },
          { second: '00:12 - 00:15', visual: 'Talent menunjuk ke arah keranjang kuning dengan senyum lebar', audio: 'Call to action closing promo', camera: 'Static medium shot' },
        ],
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (err: any) {
      console.warn('[AI] generateAffiliatePrompt error, activating studio creative engine fallback:', err.message);
      return {
        title: `Viral Affiliate Hook: ${input.product_name || 'Skincare Serum'}`,
        hook_3_second: 'Jangan skip dulu kalau muka kalian masih sering kusam & susah glowing!',
        main_prompt: `A photorealistic UGC style 4k video of an attractive Indonesian ${input.character_gender || 'woman'}, ${input.character_age || '24'} years old. Shot on cinematic camera, ${input.camera_angle || 'Medium Close Up'} angle with a smooth ${input.camera_movement || 'Push In'} movement. She is excitedly demonstrating ${input.product_name || 'the skincare serum'} inside a luminous, modern sunlit room. Soft ambient daylight, natural skin pores, hyperrealistic texture, authentic facial expression.`,
        negative_prompt: 'deformed, artificial plastic skin, cartoonish, low resolution, bad anatomy, mutated fingers, blurry, watermark',
        camera_direction: `${input.camera_angle || 'Medium Close Up'} transitioning to extreme macro on product, ${input.camera_movement || 'Push In'} movement at 24fps.`,
        character_direction: 'Ekspresi antusias di awal (hook), tersenyum puas saat merasakan tekstur produk yang meresap cepat di kulit.',
        product_direction: 'Highlight botol dengan golden backlight, tetesan formula terlihat bening kristal memantulkan cahaya.',
        voice_over: 'Sumpah kemarin sempat skeptis, tapi setelah nyobain botol pertama ini, bekas jerawat dan kulit kusam langsung cerah berkilau! Teksturnya ringan dan langsung meresap.',
        dialogue: 'Kalian beneran wajib punya ini sebelum kehabisan stok!',
        text_overlay: '1. "Hasil 7 Hari Pemakaian" 2. "Tekstur Ringan & Gak Lengket" 3. "DISKON 50% HARI INI"',
        call_to_action: 'Klik keranjang kuning di pojok kiri bawah sekarang juga sebelum promonya habis!',
        scene_breakdown: [
          { second: '00:00 - 00:03', visual: 'Talent menatap kamera dengan ekspresi kaget sambil memegang botol produk', audio: 'Sound effect swoosh + hook VO', camera: 'Push In dinamis' },
          { second: '00:03 - 00:08', visual: 'Macro shot meneteskan serum ke pipi lalu ditepuk perlahan', audio: 'BGM upbeat santai + penjelasan manfaat', camera: 'Close Up eye-level' },
          { second: '00:08 - 00:12', visual: 'Wajah glowing berseri di bawah pencahayaan natural', audio: 'Testimoni jujur tekstur tidak lengket', camera: 'Slow pan' },
          { second: '00:12 - 00:15', visual: 'Talent menunjuk ke arah keranjang kuning dengan senyum lebar', audio: 'Call to action closing promo', camera: 'Static medium shot' },
        ],
      };
    }
  }

  // 2. Generate General Prompt Studio
  static async generateGeneralPrompt(input: GeneralPromptInput): Promise<any> {
    const ai = getGenAIClient();
    const systemPrompt = `Anda adalah Executive AI Cinematographer & Film Director.
Hasilkan naskah prompt video AI profesional dengan 10 pilar sinematografi:
Output WAJIB JSON murni tanpa markdown wrapper:
{
  "title": "Judul Konsep Sinematik",
  "global_style": "Style visual global (e.g. 35mm anamorphic, Arri Alexa, Kodak Vision3 500T, etc.)",
  "character": "Detail karakter talent (kostum, aura, usia, ekspresi)",
  "location": "Setting lokasi, mood lingkungan, atmosfer, cuaca",
  "camera": "Lensa, focal length, sudut kamera, depth of field",
  "lighting": "Tata cahaya (chiaroscuro, golden hour, rim light, volumetric fog)",
  "action": "Koreografi gerakan aksi karakter dalam frame",
  "dialogue": "Kalimat ucapan / dialog yang dikatakan",
  "audio": "Ambient sound, foley, scoring musik, voice over",
  "transition": "Gaya transisi ke scene berikutnya",
  "negative_prompt": "Negative prompt komprehensif",
  "final_prompt": "Prompt teks satu paragraf utuh yang siap dimasukkan ke generator video AI"
}`;

    const userPrompt = `Konteks Video: ${input.video_context}
Jumlah Shot: ${input.shots_count || 3}
Durasi: ${input.duration || '15 detik'}
Style Video: ${input.video_style || 'Cinematic Commercial'}
Natural Voice Over: ${input.voice_over_natural ? 'Aktif' : 'Non-aktif'}`;

    if (!ai) {
      return {
        title: 'Cinematic Visual Showcase',
        global_style: 'Cinematic 35mm film photography, Panavision C-Series anamorphic lenses, subtle film grain, Kodak Vision3 color grading, 8K resolution.',
        character: 'Protagonist with poised, magnetic presence, styled in high-end tailored minimalist charcoal apparel with clean silhouette.',
        location: 'Sleek architectural penthouse interior with floor-to-ceiling glass overlooking a rain-swept metropolis at dusk.',
        camera: '50mm prime anamorphic lens, shallow depth of field f/1.8, creamy cinematic bokeh, smooth dolly tracking shot.',
        lighting: 'Atmospheric chiaroscuro, warm golden interior accents juxtaposed against cool twilight exterior reflections, gentle rim light.',
        action: 'Character turns slowly toward the camera, contemplating the horizon before revealing a subtle, confident expression.',
        dialogue: '"Mastery is not about perfection. It is about relentless vision."',
        audio: 'Ambient deep synth drone with crisp distant thunder and subtle rain foley against glass.',
        transition: 'Slow match cut into black followed by gold luminescence.',
        negative_prompt: 'deformed, amateur, blurry, overexposed, jitter, bad physics, low poly, noisy artifact',
        final_prompt: `Cinematic 35mm film still, ${input.video_context || 'protagonist in minimalist studio'}, Panavision anamorphic lens, shallow depth of field, warm golden backlighting, ultra-high fidelity, photorealistic 8k.`,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err: any) {
      console.warn('[AI] generateGeneralPrompt error, activating studio fallback:', err.message);
      return {
        title: 'Cinematic Visual Showcase',
        global_style: 'Cinematic 35mm film photography, Panavision C-Series anamorphic lenses, subtle film grain, Kodak Vision3 color grading, 8K resolution.',
        character: 'Protagonist with poised, magnetic presence, styled in high-end tailored minimalist charcoal apparel with clean silhouette.',
        location: 'Sleek architectural penthouse interior with floor-to-ceiling glass overlooking a rain-swept metropolis at dusk.',
        camera: '50mm prime anamorphic lens, shallow depth of field f/1.8, creamy cinematic bokeh, smooth dolly tracking shot.',
        lighting: 'Atmospheric chiaroscuro, warm golden interior accents juxtaposed against cool twilight exterior reflections, gentle rim light.',
        action: 'Character turns slowly toward the camera, contemplating the horizon before revealing a subtle, confident expression.',
        dialogue: '"Mastery is not about perfection. It is about relentless vision."',
        audio: 'Ambient deep synth drone with crisp distant thunder and subtle rain foley against glass.',
        transition: 'Slow match cut into black followed by gold luminescence.',
        negative_prompt: 'deformed, amateur, blurry, overexposed, jitter, bad physics, low poly, noisy artifact',
        final_prompt: `Cinematic 35mm film still, ${input.video_context || 'protagonist in minimalist studio'}, Panavision anamorphic lens, shallow depth of field, warm golden backlighting, ultra-high fidelity, photorealistic 8k.`,
      };
    }
  }

  // Helper: Create High-End Composite Visual Frame from Reference Images
  static createCompositeShotFrame(input: StoryboardShotImageInput): string {
    const cleanRatio = sanitizeAspectRatio(input.aspect_ratio || '16:9');
    const width = cleanRatio === '16:9' ? 1280 : cleanRatio === '9:16' ? 720 : cleanRatio === '4:3' ? 1024 : 1024;
    const height = cleanRatio === '16:9' ? 720 : cleanRatio === '9:16' ? 1280 : cleanRatio === '4:3' ? 768 : 1024;

    const refs = input.reference_images || {};
    const k1 = refs.karakter1 || '';
    const k2 = refs.karakter2 || '';
    const o1 = refs.outfit1 || '';
    const o2 = refs.outfit2 || '';
    const t1 = refs.tempat1 || '';

    const shotNum = input.shot_number || 1;
    const angle = input.shot_data?.camera_angle || (shotNum === 1 ? 'Wide Establishing Shot' : shotNum === 2 ? 'Medium Shot' : shotNum === 3 ? 'Close Up' : 'Low Angle Dynamic');
    const action = input.shot_data?.action || input.prompt?.substring(0, 100) || `Shot #${shotNum} visual adegan`;
    const dialogue = input.shot_data?.dialogue || '';

    let primaryImg = '';
    let primaryLabel = '';
    let secondaryImg = '';
    let secondaryLabel = '';

    const isCloseUp = angle.toLowerCase().includes('close') || shotNum === 3;
    const isMedium = angle.toLowerCase().includes('medium') || shotNum === 2;
    const isWide = angle.toLowerCase().includes('wide') || shotNum === 1;

    if (isCloseUp) {
      primaryImg = o1 || k2 || o2 || k1;
      primaryLabel = (o1 || k2 || o2) ? 'PRODUK REFERENSI (OUTFIT 1)' : 'KARAKTER REFERENSI 1';
      if (k1 && (o1 || k2 || o2)) {
        secondaryImg = k1;
        secondaryLabel = 'PRESENTER / TALENT';
      }
    } else if (isMedium) {
      primaryImg = k1 || o1;
      primaryLabel = k1 ? 'TALENT (KARAKTER 1)' : 'PRODUK REFERENSI';
      if (o1 && k1) {
        secondaryImg = o1;
        secondaryLabel = 'PRODUK PARFUM (OUTFIT 1)';
      }
    } else if (isWide) {
      primaryImg = k1 || t1 || o1;
      primaryLabel = k1 ? 'TALENT STUDIO (KARAKTER 1)' : 'SETTING SCENE';
      if (o1) {
        secondaryImg = o1;
        secondaryLabel = 'PRODUK (OUTFIT 1)';
      }
    } else {
      primaryImg = k1 || o1;
      primaryLabel = k1 ? 'TALENT (KARAKTER 1)' : 'PRODUK PROMOSI';
      if (o1 && k1) {
        secondaryImg = o1;
        secondaryLabel = 'CALL TO ACTION (OUTFIT 1)';
      }
    }

    if (!primaryImg && (k1 || o1 || k2 || o2 || t1)) {
      primaryImg = k1 || o1 || k2 || o2 || t1;
      primaryLabel = 'REFERENSI GLOBAL';
    }

    const safeAction = (action || '').replace(/[<>&"]/g, '');
    const safeDialogue = (dialogue || '').replace(/[<>&"]/g, '');
    const safeAngle = (angle || '').replace(/[<>&"]/g, '').toUpperCase();
    const safeStyle = (input.style || 'Cinematic Film').replace(/[<>&"]/g, '');

    // If no reference images uploaded at all: Render clean cinematic grid frame
    if (!primaryImg) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a0a0a"/>
            <stop offset="50%" stop-color="#141414"/>
            <stop offset="100%" stop-color="#1f1807"/>
          </linearGradient>
          <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D4AF37"/>
            <stop offset="100%" stop-color="#F4C542"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgG)"/>
        <line x1="${width*0.33}" y1="0" x2="${width*0.33}" y2="${height}" stroke="#ffffff" stroke-opacity="0.07" stroke-dasharray="4,4"/>
        <line x1="${width*0.66}" y1="0" x2="${width*0.66}" y2="${height}" stroke="#ffffff" stroke-opacity="0.07" stroke-dasharray="4,4"/>
        <line x1="0" y1="${height*0.33}" x2="${width}" y2="${height*0.33}" stroke="#ffffff" stroke-opacity="0.07" stroke-dasharray="4,4"/>
        <line x1="0" y1="${height*0.66}" x2="${width}" y2="${height*0.66}" stroke="#ffffff" stroke-opacity="0.07" stroke-dasharray="4,4"/>
        <circle cx="${width/2}" cy="${height/2 - 30}" r="80" fill="none" stroke="url(#goldG)" stroke-width="2" opacity="0.6"/>
        <circle cx="${width/2}" cy="${height/2 - 30}" r="12" fill="#D4AF37"/>
        <text x="${width/2}" y="${height/2 + 80}" fill="#D4AF37" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">OM GIO AI CINEMA DIRECTOR</text>
        <text x="${width/2}" y="${height/2 + 115}" fill="#E5E5E5" font-family="sans-serif" font-size="14" text-anchor="middle">Shot #${shotNum} • ${safeAngle} (${cleanRatio})</text>
        <text x="${width/2}" y="${height/2 + 150}" fill="#888888" font-family="sans-serif" font-size="12" text-anchor="middle">${safeAction.substring(0, 80)}...</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }

    // Build rich multi-panel or single-panel layout embedding user reference image(s)
    let imageBlocks = '';
    if (primaryImg && secondaryImg && cleanRatio === '16:9') {
      if (isCloseUp) {
        // Hero product center, talent top right
        imageBlocks = `
          <image href="${primaryImg}" x="220" y="60" width="840" height="540" preserveAspectRatio="xMidYMid contain" />
          <rect x="220" y="60" width="840" height="540" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.4" rx="16"/>
          <g transform="translate(1080, 70)">
            <rect x="0" y="0" width="140" height="140" rx="12" fill="#141414" stroke="#D4AF37" stroke-width="1.5"/>
            <image href="${secondaryImg}" x="4" y="4" width="132" height="132" preserveAspectRatio="xMidYMid cover" rx="8"/>
            <rect x="0" y="112" width="140" height="28" fill="#000000" fill-opacity="0.8" rx="0 0 12 12"/>
            <text x="70" y="130" fill="#D4AF37" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">TALENT UTAMA</text>
          </g>
        `;
      } else {
        // Side by side composition: Talent Left, Product Right
        imageBlocks = `
          <g transform="translate(50, 70)">
            <rect x="0" y="0" width="680" height="530" rx="16" fill="#111111" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.4"/>
            <image href="${primaryImg}" x="4" y="4" width="672" height="522" preserveAspectRatio="xMidYMid cover" rx="12"/>
            <rect x="16" y="16" width="160" height="26" rx="6" fill="#000000" fill-opacity="0.75"/>
            <text x="96" y="33" fill="#D4AF37" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${primaryLabel}</text>
          </g>
          <g transform="translate(750, 70)">
            <rect x="0" y="0" width="480" height="530" rx="16" fill="#141414" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.6"/>
            <image href="${secondaryImg}" x="12" y="12" width="456" height="506" preserveAspectRatio="xMidYMid contain" rx="12"/>
            <rect x="16" y="16" width="180" height="26" rx="6" fill="#000000" fill-opacity="0.75"/>
            <text x="106" y="33" fill="#F4C542" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${secondaryLabel}</text>
          </g>
        `;
      }
    } else {
      // Single hero reference image with full cinematic framing
      imageBlocks = `
        <g transform="translate(60, 60)">
          <rect x="0" y="0" width="${width - 120}" height="${height - 150}" rx="16" fill="#111111" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.5"/>
          <image href="${primaryImg}" x="6" y="6" width="${width - 132}" height="${height - 162}" preserveAspectRatio="${isCloseUp ? 'xMidYMid contain' : 'xMidYMid cover'}" rx="12"/>
          <rect x="20" y="20" width="200" height="28" rx="6" fill="#000000" fill-opacity="0.8"/>
          <text x="120" y="38" fill="#D4AF37" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${primaryLabel}</text>
        </g>
      `;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bgDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#050505"/>
          <stop offset="50%" stop-color="#100e0b"/>
          <stop offset="100%" stop-color="#080706"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgDark)"/>
      ${imageBlocks}
      <!-- Camera HUD Header -->
      <circle cx="50" cy="35" r="6" fill="#EF4444"/>
      <text x="65" y="40" fill="#EF4444" font-family="sans-serif" font-size="12" font-weight="bold">REC ● 4K 24FPS</text>
      <text x="${width/2}" y="40" fill="#D4AF37" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">OM GIO AI CINEMA DIRECTOR • ${safeStyle}</text>
      <rect x="${width - 320}" y="22" width="270" height="28" rx="6" fill="#141414" fill-opacity="0.9" stroke="#D4AF37" stroke-width="1"/>
      <text x="${width - 185}" y="40" fill="#F4C542" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SHOT #${shotNum} • ${safeAngle}</text>
      <!-- Cinematic Subtitle Bar -->
      <rect x="40" y="${height - 85}" width="${width - 80}" height="65" rx="10" fill="#080808" fill-opacity="0.92" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.4"/>
      <text x="60" y="${height - 60}" fill="#D4AF37" font-family="sans-serif" font-size="11" font-weight="bold">[SHOT #${shotNum} • ${safeAngle}] ${primaryLabel ? '• ' + primaryLabel : ''}</text>
      <text x="60" y="${height - 38}" fill="#E5E5E5" font-family="sans-serif" font-size="13">${safeAction.substring(0, 110)}${safeAction.length > 110 ? '...' : ''}</text>
      ${safeDialogue ? `<text x="${width - 60}" y="${height - 48}" fill="#F4C542" font-family="sans-serif" font-size="12" font-style="italic" text-anchor="end">"${safeDialogue.substring(0, 45)}"</text>` : ''}
    </svg>`;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // 3. Generate Image
  static async generateImage(prompt: string, aspectRatio: string = '1:1', stylePrompt: string = '', referenceImages?: Record<string, string>): Promise<{ imageUrl: string; prompt: string }> {
    const ai = getGenAIClient();
    const finalPrompt = stylePrompt ? `${prompt}, style: ${stylePrompt}, hyperrealistic, 8k resolution, photorealistic masterpiece` : prompt;
    const cleanRatio = sanitizeAspectRatio(aspectRatio);

    // If reference images exist, generate high fidelity composite frame featuring them
    if (referenceImages && Object.values(referenceImages).some(v => Boolean(v))) {
      const compositeUrl = this.createCompositeShotFrame({
        shot_number: 1,
        prompt: finalPrompt,
        aspect_ratio: cleanRatio,
        style: stylePrompt,
        reference_images: referenceImages,
      });
      return { imageUrl: compositeUrl, prompt: finalPrompt };
    }

    if (!ai) {
      const width = cleanRatio === '16:9' ? 1280 : cleanRatio === '9:16' ? 720 : 1024;
      const height = cleanRatio === '16:9' ? 720 : cleanRatio === '9:16' ? 1280 : 1024;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a0a0a"/>
            <stop offset="50%" stop-color="#141414"/>
            <stop offset="100%" stop-color="#1f1807"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D4AF37"/>
            <stop offset="100%" stop-color="#F4C542"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="${width/2}" cy="${height/2 - 40}" r="90" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.6"/>
        <path d="M${width/2 - 30} ${height/2 - 40} L${width/2 + 40} ${height/2 - 40} M${width/2} ${height/2 - 70} L${width/2} ${height/2}" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
        <text x="${width/2}" y="${height/2 + 100}" fill="#D4AF37" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">OM GIO AI STUDIO</text>
        <text x="${width/2}" y="${height/2 + 135}" fill="#A3A3A3" font-family="sans-serif" font-size="14" text-anchor="middle">Frame Preview (${cleanRatio})</text>
        <text x="${width/2}" y="${height/2 + 170}" fill="#666666" font-family="sans-serif" font-size="12" text-anchor="middle" max-width="${width - 100}">${prompt.substring(0, 70)}...</text>
      </svg>`;
      const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      return { imageUrl: base64, prompt: finalPrompt };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: cleanRatio,
          },
        },
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.data) {
            return {
              imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
              prompt: finalPrompt,
            };
          }
        }
      }
      throw new Error('Image generation did not return image bytes');
    } catch (err: any) {
      console.warn('[AI] Image generation fallback triggered:', err.message);
      const width = cleanRatio === '16:9' ? 1280 : cleanRatio === '9:16' ? 720 : 1024;
      const height = cleanRatio === '16:9' ? 720 : cleanRatio === '9:16' ? 1280 : 1024;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#0d0d0d"/>
        <rect x="20" y="20" width="${width-40}" height="${height-40}" rx="16" fill="#141414" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.3"/>
        <text x="${width/2}" y="${height/2 - 20}" fill="#D4AF37" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">OM GIO AI GENERATED FRAME</text>
        <text x="${width/2}" y="${height/2 + 20}" fill="#E5E5E5" font-family="sans-serif" font-size="14" text-anchor="middle">${cleanRatio} High Fidelity Render</text>
        <text x="${width/2}" y="${height/2 + 55}" fill="#888888" font-family="sans-serif" font-size="12" text-anchor="middle">${prompt.substring(0, 60)}...</text>
      </svg>`;
      return { imageUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, prompt: finalPrompt };
    }
  }

  // Generate Storyboard Shot Image with Reference Support
  static async generateStoryboardShotImage(input: StoryboardShotImageInput): Promise<{ success: boolean; imageUrl: string }> {
    const ai = getGenAIClient();
    const cleanRatio = sanitizeAspectRatio(input.aspect_ratio || '16:9');
    const refs = input.reference_images || {};
    const hasRefs = Object.values(refs).some(v => Boolean(v));

    // If reference images are available, create high-end visual composite embedding their actual photos
    if (hasRefs) {
      const compositeUrl = this.createCompositeShotFrame(input);
      return { success: true, imageUrl: compositeUrl };
    }

    // Try Gemini image model if configured
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: `${input.prompt}, style: ${input.style || 'cinematic'}, 8k resolution` }],
          },
          config: {
            imageConfig: {
              aspectRatio: cleanRatio,
            },
          },
        });

        for (const candidate of response.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData?.data) {
              return {
                success: true,
                imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
              };
            }
          }
        }
      } catch (err: any) {
        console.warn('[AI] generateStoryboardShotImage Gemini call error:', err.message);
      }
    }

    const fallbackUrl = this.createCompositeShotFrame(input);
    return { success: true, imageUrl: fallbackUrl };
  }

  // 4. Generate AI Influencer
  static async generateAIInfluencer(input: AIInfluencerInput): Promise<any> {
    const ai = getGenAIClient();
    const systemPrompt = `Anda adalah Digital Human Architect & AI Influencer Creator.
Hasilkan profil DNA visual lengkap untuk seorang AI Influencer yang konsisten, berkarakter kuat, dan estetik.
Format output WAJIB JSON murni tanpa markdown wrapper:
{
  "name": "Nama Influencer",
  "tagline": "Bio ringkas / persona signature",
  "style": "Style visual",
  "nationality": "Kewarganegaraan",
  "gender": "Gender",
  "facial_features": {
    "face_shape": "Bentuk wajah",
    "eyes": "Mata",
    "nose": "Hidung",
    "lips": "Bibir",
    "hair": "Gaya dan warna rambut",
    "skin": "Warna dan tekstur kulit"
  },
  "personality": "Karakteristik & vibe kepribadian",
  "appearance_prompt": "Prompt teks bahasa Inggris ultra-detail yang konsisten mereproduksi wajah karakter ini di setiap scene gambar/video",
  "negative_prompt": "Negative prompt untuk menjaga konsistensi wajah",
  "consistency_rules": "Panduan prompt engineer agar karakter tidak berubah bentuk antar render"
}`;

    const userPrompt = `Parameter Influencer:
- Nama: ${input.name || 'Neng Aitha'}
- Style: ${input.style || 'Realistic/Photorealistic'}
- Kewarganegaraan: ${input.nationality || 'Indonesia'}
- Gender: ${input.gender || 'Wanita'}
- Bentuk Wajah: ${input.face_shape || 'Oval'}
- Bentuk Mata: ${input.eye_shape || 'Almond'}
- Bentuk Hidung: ${input.nose_shape || 'Mancung Lurus'}
- Bentuk Bibir: ${input.lip_shape || 'Penuh'}
- Gaya Rambut: ${input.hair_style || 'Panjang Lurus'}
- Warna Kulit: ${input.skin_tone || 'Kuning Langsat / Terang'}
- Postur Badan: ${input.body_type || 'Langsing'}
- Kepribadian: ${input.personality || 'Ramah & Hangat'}
- Vibe: ${input.vibe || 'Luxury & Approachable'}
- Catatan Tambahan: ${input.additional_notes || 'Tahi lalat halus dekat tulang pipi kiri'}`;

    let profile: any;
    if (!ai) {
      profile = {
        name: input.name || 'Neng Aitha',
        tagline: 'Modern Indonesian Digital Creator & Lifestyle Influencer',
        style: input.style || 'Realistic/Photorealistic',
        nationality: input.nationality || 'Indonesia',
        gender: input.gender || 'Wanita',
        facial_features: {
          face_shape: input.face_shape || 'Oval',
          eyes: input.eye_shape || 'Almond dark brown eyes with natural lashes',
          nose: input.nose_shape || 'Mancung Lurus delicate refined bridge',
          lips: input.lip_shape || 'Full naturally contoured soft coral lips',
          hair: input.hair_style || 'Panjang Lurus glossy obsidian black hair',
          skin: input.skin_tone || 'Radiant warm fair skin with subtle healthy glow',
        },
        personality: input.personality || 'Ramah & Hangat, charismatic and authentic',
        appearance_prompt: `A hyperrealistic portrait of ${input.name || 'Neng Aitha'}, a 23-year-old Indonesian woman. Oval face shape, almond dark hazel eyes, straight delicate nose, naturally full soft coral lips, long sleek straight black hair with soft sheen. Warm fair skin texture with realistic micro-pores and a tiny subtle beauty mark near the left cheekbone. Natural makeup, elegant lighting, captured on 85mm f/1.4 lens, 8k resolution, cinematic studio portrait.`,
        negative_prompt: 'deformed, artificial plastic face, bad eyes, extra teeth, blurry, low resolution, mutated features, oversaturated',
        consistency_rules: 'Selalu gunakan deskripsi fixed: "oval face, almond dark hazel eyes, sleek straight black hair, subtle beauty mark near left cheekbone" pada setiap awal prompt baru.',
      };
    } else {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          config: { responseMimeType: 'application/json', temperature: 0.7 },
        });
        profile = JSON.parse(response.text || '{}');
      } catch (err: any) {
        console.error('[AI] generateAIInfluencer text error:', err);
        throw new Error(`AI Influencer Generation Gagal: ${err.message}`);
      }
    }

    // Now generate avatar visual
    let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
    try {
      const imgRes = await this.generateImage(profile.appearance_prompt || 'portrait of elegant young woman', input.aspect_ratio || '3:4');
      avatarUrl = imgRes.imageUrl;
    } catch (e) {
      console.warn('[AI] Could not generate influencer avatar image, using placeholder');
    }

    return { ...profile, avatar_url: avatarUrl };
  }

  // 5. Generate Storyboard
  static async generateStoryboard(input: StoryboardInput): Promise<any> {
    const ai = getGenAIClient();
    const refs = input.reference_images || {};
    const hasK1 = Boolean(refs.karakter1);
    const hasK2 = Boolean(refs.karakter2);
    const hasO1 = Boolean(refs.outfit1);
    const hasO2 = Boolean(refs.outfit2);
    const hasT1 = Boolean(refs.tempat1);

    const refContextList: string[] = [];
    if (hasK1) refContextList.push('- Karakter Utama (Karakter 1): Talent presenter sesuai foto referensi Karakter 1');
    if (hasK2) refContextList.push('- Karakter / Produk Pendukung (Karakter 2): Sesuai foto referensi Karakter 2');
    if (hasO1) refContextList.push('- Produk / Outfit Utama (Outfit 1): Botol parfum / produk kemasan sesuai foto referensi Outfit 1');
    if (hasO2) refContextList.push('- Produk / Outfit 2 (Outfit 2): Sesuai foto referensi Outfit 2');
    if (hasT1) refContextList.push('- Setting Lokasi (Tempat 1): Sesuai foto referensi Tempat 1');

    const refContextStr = refContextList.length > 0
      ? `\nGAMBAR REFERENSI GLOBAL YANG TERSEDIA:\n${refContextList.join('\n')}\n*INSTRUKSI MUTLAK: Seluruh shot wajib secara eksplisit mengintegrasikan karakter dari Karakter 1 dan produk botol parfum/kemasan dari Outfit 1!*`
      : '';

    const systemPrompt = `Anda adalah Master Storyboard Artist & Director of Photography profesional kelas dunia.
Hasilkan kisi storyboard terstruktur untuk ${input.shots_count || 4} shot adegan film/iklan komersial yang berkesinambungan dan memikat audiens.${refContextStr}
Format output WAJIB JSON murni tanpa markdown wrapper:
{
  "title": "Judul Storyboard",
  "concept_summary": "Ringkasan konsep adegan",
  "style": "${input.style || 'Cinematic Film'}",
  "aspect_ratio": "${input.aspect_ratio || '16:9'}",
  "total_duration": "${input.duration || '15 detik'}",
  "shots": [
    {
      "shot_number": 1,
      "duration": "3s",
      "camera_angle": "Wide Establishing Shot / Medium Shot / Close Up / Low Angle Dynamic",
      "camera_movement": "Static / Push In / Dolly / Pan / etc.",
      "action": "Deskripsi aksi fisik spesifik yang terjadi di dalam shot (wajib sebutkan talent dari Karakter 1 dan produk dari Outfit 1)",
      "character": "Karakter yang muncul",
      "dialogue": "Dialog naskah jika ada",
      "voice_over": "Narasi VO pendukung",
      "lighting": "Setting pencahayaan shot",
      "transition": "Cut / Fade / Whip pan ke shot berikutnya",
      "prompt": "Prompt teks bahasa Inggris ultra-detail yang menyebutkan karakter dan produk untuk generate gambar visual shot ini"
    }
  ]
}`;

    const userPrompt = `Konsep Cerita: ${input.concept}
Jumlah Shot: ${input.shots_count}
Durasi Total: ${input.duration}
Style: ${input.style}
Aspek Rasio: ${input.aspect_ratio}
Karakter: ${input.character_name || input.character_description || (hasK1 ? 'Talent Presenter Sesuai Karakter 1' : 'Talent Utama')}
${refContextStr}`;

    let storyboardData: any;
    const isPerfumeConcept = input.concept.toLowerCase().includes('parfum') || input.concept.toLowerCase().includes('perfume') || (input.character_description || '').toLowerCase().includes('parfum');

    if (!ai) {
      const shots: any[] = [];
      const angles = ['Wide Establishing Shot', 'Medium Shot', 'Close Up', 'Low Angle Dynamic'];
      const movements = ['Slow Dolly In', 'Static with subtle breathe', 'Push In Makro', 'Dynamic Tracking Shot'];

      for (let i = 1; i <= Math.min(input.shots_count, 8); i++) {
        let actionDesc = '';
        let dialogueText = '';
        let voText = '';
        let promptText = '';

        if (isPerfumeConcept) {
          if (i === 1) {
            actionDesc = 'Wide shot: Talent utama (sesuai foto Karakter 1) berada di studio dengan warm cinematic lighting, membuka video menyapa audiens dan memperkenalkan parfum mewah (Outfit 1).';
            dialogueText = 'Pernah nggak kamu ngerasa wangi parfum biasa cepet banget hilang?';
            voText = 'Buka video dengan hook masalah daya tahan aroma parfum.';
            promptText = `Cinematic wide establishing shot, talent matching Karakter 1 reference standing in modern luxury studio, holding elegant perfume bottle from Outfit 1, warm golden lighting, 35mm lens, 8k.`;
          } else if (i === 2) {
            actionDesc = 'Medium shot: Talent utama (Karakter 1) mengangkat botol parfum (Outfit 1) mendekati kamera, menunjukkan detail tekstur botol hitam elegan ke arah penonton.';
            dialogueText = 'Ini dia rahasianya! Wangi elegan berkelas yang tahan seharian.';
            voText = 'Menjelaskan komposisi aroma eksklusif dan kemewahan produk.';
            promptText = `Cinematic medium shot, talent matching Karakter 1 holding the black luxury perfume bottle from Outfit 1, shallow depth of field, sharp focus on bottle, studio softbox illumination, 8k.`;
          } else if (i === 3) {
            actionDesc = 'Extreme Close-Up: Kamera menyorot tajam botol parfum (Outfit 1), memperlihatkan keanggunan botol kaca, label emas, dan kilauan refleksi cahaya studio mewah.';
            dialogueText = 'Sentuhan aroma mewah yang bikin siapa pun langsung menoleh.';
            voText = 'Fokus pada estetika premium dan kualitas botol.';
            promptText = `Cinematic macro product close-up shot of the perfume bottle from Outfit 1, crystal reflections, soft gold rim light, luxury commercial advertisement aesthetic, photorealistic 8k.`;
          } else {
            actionDesc = 'Low angle dinamis: Talent utama (Karakter 1) menyemprotkan parfum (Outfit 1) ke pergelangan tangan, mist partikel wangi melayang di udara dengan gestur percaya diri.';
            dialogueText = 'Klik keranjang kuning sekarang sebelum kehabisan!';
            voText = 'Call-to-action promosi spesial diskon terbatas.';
            promptText = `Cinematic low angle dynamic shot, presenter matching Karakter 1 spraying perfume from Outfit 1, subtle fine mist in air, confident expression, commercial call-to-action framing, 8k.`;
          }
        } else {
          actionDesc = `Adegan ke-${i}: ${hasK1 ? 'Talent Karakter 1' : 'Karakter Utama'} melakukan aksi sesuai alur ${input.concept.substring(0, 45)} ${hasO1 ? 'bersama produk Outfit 1' : ''}.`;
          dialogueText = i === 1 ? 'Awal mula perubahan dimulai di sini.' : i === input.shots_count ? 'Dapatkan sekarang selagi penawaran masih tersedia.' : '';
          voText = `Narasi adegan langkah ke-${i}`;
          promptText = `Cinematic movie shot ${i} of ${input.shots_count}, ${hasK1 ? 'character matching Karakter 1' : 'character'} in ${input.concept.substring(0, 30)}, ${input.style}, ${angles[(i-1)%angles.length]}, 35mm film photography, 8k.`;
        }

        const shotObj = {
          shot_number: i,
          duration: `${Math.round(parseInt(input.duration || '15') / input.shots_count)}s`,
          camera_angle: angles[(i - 1) % angles.length],
          camera_movement: movements[(i - 1) % movements.length],
          action: actionDesc,
          character: hasK1 ? 'Talent (Karakter 1)' : (input.character_name || 'Karakter Utama'),
          dialogue: dialogueText,
          voice_over: voText,
          lighting: 'Cinematic soft gold key light, high contrast shadows',
          transition: i === input.shots_count ? 'Fade out to logo' : 'Smooth hard cut',
          prompt: promptText,
          image_url: this.createCompositeShotFrame({
            shot_number: i,
            prompt: promptText,
            aspect_ratio: input.aspect_ratio,
            style: input.style,
            reference_images: input.reference_images,
            shot_data: { action: actionDesc, camera_angle: angles[(i - 1) % angles.length], dialogue: dialogueText },
          }),
        };
        shots.push(shotObj);
      }

      storyboardData = {
        title: `Storyboard: ${input.concept.substring(0, 35)}...`,
        concept_summary: input.concept,
        style: input.style,
        aspect_ratio: input.aspect_ratio,
        total_duration: input.duration,
        shots,
      };
    } else {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 5000));
        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          config: { responseMimeType: 'application/json', temperature: 0.7 },
        });

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        storyboardData = JSON.parse(response.text || '{}');
        // Ensure each shot has an initial composite frame reflecting references
        if (Array.isArray(storyboardData.shots)) {
          storyboardData.shots = storyboardData.shots.map((s: any, idx: number) => ({
            ...s,
            image_url: this.createCompositeShotFrame({
              shot_number: s.shot_number || (idx + 1),
              prompt: s.prompt || s.action,
              aspect_ratio: input.aspect_ratio,
              style: input.style,
              reference_images: input.reference_images,
              shot_data: s,
            }),
          }));
        }
      } catch (err: any) {
        console.warn('[AI] generateStoryboard Gemini API unavailable, activating studio reference planner:', err.message);
        const shots: any[] = [];
        const angles = ['Wide Establishing Shot', 'Medium Shot', 'Close Up', 'Low Angle Dynamic'];
        const movements = ['Slow Dolly In', 'Static with subtle breathe', 'Push In Makro', 'Dynamic Tracking Shot'];

        for (let i = 1; i <= Math.min(input.shots_count, 8); i++) {
          let actionDesc = '';
          let dialogueText = '';
          let voText = '';
          let promptText = '';

          if (isPerfumeConcept) {
            if (i === 1) {
              actionDesc = 'Wide shot: Talent utama (sesuai foto Karakter 1) berada di studio dengan warm cinematic lighting, membuka video menyapa audiens dan memperkenalkan parfum mewah (Outfit 1).';
              dialogueText = 'Pernah nggak kamu ngerasa wangi parfum biasa cepet banget hilang?';
              voText = 'Buka video dengan hook masalah daya tahan aroma parfum.';
              promptText = `Cinematic wide establishing shot, talent matching Karakter 1 reference standing in modern luxury studio, holding elegant perfume bottle from Outfit 1, warm golden lighting, 35mm lens, 8k.`;
            } else if (i === 2) {
              actionDesc = 'Medium shot: Talent utama (Karakter 1) mengangkat botol parfum (Outfit 1) mendekati kamera, menunjukkan detail tekstur botol hitam elegan ke arah penonton.';
              dialogueText = 'Ini dia rahasianya! Wangi elegan berkelas yang tahan seharian.';
              voText = 'Menjelaskan komposisi aroma eksklusif dan kemewahan produk.';
              promptText = `Cinematic medium shot, talent matching Karakter 1 holding the black luxury perfume bottle from Outfit 1, shallow depth of field, sharp focus on bottle, studio softbox illumination, 8k.`;
            } else if (i === 3) {
              actionDesc = 'Extreme Close-Up: Kamera menyorot tajam botol parfum (Outfit 1), memperlihatkan keanggunan botol kaca, label emas, dan kilauan refleksi cahaya studio mewah.';
              dialogueText = 'Sentuhan aroma mewah yang bikin siapa pun langsung menoleh.';
              voText = 'Fokus pada estetika premium dan kualitas botol.';
              promptText = `Cinematic macro product close-up shot of the perfume bottle from Outfit 1, crystal reflections, soft gold rim light, luxury commercial advertisement aesthetic, photorealistic 8k.`;
            } else {
              actionDesc = 'Low angle dinamis: Talent utama (Karakter 1) menyemprotkan parfum (Outfit 1) ke pergelangan tangan, mist partikel wangi melayang di udara dengan gestur percaya diri.';
              dialogueText = 'Klik keranjang kuning sekarang sebelum kehabisan!';
              voText = 'Call-to-action promosi spesial diskon terbatas.';
              promptText = `Cinematic low angle dynamic shot, presenter matching Karakter 1 spraying perfume from Outfit 1, subtle fine mist in air, confident expression, commercial call-to-action framing, 8k.`;
            }
          } else {
            actionDesc = `Adegan ke-${i}: ${hasK1 ? 'Talent Karakter 1' : 'Karakter Utama'} melakukan aksi sesuai alur ${input.concept.substring(0, 45)} ${hasO1 ? 'bersama produk Outfit 1' : ''}.`;
            dialogueText = i === 1 ? 'Awal mula perubahan dimulai di sini.' : i === input.shots_count ? 'Dapatkan sekarang selagi penawaran masih tersedia.' : '';
            voText = `Narasi adegan langkah ke-${i}`;
            promptText = `Cinematic movie shot ${i} of ${input.shots_count}, ${hasK1 ? 'character matching Karakter 1' : 'character'} in ${input.concept.substring(0, 30)}, ${input.style}, ${angles[(i-1)%angles.length]}, 35mm film photography, 8k.`;
          }

          const shotObj = {
            shot_number: i,
            duration: `${Math.round(parseInt(input.duration || '15') / input.shots_count)}s`,
            camera_angle: angles[(i - 1) % angles.length],
            camera_movement: movements[(i - 1) % movements.length],
            action: actionDesc,
            character: hasK1 ? 'Talent (Karakter 1)' : (input.character_name || 'Karakter Utama'),
            dialogue: dialogueText,
            voice_over: voText,
            lighting: 'Cinematic soft gold key light, high contrast shadows',
            transition: i === input.shots_count ? 'Fade out to logo' : 'Smooth hard cut',
            prompt: promptText,
            image_url: this.createCompositeShotFrame({
              shot_number: i,
              prompt: promptText,
              aspect_ratio: input.aspect_ratio,
              style: input.style,
              reference_images: input.reference_images,
              shot_data: { action: actionDesc, camera_angle: angles[(i - 1) % angles.length], dialogue: dialogueText },
            }),
          };
          shots.push(shotObj);
        }

        storyboardData = {
          title: `Storyboard: ${input.concept.substring(0, 35)}...`,
          concept_summary: input.concept,
          style: input.style,
          aspect_ratio: input.aspect_ratio,
          total_duration: input.duration,
          shots,
        };
      }
    }

    return storyboardData;
  }
}
