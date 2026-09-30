import fs from 'fs';
import path from 'path';

// Data types matching our relational PostgreSQL database model
export type UserRole = 'ADMIN' | 'PRO' | 'USER' | 'SUSPENDED';
export type MembershipType = 'PRO_LIFETIME' | 'FREE' | 'NONE';
export type MembershipStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'NONE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'NONE';
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type AssetCategory = 'IMAGE' | 'VIDEO' | 'CHARACTER' | 'PRODUCT' | 'OUTFIT' | 'LOCATION' | 'PROMPT' | 'STORYBOARD';
export type GenerationModule = 'AFFILIATE_PROMPT' | 'GENERAL_PROMPT' | 'IMAGE_GEN' | 'AI_INFLUENCER' | 'STORYBOARD';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: UserRole;
  membership_status: MembershipStatus;
  membership_type: MembershipType;
  lifetime_access: boolean;
  payment_status: PaymentStatus;
  payment_reference?: string;
  activated_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  provider: 'LYNK' | 'MANUAL';
  provider_transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_url: string;
  proof_image?: string;
  notes?: string;
  paid_at?: string | null;
  verified_at?: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  type: MembershipType;
  status: MembershipStatus;
  lifetime: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  thumbnail?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  project_id?: string | null;
  name: string;
  category: AssetCategory;
  file_type: string;
  url: string;
  size?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Character {
  id: string;
  user_id: string;
  project_id?: string | null;
  name: string;
  avatar: string;
  style: string;
  nationality: string;
  gender: string;
  face_shape: string;
  eye_shape: string;
  nose_shape: string;
  lip_shape: string;
  hair_style: string;
  skin_tone: string;
  body_type: string;
  personality: string;
  vibe: string;
  appearance_prompt: string;
  negative_prompt?: string;
  aspect_ratio?: string;
  notes?: string;
  created_at: string;
}

export interface PromptItem {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  category: 'AFFILIATE' | 'GENERAL' | 'IMAGE' | 'VIDEO' | 'INFLUENCER' | 'STORYBOARD' | 'PRODUCT';
  content: string;
  negative_prompt?: string;
  structured_data?: Record<string, any>;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  template_data: Record<string, any>;
  is_system: boolean;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  project_id?: string | null;
  module: GenerationModule;
  prompt_input: Record<string, any>;
  result_data: Record<string, any>;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  model: string;
  error_message?: string;
  created_at: string;
}

export interface StoryboardShot {
  shot_number: number;
  duration: string;
  camera_angle: string;
  camera_movement: string;
  action: string;
  character: string;
  dialogue?: string;
  voice_over?: string;
  lighting?: string;
  transition?: string;
  prompt: string;
  image_url?: string;
}

export interface Storyboard {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  concept: string;
  character_description?: string;
  character_id?: string | null;
  character_name?: string;
  style: string;
  aspect_ratio: string;
  total_shots: number;
  total_duration: string;
  reference_images?: Record<string, string>;
  shots: StoryboardShot[];
  created_at: string;
  updated_at: string;
}

export interface AIProvider {
  id: string;
  name: string;
  provider_type: 'GEMINI' | 'OPENAI' | 'CUSTOM';
  api_key_masked: string;
  status: 'ACTIVE' | 'DISABLED';
  active_text_model: string;
  active_image_model: string;
  is_default: boolean;
  daily_limit: number;
  monthly_limit: number;
  last_tested_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  module: string;
  model: string;
  tokens_used: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  created_at: string;
}

export interface SystemSettings {
  app_name: string;
  tagline: string;
  gold_primary: string;
  pricing_idr: string;
  pricing_usd: string;
  payment_url: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  default_role: UserRole;
  default_daily_limit: number;
  updated_at: string;
}

interface DatabaseSchema {
  users: User[];
  payments: Payment[];
  memberships: Membership[];
  projects: Project[];
  assets: Asset[];
  characters: Character[];
  prompts: PromptItem[];
  prompt_templates: PromptTemplate[];
  generations: Generation[];
  storyboards: Storyboard[];
  ai_providers: AIProvider[];
  usage_logs: UsageLog[];
  audit_logs: AuditLog[];
  notifications: Notification[];
  system_settings: SystemSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'om_gio_studio.json');

