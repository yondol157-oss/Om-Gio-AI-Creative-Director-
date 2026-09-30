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

export interface PublicSettings {
  app_name: string;
  tagline: string;
  gold_primary: string;
  pricing_idr: string;
  pricing_usd: string;
  payment_url: string;
  maintenance_mode: boolean;
}