// Initial seed data
const initialData: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_master',
      google_id: 'google_118029384756',
      email: process.env.ADMIN_EMAIL || 'yondol157@gmail.com',
      name: 'Om Gio (Creative Director)',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'ADMIN',
      membership_status: 'ACTIVE',
      membership_type: 'PRO_LIFETIME',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      payment_reference: 'LYNK-MASTER-ADMIN-001',
      activated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      expires_at: null,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    },
    {
      id: 'usr_pro_budi',
      google_id: 'google_229104958172',
      email: 'budi.creative@gmail.com',
      name: 'Budi Santoso',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'PRO',
      membership_status: 'ACTIVE',
      membership_type: 'PRO_LIFETIME',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      payment_reference: 'LYNK-TX-992819',
      activated_at: new Date('2026-02-15T10:00:00Z').toISOString(),
      expires_at: null,
      created_at: new Date('2026-02-15T09:30:00Z').toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    },
    {
      id: 'usr_free_siti',
      google_id: 'google_338192049182',
      email: 'siti.agency@gmail.com',
      name: 'Siti Rahmawati',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
      membership_status: 'NONE',
      membership_type: 'FREE',
      lifetime_access: false,
      payment_status: 'NONE',
      created_at: new Date('2026-03-01T08:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    },
  ],
  payments: [
    {
      id: 'pay_001_budi',
      user_id: 'usr_pro_budi',
      user_email: 'budi.creative@gmail.com',
      user_name: 'Budi Santoso',
      provider: 'LYNK',
      provider_transaction_id: 'LYNK-TX-992819',
      amount: 249000,
      currency: 'IDR',
      status: 'VERIFIED',
      payment_url: 'https://lynk.id/omgio/s/pro-lifetime',
      paid_at: new Date('2026-02-15T09:45:00Z').toISOString(),
      verified_at: new Date('2026-02-15T10:00:00Z').toISOString(),
      created_at: new Date('2026-02-15T09:30:00Z').toISOString(),
    },
    {
      id: 'pay_demo_pending',
      user_id: 'usr_free_siti',
      user_email: 'siti.agency@gmail.com',
      user_name: 'Siti Rahmawati',
      provider: 'MANUAL',
      provider_transaction_id: 'REF-BCA-847291',
      amount: 249000,
      currency: 'IDR',
      status: 'PENDING',
      payment_url: 'https://lynk.id/omgio/s/pro-lifetime',
      proof_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      notes: 'Transfer manual Lynk / Virtual Account BCA atas nama Siti Rahmawati',
      created_at: new Date('2026-03-02T11:20:00Z').toISOString(),
    },
  ],
  memberships: [
    {
      id: 'mem_admin',
      user_id: 'usr_admin_master',
      type: 'PRO_LIFETIME',
      status: 'ACTIVE',
      lifetime: true,
      starts_at: '2026-01-01T00:00:00Z',
      expires_at: null,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'mem_budi',
      user_id: 'usr_pro_budi',
      type: 'PRO_LIFETIME',
      status: 'ACTIVE',
      lifetime: true,
      starts_at: '2026-02-15T10:00:00Z',
      expires_at: null,
      created_at: '2026-02-15T10:00:00Z',
    },
  ],
  projects: [
    {
      id: 'proj_skincare_viral',
      user_id: 'usr_admin_master',
      name: 'Kampanye Skincare Glowing Serum Viral',
      description: 'Asset produksi affiliate video TikTok & Reels untuk peluncuran serum pencerah kulit.',
      thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80',
      status: 'IN_PROGRESS',
      created_at: new Date('2026-03-10T10:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'proj_fashion_lookbook',
      user_id: 'usr_admin_master',
      name: 'AI Influencer Lookbook Urban Chic',
      description: 'Koleksi visual influencer digital untuk katalog busana kasual modern.',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      created_at: new Date('2026-03-15T12:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'proj_tech_gadget',
      user_id: 'usr_pro_budi',
      name: 'TWS Earbuds Commercial Launch',
      description: 'Naskah prompt dan storyboard cinematic 6 shot unboxing earbuds.',
      thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
      status: 'IN_PROGRESS',
      created_at: new Date('2026-03-20T14:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  assets: [
    {
      id: 'ast_01',
      user_id: 'usr_admin_master',
      project_id: 'proj_skincare_viral',
      name: 'Serum Pencerah Kulit Botol Kaca Amber',
      category: 'PRODUCT',
      file_type: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1608248597359-59868e4c7003?w=600&auto=format&fit=crop&q=80',
      tags: ['skincare', 'serum', 'amber bottle', 'luxury'],
      created_at: new Date('2026-03-10T10:15:00Z').toISOString(),
    },
    {
      id: 'ast_02',
      user_id: 'usr_admin_master',
      project_id: 'proj_fashion_lookbook',
      name: 'Neng Aitha - Studio Portrait',
      category: 'CHARACTER',
      file_type: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      tags: ['influencer', 'female', 'portrait', 'indonesia'],
      created_at: new Date('2026-03-15T12:10:00Z').toISOString(),
    },
    {
      id: 'ast_03',
      user_id: 'usr_admin_master',
      project_id: 'proj_skincare_viral',
      name: 'Modern Minimalist Bathroom Setting',
      category: 'LOCATION',
      file_type: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      tags: ['bathroom', 'aesthetic', 'interior'],
      created_at: new Date('2026-03-10T10:20:00Z').toISOString(),
    },
  ],
  characters: [
    {
      id: 'char_neng_aitha',
      user_id: 'usr_admin_master',
      project_id: 'proj_fashion_lookbook',
      name: 'Neng Aitha',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      style: 'Realistic/Photorealistic',
      nationality: 'Indonesia',
      gender: 'Wanita',
      face_shape: 'Oval',
      eye_shape: 'Almond',
      nose_shape: 'Mancung Lurus',
      lip_shape: 'Penuh Alami',
      hair_style: 'Panjang Lurus Berkilau',
      skin_tone: 'Kuning Langsat Cerah',
      body_type: 'Langsing Proporsional',
      personality: 'Ramah, Edukatif, Hangat & Elegan',
      vibe: 'Modern Indonesian Beauty Influencer',
      appearance_prompt: 'Indonesian young woman, 23 years old, oval face, almond hazel eyes, gentle straight nose, soft plum lips, long sleek straight black hair, clear radiant warm fair skin, subtle mole near left cheekbone, approachable warm smile, wearing a chic beige silk blouse, 8k resolution, cinematic studio lighting.',
      negative_prompt: 'deformed, bad anatomy, blurry, plastic skin, distorted fingers, watermark, oversaturated',
      aspect_ratio: '3:4',
      notes: 'Karakter utama untuk konten kecantikan, gaya hidup, dan fashion nusantara.',
      created_at: new Date('2026-03-05T09:00:00Z').toISOString(),
    },
    {
      id: 'char_maya_tech',
      user_id: 'usr_admin_master',
      project_id: 'proj_tech_gadget',
      name: 'Maya Studio',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      style: 'Cinematic Hyperrealistic',
      nationality: 'Mixed Eurasian / Indonesia',
      gender: 'Wanita',
      face_shape: 'Heart',
      eye_shape: 'Almond',
      nose_shape: 'Sharp & Petite',
      lip_shape: 'Natural Medium',
      hair_style: 'Wavy Shoulder Length Brown',
      skin_tone: 'Warm Glow',
      body_type: 'Petite Slim',
      personality: 'Tech-savvy, Sharp, Energetic',
      vibe: 'Modern Creative Director & Tech Reviewer',
      appearance_prompt: '25-year-old modern tech reviewer, mixed Eurasian Indonesian descent, subtle waves in chestnut brown shoulder-length hair, sharp observant eyes, natural makeup, wearing a charcoal minimalist oversized blazer, modern creative studio background with ambient gold and neon lighting.',
      negative_prompt: 'cartoon, 3d render, extra limbs, low resolution',
      aspect_ratio: '16:9',
      notes: 'Spesialis konten review gadget, tutorial workflow AI, dan creative tools.',
      created_at: new Date('2026-03-12T11:00:00Z').toISOString(),
    },
  ],
  prompts: [
    {
      id: 'prm_01',
      user_id: 'usr_admin_master',
      project_id: 'proj_skincare_viral',
      title: 'Hook 3 Detik: Serum Jerawat Hilang 3 Hari',
      category: 'AFFILIATE',
      content: 'A close-up 4k shot of an Indonesian woman gently applying drops of golden hydrating serum onto her glowing cheek, natural bathroom morning light streaming through sheer curtains, water droplets, ultra photorealistic, eye-level angle, subtle push-in movement.',
      negative_prompt: 'blurry, artificial skin texture, harsh shadows, oversaturated, text, watermark',
      structured_data: {
        camera_angle: 'Close Up',
        camera_movement: 'Push In',
        lighting: 'Soft Morning Sunlight',
        voice_over: '"Kulit kusam dan noda hitam? Cuma butuh 3 tetes serum ini setiap pagi!"',
      },
      is_favorite: true,
      tags: ['affiliate', 'skincare', 'tiktok viral', 'ugc'],
      created_at: new Date('2026-03-10T11:00:00Z').toISOString(),
    },
  ],
  prompt_templates: [
    {
      id: 'tpl_affiliate_ugc_skincare',
      title: 'TikTok & Reels Viral UGC Skincare Review',
      category: 'Affiliate',
      description: 'Struktur prompt affiliate dengan hook kuat, angle close-up aplikasi produk, dan call to action keranjang kuning.',
      template_data: {
        duration: '15 detik',
        gender: 'Wanita',
        age: '24',
        style: 'UGC Video Organik',
        camera_angle: 'Medium Close Up',
        camera_movement: 'Push In Perlahan',
        hook: 'Sumpah kalian harus cobain produk satu ini!',
        cta: 'Cek keranjang kuning sekarang sebelum kehabisan diskon!',
      },
      is_system: true,
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tpl_commercial_luxury',
      title: 'Cinematic Luxury Brand Commercial',
      category: 'General',
      description: 'Gaya visual sinematik dengan rasio 16:9, anamorphic lens, lighting dramatis, dan transisi mulus.',
      template_data: {
        duration: '30 detik',
        style: 'Cinematic Anamorphic Commercial',
        camera_angle: 'Low Angle & Dolly In',
        lighting: 'Chiaroscuro Gold Backlight',
      },
      is_system: true,
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'tpl_ai_influencer_lookbook',
      title: 'AI Fashion Lookbook Editorial',
      category: 'Influencer',
      description: 'Template prompt untuk model influencer berpose elegan dengan rasio 3:4 atau 9:16 untuk Instagram.',
      template_data: {
        style: 'Vogue Editorial Fashion',
        aspect_ratio: '3:4',
        lighting: 'High-Key Studio Softbox',
      },
      is_system: true,
      created_at: '2026-01-10T00:00:00Z',
    },
  ],
  generations: [
    {
      id: 'gen_sample_01',
      user_id: 'usr_admin_master',
      project_id: 'proj_skincare_viral',
      module: 'AFFILIATE_PROMPT',
      prompt_input: {
        product_name: 'Glowing Serum 24K',
        character_gender: 'Wanita',
        duration: '15 detik',
        camera_angle: 'Close Up',
      },
      result_data: {
        main_prompt: 'Cinematic UGC video of an elegant Indonesian female influencer showing a glass amber serum dropper, applying silky golden essence onto clear cheek, sunlit studio aesthetic, 4k 60fps.',
        negative_prompt: 'deformed, cartoon, low quality, glitch',
        camera_direction: 'Slow push-in from medium close up to extreme macro on serum droplet',
        voice_over: 'Rahasia kulit glowing tanpa filter dalam 7 hari!',
      },
      status: 'SUCCESS',
      model: 'gemini-3.8-flash',
      created_at: new Date('2026-03-10T10:45:00Z').toISOString(),
    },
  ],
  storyboards: [
    {
      id: 'stb_01',
      user_id: 'usr_admin_master',
      project_id: 'proj_skincare_viral',
      title: 'Storyline Skincare 3 Hari Hasil Nyata',
      concept: 'Seorang wanita muda memperlihatkan transformasi kulit wajahnya sebelum dan sesudah memakai serum glowing dalam rutinitas pagi hari.',
      character_name: 'Neng Aitha',
      character_id: 'char_neng_aitha',
      style: 'Realistic/Photorealistic UGC',
      aspect_ratio: '9:16',
      total_shots: 4,
      total_duration: '15 detik',
      shots: [
        {
          shot_number: 1,
          duration: '3s',
          camera_angle: 'Close Up',
          camera_movement: 'Push In',
          action: 'Melihat ke cermin dengan ekspresi frustasi mengamati noda hitam di pipi',
          character: 'Neng Aitha',
          dialogue: 'Dulu stres banget tiap mau bikin video gara-gara noda jerawat...',
          lighting: 'Soft Morning Light',
          prompt: 'Close up shot of Indonesian woman looking in mirror examining face, gentle morning light, realistic expression',
          image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        },
        {
          shot_number: 2,
          duration: '4s',
          camera_angle: 'Macro Shot',
          camera_movement: 'Static',
          action: 'Mengambil botol serum amber dan meneteskan formula emas ke telapak tangan',
          character: 'Neng Aitha',
          dialogue: 'Sampai akhirnya nemuin golden serum ini!',
          lighting: 'Studio Backlight Gold',
          prompt: 'Macro shot of golden skincare dropper dropping liquid on palm, glass reflection, crystal clear',
          image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80',
        },
        {
          shot_number: 3,
          duration: '5s',
          camera_angle: 'Medium Shot',
          camera_movement: 'Tracking Shot',
          action: 'Mengaplikasikan serum dengan senyum rileks dan menepuk pipi lembut',
          character: 'Neng Aitha',
          dialogue: 'Teksturnya ringan banget, meresap cepat, dan bikin glowing seketika.',
          lighting: 'Bright Warm Daylight',
          prompt: 'Medium shot of Indonesian influencer applying glowing face serum, smiling happily, radiant skin',
          image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        },
        {
          shot_number: 4,
          duration: '3s',
          camera_angle: 'Eye Level',
          camera_movement: 'Dolly In',
          action: 'Memegang produk ke kamera sambil menunjuk ke keranjang kuning',
          character: 'Neng Aitha',
          dialogue: 'Checkout sekarang di keranjang kuning ya guys!',
          lighting: 'Vibrant Ring Light',
          prompt: 'Influencer holding skincare product proudly towards viewer, pointing down, high energy CTA',
          image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        },
      ],
      created_at: new Date('2026-03-11T14:00:00Z').toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  ai_providers: [
    {
      id: 'prov_gemini_primary',
      name: 'Google Gemini Studio AI (Official)',
      provider_type: 'GEMINI',
      api_key_masked: '••••••••••••••••••••••••••••38f1',
      status: 'ACTIVE',
      active_text_model: 'gemini-3.8-flash',
      active_image_model: 'gemini-3.1-flash-lite-image',
      is_default: true,
      daily_limit: 1000,
      monthly_limit: 25000,
      last_tested_at: new Date().toISOString(),
      created_at: '2026-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prov_gemini_pro',
      name: 'Google Gemini 3.1 Pro (Reasoning & Complex Storyboard)',
      provider_type: 'GEMINI',
      api_key_masked: '••••••••••••••••••••••••••••a94e',
      status: 'ACTIVE',
      active_text_model: 'gemini-3.1-pro-preview',
      active_image_model: 'gemini-3.1-flash-lite-image',
      is_default: false,
      daily_limit: 500,
      monthly_limit: 10000,
      last_tested_at: new Date().toISOString(),
      created_at: '2026-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
  ],
  usage_logs: [
    {
      id: 'usg_01',
      user_id: 'usr_admin_master',
      module: 'AFFILIATE_PROMPT',
      model: 'gemini-3.8-flash',
      tokens_used: 420,
      created_at: new Date('2026-03-10T10:45:00Z').toISOString(),
    },
  ],
  audit_logs: [
    {
      id: 'aud_init_01',
      user_id: 'usr_admin_master',
      user_email: process.env.ADMIN_EMAIL || 'yondol157@gmail.com',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'SYSTEM',
      metadata: { version: '1.0.0', status: 'READY' },
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 'aud_pay_01',
      user_id: 'usr_admin_master',
      user_email: process.env.ADMIN_EMAIL || 'yondol157@gmail.com',
      action: 'PAYMENT_VERIFIED',
      resource: 'PAYMENTS',
      resource_id: 'pay_001_budi',
      metadata: { user: 'budi.creative@gmail.com', amount: 249000, membership: 'PRO_LIFETIME' },
      created_at: new Date('2026-02-15T10:00:00Z').toISOString(),
    },
  ],
  notifications: [
    {
      id: 'notif_welcome',
      user_id: 'usr_admin_master',
      title: 'Selamat Datang di Om Gio AI Creative Director',
      message: 'Workspace produksi konten AI kreatif Anda siap digunakan dengan hak akses penuh PRO LIFETIME.',
      type: 'SUCCESS',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ],
  system_settings: {
    app_name: 'OM GIO AI CREATIVE DIRECTOR',
    tagline: 'AI Creative Production Studio untuk menghasilkan konten, visual, video, prompt, influencer, storyboard, dan materi kreatif dalam satu workspace.',
    gold_primary: '#D4AF37',
    pricing_idr: 'Rp 249.000',
    pricing_usd: '$19',
    payment_url: process.env.PAYMENT_PROVIDER_URL || 'https://lynk.id/omgio/s/pro-lifetime',
    maintenance_mode: false,
    registration_enabled: true,
    default_role: 'USER',
    default_daily_limit: 100,
    updated_at: new Date().toISOString(),
  },
};

// Database manager singleton with atomic persistence
class DatabaseManager {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
    this.ensureAdminExists();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Merge with initial data structure in case schema evolved
        return {
          ...initialData,
          ...parsed,
          system_settings: {
            ...initialData.system_settings,
            ...(parsed.system_settings || {}),
          },
        };
      }
    } catch (err) {
      console.error('[DB] Failed reading db file, using fresh initial seed:', err);
    }

    // Save initial data immediately
    this.saveDataDirect(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  private ensureAdminExists() {
    const adminEmail = process.env.ADMIN_EMAIL || 'yondol157@gmail.com';
    const existing = this.data.users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (existing) {
      existing.role = 'ADMIN';
      existing.membership_type = 'PRO_LIFETIME';
      existing.membership_status = 'ACTIVE';
      existing.lifetime_access = true;
    } else {
      this.data.users.push({
        id: 'usr_admin_' + Date.now(),
        google_id: 'google_admin_seed',
        email: adminEmail,
        name: 'Om Gio (Master Admin)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'ADMIN',
        membership_status: 'ACTIVE',
        membership_type: 'PRO_LIFETIME',
        lifetime_access: true,
        payment_status: 'VERIFIED',
        payment_reference: 'SEED_ADMIN_LIFETIME',
        activated_at: new Date().toISOString(),
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      });
    }
  }

  private saveDataDirect(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing database to file:', err);
    }
  }

  public scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDataDirect(this.data);
    }, 100);
  }

  // Getters for tables
  public getUsers(): User[] { return this.data.users; }
  public getPayments(): Payment[] { return this.data.payments; }
  public getMemberships(): Membership[] { return this.data.memberships; }
  public getProjects(): Project[] { return this.data.projects; }
  public getAssets(): Asset[] { return this.data.assets; }
  public getCharacters(): Character[] { return this.data.characters; }
  public getPrompts(): PromptItem[] { return this.data.prompts; }
  public getPromptTemplates(): PromptTemplate[] { return this.data.prompt_templates; }
  public getGenerations(): Generation[] { return this.data.generations; }
  public getStoryboards(): Storyboard[] { return this.data.storyboards; }
  public getAIProviders(): AIProvider[] { return this.data.ai_providers; }
  public getUsageLogs(): UsageLog[] { return this.data.usage_logs; }
  public getAuditLogs(): AuditLog[] { return this.data.audit_logs; }
  public getNotifications(): Notification[] { return this.data.notifications; }
  public getSystemSettings(): SystemSettings { return this.data.system_settings; }

  // User methods
  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'created_at' | 'updated_at' | 'last_login_at'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };
    this.data.users.push(newUser);
    this.scheduleSave();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.users[idx];
  }

  // Payment methods
  public createPayment(payment: Omit<Payment, 'created_at'>): Payment {
    const newPayment: Payment = {
      ...payment,
      created_at: new Date().toISOString(),
    };
    this.data.payments.unshift(newPayment);
    this.scheduleSave();
    return newPayment;
  }

  public updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
    const idx = this.data.payments.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.payments[idx] = {
      ...this.data.payments[idx],
      ...updates,
    };
    this.scheduleSave();
    return this.data.payments[idx];
  }

  // Project methods
  public createProject(project: Omit<Project, 'created_at' | 'updated_at'>): Project {
    const now = new Date().toISOString();
    const newProj: Project = {
      ...project,
      created_at: now,
      updated_at: now,
    };
    this.data.projects.unshift(newProj);
    this.scheduleSave();
    return newProj;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.projects[idx];
  }

  public deleteProject(id: string, userId: string): boolean {
    const idx = this.data.projects.findIndex(p => p.id === id && (p.user_id === userId || userId === 'ADMIN'));
    if (idx === -1) return false;
    this.data.projects.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // Asset methods
  public createAsset(asset: Omit<Asset, 'created_at'>): Asset {
    const newAsset: Asset = {
      ...asset,
      created_at: new Date().toISOString(),
    };
    this.data.assets.unshift(newAsset);
    this.scheduleSave();
    return newAsset;
  }

  public updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
    const idx = this.data.assets.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.data.assets[idx] = {
      ...this.data.assets[idx],
      ...updates,
    };
    this.scheduleSave();
    return this.data.assets[idx];
  }

  public deleteAsset(id: string, userId: string): boolean {
    const idx = this.data.assets.findIndex(a => a.id === id && (a.user_id === userId || userId === 'ADMIN'));
    if (idx === -1) return false;
    this.data.assets.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // Character methods
  public createCharacter(character: Omit<Character, 'created_at'>): Character {
    const newChar: Character = {
      ...character,
      created_at: new Date().toISOString(),
    };
    this.data.characters.unshift(newChar);
    this.scheduleSave();
    return newChar;
  }

  public updateCharacter(id: string, updates: Partial<Character>): Character | undefined {
    const idx = this.data.characters.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.characters[idx] = {
      ...this.data.characters[idx],
      ...updates,
    };
    this.scheduleSave();
    return this.data.characters[idx];
  }

  public deleteCharacter(id: string, userId: string): boolean {
    const idx = this.data.characters.findIndex(c => c.id === id && (c.user_id === userId || userId === 'ADMIN'));
    if (idx === -1) return false;
    this.data.characters.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // Prompt methods
  public createPrompt(prompt: Omit<PromptItem, 'created_at'>): PromptItem {
    const newPrompt: PromptItem = {
      ...prompt,
      created_at: new Date().toISOString(),
    };
    this.data.prompts.unshift(newPrompt);
    this.scheduleSave();
    return newPrompt;
  }

  public updatePrompt(id: string, updates: Partial<PromptItem>): PromptItem | undefined {
    const idx = this.data.prompts.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.prompts[idx] = {
      ...this.data.prompts[idx],
      ...updates,
    };
    this.scheduleSave();
    return this.data.prompts[idx];
  }

  public deletePrompt(id: string, userId: string): boolean {
    const idx = this.data.prompts.findIndex(p => p.id === id && (p.user_id === userId || userId === 'ADMIN'));
    if (idx === -1) return false;
    this.data.prompts.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // Generation record
  public recordGeneration(gen: Omit<Generation, 'created_at'>): Generation {
    const newGen: Generation = {
      ...gen,
      created_at: new Date().toISOString(),
    };
    this.data.generations.unshift(newGen);
    // Keep max 500 generations in memory
    if (this.data.generations.length > 500) {
      this.data.generations.pop();
    }
    this.scheduleSave();
    return newGen;
  }

  public deleteGeneration(id: string, userId: string): boolean {
    const idx = this.data.generations.findIndex(g => g.id === id && (g.user_id === userId || userId === 'ADMIN'));
    if (idx === -1) return false;
    this.data.generations.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // Storyboard methods
  public createStoryboard(stb: Omit<Storyboard, 'created_at' | 'updated_at'>): Storyboard {
    const now = new Date().toISOString();
    const newStb: Storyboard = {
      ...stb,
      created_at: now,
      updated_at: now,
    };
    this.data.storyboards.unshift(newStb);
    this.scheduleSave();
    return newStb;
  }

  public updateStoryboard(id: string, updates: Partial<Storyboard>): Storyboard | undefined {
    const idx = this.data.storyboards.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.storyboards[idx] = {
      ...this.data.storyboards[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.storyboards[idx];
  }

  public deleteStoryboard(id: string, userId: string): boolean {
    const idx = this.data.storyboards.findIndex(s => s.id === id && (s.user_id === userId || userId === 'ADMIN'));
    if (idx === -1) return false;
    this.data.storyboards.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // Audit logs
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const log: AuditLog = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...entry,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.pop();
    }
    this.scheduleSave();
    return log;
  }

  // Notifications
  public addNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO'): Notification {
    const notif: Notification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.scheduleSave();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // System Settings update
  public updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.system_settings = {
      ...this.data.system_settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.system_settings;
  }

  // AI Providers update
  public updateAIProvider(id: string, updates: Partial<AIProvider>): AIProvider | undefined {
    const idx = this.data.ai_providers.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.ai_providers[idx] = {
      ...this.data.ai_providers[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.ai_providers[idx];
  }
}

export const db = new DatabaseManager();
