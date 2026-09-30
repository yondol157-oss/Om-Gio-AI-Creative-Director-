import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from './db.ts';
import type { UserRole, ProjectStatus, AssetCategory } from './db.ts';
import { requireAuth, requirePro, requireAdmin, createSessionToken } from './auth.ts';
import type { AuthRequest } from './auth.ts';
import { AIService } from './aiService.ts';
import { PaymentService } from './payment.ts';

export const router = Router();

// ==========================================
// 1. PUBLIC SETTINGS
// ==========================================
router.get('/settings/public', (req: Request, res: Response) => {
  const settings = db.getSystemSettings();
  res.json({
    app_name: settings.app_name,
    tagline: settings.tagline,
    gold_primary: settings.gold_primary,
    pricing_idr: settings.pricing_idr,
    pricing_usd: settings.pricing_usd,
    payment_url: settings.payment_url,
    maintenance_mode: settings.maintenance_mode,
  });
});

// ==========================================
// 2. AUTHENTICATION
// ==========================================

// Google Sign-in / Mock Google OAuth endpoint
router.post('/auth/google', (req: Request, res: Response) => {
  const { email, name, avatar_url, google_id, is_lynk_buyer, lynk_order_id } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Email Google wajib disertakan.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = db.findUserByEmail(cleanEmail);
  const isAdminEmail = cleanEmail === (process.env.ADMIN_EMAIL || 'yondol157@gmail.com').toLowerCase();
  const isLynkBuyer = Boolean(is_lynk_buyer);
  const grantPro = isAdminEmail || isLynkBuyer;

  if (!user) {
    const role: UserRole = isAdminEmail ? 'ADMIN' : (isLynkBuyer ? 'PRO' : 'USER');

    user = db.createUser({
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      google_id: google_id || 'google_' + Date.now(),
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role,
      membership_status: grantPro ? 'ACTIVE' : 'NONE',
      membership_type: grantPro ? 'PRO_LIFETIME' : 'FREE',
      lifetime_access: grantPro,
      payment_status: grantPro ? 'VERIFIED' : 'NONE',
      activated_at: grantPro ? new Date().toISOString() : null,
      expires_at: null,
    });

    if (isLynkBuyer) {
      db.createPayment({
        id: 'pay_' + Date.now(),
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        provider: 'LYNK',
        provider_transaction_id: lynk_order_id || ('LYNK-AUTO-' + Date.now().toString().substring(6)),
        amount: 249000,
        currency: 'IDR',
        status: 'VERIFIED',
        payment_url: db.getSystemSettings().payment_url,
        paid_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        notes: 'Aktivasi Otomatis Pembeli Lynk (Google Sign-In)',
      });

      db.addNotification(
        user.id,
        'Selamat Datang! Akses PRO LIFETIME Aktif 🎉',
        'Akun Google Anda telah otomatis aktif dengan status PRO LIFETIME seumur hidup. Nikmati seluruh fitur AI tanpa batas!',
        'SUCCESS'
      );
    }

    db.addAuditLog({
      user_id: user.id,
      user_email: user.email,
      action: 'USER_REGISTER_GOOGLE',
      resource: 'USERS',
      resource_id: user.id,
      metadata: { role: user.role, is_lynk_buyer: isLynkBuyer },
    });
  } else {
    // If user already existed, and they log in as Lynk buyer: automatically upgrade to Pro Lifetime
    if (isLynkBuyer && user.role !== 'ADMIN' && (!user.lifetime_access || user.membership_type !== 'PRO_LIFETIME')) {
      user = db.updateUser(user.id, {
        role: 'PRO',
        membership_status: 'ACTIVE',
        membership_type: 'PRO_LIFETIME',
        lifetime_access: true,
        payment_status: 'VERIFIED',
        activated_at: user.activated_at || new Date().toISOString(),
        expires_at: null,
      })!;

      db.createPayment({
        id: 'pay_' + Date.now(),
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        provider: 'LYNK',
        provider_transaction_id: lynk_order_id || ('LYNK-AUTO-' + Date.now().toString().substring(6)),
        amount: 249000,
        currency: 'IDR',
        status: 'VERIFIED',
        payment_url: db.getSystemSettings().payment_url,
        paid_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        notes: 'Aktivasi Otomatis Pembeli Lynk (Upgrade)',
      });

      db.addNotification(
        user.id,
        'Akses PRO LIFETIME Berhasil Aktif 🎉',
        'Pembayaran Lynk Anda telah diproses. Akun Google Anda kini aktif sebagai PRO LIFETIME seumur hidup!',
        'SUCCESS'
      );
    }

    // Update last login
    db.updateUser(user.id, {
      name: name || user.name,
      avatar_url: avatar_url || user.avatar_url,
      last_login_at: new Date().toISOString(),
    });

    db.addAuditLog({
      user_id: user.id,
      user_email: user.email,
      action: 'USER_LOGIN_GOOGLE',
      resource: 'USERS',
      resource_id: user.id,
    });
  }

  const token = createSessionToken(user);
  res.json({
    token,
    user,
    message: isLynkBuyer
      ? `Akses PRO LIFETIME otomatis aktif untuk ${user.email}!`
      : 'Login berhasil.',
  });
});

// Demo switch account helper - strictly disabled to enforce role security
router.post('/auth/demo-switch', (req: Request, res: Response) => {
  return res.status(403).json({ error: 'FORBIDDEN', message: 'Fitur beralih peran telah dinonaktifkan demi keamanan sistem.' });
});

// Current user profile
router.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Logout
router.post('/auth/logout', requireAuth, (req: AuthRequest, res: Response) => {
  if (req.user) {
    db.addAuditLog({
      user_id: req.user.id,
      user_email: req.user.email,
      action: 'USER_LOGOUT',
      resource: 'AUTH',
    });
  }
  res.json({ message: 'Logout berhasil.' });
});

// ==========================================
// 3. PROJECTS MANAGEMENT
// ==========================================
router.get('/projects', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userProjects = db.getProjects().filter(p => p.user_id === userId);
  res.json({ projects: userProjects });
});

router.post('/projects', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, description, thumbnail, status } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nama project wajib diisi.' });
  }

  const project = db.createProject({
    id: 'proj_' + Date.now(),
    user_id: userId,
    name: name.trim(),
    description: description || '',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    status: (status as ProjectStatus) || 'IN_PROGRESS',
  });

  db.addAuditLog({
    user_id: userId,
    user_email: req.user!.email,
    action: 'PROJECT_CREATED',
    resource: 'PROJECTS',
    resource_id: project.id,
    metadata: { name: project.name },
  });

  db.addNotification(userId, 'Project Dibuat', `Project "${project.name}" berhasil dibuat.`, 'SUCCESS');

  res.status(201).json({ project });
});

router.put('/projects/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const project = db.getProjects().find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Project tidak ditemukan.' });
  }

  // Ownership security check
  if (project.user_id !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Anda tidak memiliki hak akses mengubah project ini.' });
  }

  const updated = db.updateProject(id, req.body);
  res.json({ project: updated });
});

router.delete('/projects/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const project = db.getProjects().find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Project tidak ditemukan.' });
  }

  // Ownership security check
  if (project.user_id !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Anda tidak memiliki hak akses menghapus project ini.' });
  }

  db.deleteProject(id, userId);

  db.addAuditLog({
    user_id: userId,
    user_email: req.user!.email,
    action: 'PROJECT_DELETED',
    resource: 'PROJECTS',
    resource_id: id,
  });

  res.json({ message: 'Project berhasil dihapus.' });
});

router.post('/projects/:id/duplicate', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const project = db.getProjects().find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Project tidak ditemukan.' });
  }

  const cloned = db.createProject({
    id: 'proj_' + Date.now(),
    user_id: userId,
    name: `${project.name} (Copy)`,
    description: project.description,
    thumbnail: project.thumbnail,
    status: project.status,
  });

  res.status(201).json({ project: cloned, message: 'Project berhasil diduplikat.' });
});

// ==========================================
// 4. ASSETS MANAGEMENT
// ==========================================
router.get('/assets', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { category, project_id } = req.query;

  let assets = db.getAssets().filter(a => a.user_id === userId);
  if (category && category !== 'ALL') {
    assets = assets.filter(a => a.category === category);
  }
  if (project_id) {
    assets = assets.filter(a => a.project_id === project_id);
  }

  res.json({ assets });
});

router.post('/assets', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, category, url, file_type, project_id, tags } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nama dan URL/file asset wajib diisi.' });
  }

  const asset = db.createAsset({
    id: 'ast_' + Date.now(),
    user_id: userId,
    project_id: project_id || null,
    name,
    category: (category as AssetCategory) || 'IMAGE',
    file_type: file_type || 'image/jpeg',
    url,
    tags: Array.isArray(tags) ? tags : [],
  });

  res.status(201).json({ asset });
});

router.put('/assets/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const asset = db.getAssets().find(a => a.id === id);

  if (!asset) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Asset tidak ditemukan.' });
  }

  if (asset.user_id !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Akses ditolak.' });
  }

  const updated = db.updateAsset(id, req.body);
  res.json({ asset: updated, message: 'Asset berhasil diperbarui.' });
});

router.delete('/assets/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const asset = db.getAssets().find(a => a.id === id);

  if (!asset) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Asset tidak ditemukan.' });
  }

  // Ownership check
  if (asset.user_id !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Akses ditolak.' });
  }

  db.deleteAsset(id, userId);
  res.json({ message: 'Asset berhasil dihapus.' });
});

// ==========================================
// 5. CHARACTERS (AI INFLUENCERS)
// ==========================================
router.get('/characters', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const chars = db.getCharacters().filter(c => c.user_id === userId || c.user_id === 'usr_admin_master');
  res.json({ characters: chars });
});

router.post('/characters', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const newChar = db.createCharacter({
    id: 'char_' + Date.now(),
    user_id: userId,
    project_id: req.body.project_id || null,
    name: req.body.name || 'AI Character',
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    style: req.body.style || 'Realistic/Photorealistic',
    nationality: req.body.nationality || 'Indonesia',
    gender: req.body.gender || 'Wanita',
    face_shape: req.body.face_shape || 'Oval',
    eye_shape: req.body.eye_shape || 'Almond',
    nose_shape: req.body.nose_shape || 'Mancung Lurus',
    lip_shape: req.body.lip_shape || 'Penuh',
    hair_style: req.body.hair_style || 'Panjang Lurus',
    skin_tone: req.body.skin_tone || 'Kuning Langsat',
    body_type: req.body.body_type || 'Langsing',
    personality: req.body.personality || 'Ramah & Hangat',
    vibe: req.body.vibe || 'Luxury & Approachable',
    appearance_prompt: req.body.appearance_prompt || '',
    negative_prompt: req.body.negative_prompt || '',
    aspect_ratio: req.body.aspect_ratio || '3:4',
    notes: req.body.notes || '',
  });

  res.status(201).json({ character: newChar });
});

router.put('/characters/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const char = db.getCharacters().find(c => c.id === id);

  if (!char) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Karakter tidak ditemukan.' });
  }

  if (char.user_id !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Akses ditolak.' });
  }

  const updated = db.updateCharacter(id, req.body);
  res.json({ character: updated, message: 'Karakter berhasil diperbarui.' });
});

router.post('/characters/:id/duplicate', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const char = db.getCharacters().find(c => c.id === id);

  if (!char) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Karakter tidak ditemukan.' });
  }

  const cloned = db.createCharacter({
    id: 'char_' + Date.now(),
    user_id: userId,
    project_id: char.project_id,
    name: `${char.name} (Copy)`,
    avatar: char.avatar,
    style: char.style,
    nationality: char.nationality,
    gender: char.gender,
    face_shape: char.face_shape,
    eye_shape: char.eye_shape,
    nose_shape: char.nose_shape,
    lip_shape: char.lip_shape,
    hair_style: char.hair_style,
    skin_tone: char.skin_tone,
    body_type: char.body_type,
    personality: char.personality,
    vibe: char.vibe,
    appearance_prompt: char.appearance_prompt,
    negative_prompt: char.negative_prompt,
    aspect_ratio: char.aspect_ratio,
    notes: char.notes,
  });

  res.status(201).json({ character: cloned, message: 'Karakter berhasil diduplikat.' });
});

router.delete('/characters/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const char = db.getCharacters().find(c => c.id === id);

  if (!char) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Karakter tidak ditemukan.' });
  }

  if (char.user_id !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Akses ditolak.' });
  }

  db.deleteCharacter(id, userId);
  res.json({ message: 'Karakter berhasil dihapus.' });
});

// ==========================================
// 6. PROMPT LIBRARY & TEMPLATES
// ==========================================
router.get('/prompts', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { category } = req.query;

  let prompts = db.getPrompts().filter(p => p.user_id === userId);
  if (category && category !== 'ALL') {
    prompts = prompts.filter(p => p.category === category);
  }

  res.json({ prompts });
});

router.post('/prompts', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, category, content, negative_prompt, structured_data, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Judul dan konten prompt wajib diisi.' });
  }

  const prompt = db.createPrompt({
    id: 'prm_' + Date.now(),
    user_id: userId,
    title,
    category: category || 'GENERAL',
    content,
    negative_prompt: negative_prompt || '',
    structured_data: structured_data || {},
    is_favorite: false,
    tags: Array.isArray(tags) ? tags : [],
  });

  res.status(201).json({ prompt });
});

router.put('/prompts/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const prompt = db.getPrompts().find(p => p.id === id);

  if (!prompt || (prompt.user_id !== userId && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' });
  }

  const updated = db.updatePrompt(id, req.body);
  res.json({ prompt: updated, message: 'Prompt berhasil diperbarui.' });
});

router.post('/prompts/:id/duplicate', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const prompt = db.getPrompts().find(p => p.id === id);

  if (!prompt || (prompt.user_id !== userId && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' });
  }

  const cloned = db.createPrompt({
    id: 'prm_' + Date.now(),
    user_id: userId,
    title: `${prompt.title} (Copy)`,
    category: prompt.category,
    content: prompt.content,
    negative_prompt: prompt.negative_prompt,
    structured_data: prompt.structured_data,
    is_favorite: false,
    tags: prompt.tags,
  });

  res.status(201).json({ prompt: cloned, message: 'Prompt berhasil diduplikat.' });
});

router.put('/prompts/:id/favorite', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const prompt = db.getPrompts().find(p => p.id === id);

  if (!prompt || (prompt.user_id !== userId && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' });
  }

  prompt.is_favorite = !prompt.is_favorite;
  db.scheduleSave();
  res.json({ prompt });
});

router.delete('/prompts/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const prompt = db.getPrompts().find(p => p.id === id);

  if (!prompt || (prompt.user_id !== userId && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' });
  }

  db.deletePrompt(id, userId);
  res.json({ message: 'Prompt dihapus.' });
});

router.get('/prompt-templates', (req: Request, res: Response) => {
  res.json({ templates: db.getPromptTemplates() });
});

// ==========================================
// 7. STORYBOARD
// ==========================================
router.get('/storyboards', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const storyboards = db.getStoryboards().filter(s => s.user_id === userId);
  res.json({ storyboards });
});

router.post('/storyboards', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const newStb = db.createStoryboard({
    id: 'stb_' + Date.now(),
    user_id: userId,
    project_id: req.body.project_id || null,
    title: req.body.title || 'Storyboard Untitled',
    concept: req.body.concept || '',
    character_name: req.body.character_name || '',
    character_id: req.body.character_id || null,
    style: req.body.style || 'Cinematic Film',
    aspect_ratio: req.body.aspect_ratio || '16:9',
    total_shots: req.body.shots?.length || 4,
    total_duration: req.body.total_duration || '15 detik',
    shots: req.body.shots || [],
  });

  res.status(201).json({ storyboard: newStb });
});

router.put('/storyboards/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const stb = db.getStoryboards().find(s => s.id === id);

  if (!stb || (stb.user_id !== userId && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Storyboard tidak ditemukan.' });
  }

  const updated = db.updateStoryboard(id, req.body);
  res.json({ storyboard: updated, message: 'Storyboard berhasil diperbarui.' });
});

router.delete('/storyboards/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const stb = db.getStoryboards().find(s => s.id === id);

  if (!stb || (stb.user_id !== userId && req.user!.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Storyboard tidak ditemukan.' });
  }

  db.deleteStoryboard(id, userId);
  res.json({ message: 'Storyboard berhasil dihapus.' });
});

// ==========================================
// 8. GENERATION HISTORY
// ==========================================
router.get('/generations', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { module, limit } = req.query;

  let gens = db.getGenerations().filter(g => g.user_id === userId);
  if (module && module !== 'ALL') {
    gens = gens.filter(g => g.module === module);
  }

  const max = limit ? parseInt(limit as string) : 50;
  res.json({ generations: gens.slice(0, max) });
});

router.delete('/generations/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const deleted = db.deleteGeneration(id, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Riwayat tidak ditemukan.' });
  }
  res.json({ message: 'Riwayat berhasil dihapus.' });
});

// Upscale Image endpoint
router.post('/ai/upscale', requirePro, async (req: AuthRequest, res: Response) => {
  const { imageUrl, prompt } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Image URL wajib disertakan.' });
  }

  try {
    // Generate an enhanced/upscaled frame variation
    const enhancedPrompt = `${prompt || 'High resolution studio portrait'}, masterpiece, sharp focus, 8k uhd, photorealistic, ultra detailed`;
    const result = await AIService.generateImage(enhancedPrompt, '16:9');
    res.json({ success: true, imageUrl: result.imageUrl, prompt: enhancedPrompt });
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// Storyboard Shot Image Generator
router.post('/ai/storyboard/shot-image', requirePro, async (req: AuthRequest, res: Response) => {
  const { storyboard_id, shot_number, prompt, aspect_ratio, style } = req.body;

  try {
    const result = await AIService.generateImage(prompt, aspect_ratio || '16:9', style || 'Cinematic Film');

    // If storyboard_id is given, update shot in storyboard
    if (storyboard_id) {
      const stb = db.getStoryboards().find(s => s.id === storyboard_id);
      if (stb) {
        const shot = stb.shots.find(s => s.shot_number === shot_number);
        if (shot) {
          shot.image_url = result.imageUrl;
          db.scheduleSave();
        }
      }
    }

    res.json({ success: true, imageUrl: result.imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// ==========================================
// 9. AI CREATIVE GENERATORS (SERVER-SIDE SECURE)
// ==========================================

// Affiliate Prompt Generation
router.post('/ai/affiliate-prompt', requirePro, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const result = await AIService.generateAffiliatePrompt(req.body);

    // Save to generation history
    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      project_id: req.body.project_id || null,
      module: 'AFFILIATE_PROMPT',
      prompt_input: req.body,
      result_data: result,
      status: 'SUCCESS',
      model: 'gemini-3.8-flash',
    });

    res.json({ success: true, result });
  } catch (err: any) {
    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      module: 'AFFILIATE_PROMPT',
      prompt_input: req.body,
      result_data: {},
      status: 'FAILED',
      model: 'gemini-3.8-flash',
      error_message: err.message,
    });
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// General Prompt Generation
router.post('/ai/general-prompt', requirePro, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const result = await AIService.generateGeneralPrompt(req.body);

    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      project_id: req.body.project_id || null,
      module: 'GENERAL_PROMPT',
      prompt_input: req.body,
      result_data: result,
      status: 'SUCCESS',
      model: 'gemini-3.8-flash',
    });

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// Image Generation
router.post('/ai/image-gen', requirePro, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { prompt, aspect_ratio, style } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Prompt gambar wajib diisi.' });
  }

  try {
    const result = await AIService.generateImage(prompt, aspect_ratio || '1:1', style || '', req.body.reference_images);

    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      project_id: req.body.project_id || null,
      module: 'IMAGE_GEN',
      prompt_input: req.body,
      result_data: result,
      status: 'SUCCESS',
      model: 'gemini-3.1-flash-lite-image',
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// AI Influencer Creator
router.post('/ai/influencer', requirePro, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const result = await AIService.generateAIInfluencer(req.body);

    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      project_id: req.body.project_id || null,
      module: 'AI_INFLUENCER',
      prompt_input: req.body,
      result_data: result,
      status: 'SUCCESS',
      model: 'gemini-3.8-flash',
    });

    res.json({ success: true, influencer: result });
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// Storyboard Generation
router.post('/ai/storyboard', requirePro, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const result = await AIService.generateStoryboard(req.body);

    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      project_id: req.body.project_id || null,
      module: 'STORYBOARD',
      prompt_input: req.body,
      result_data: result,
      status: 'SUCCESS',
      model: 'gemini-3.8-flash',
    });

    res.json({ success: true, storyboard: result });
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// Storyboard Shot Image Generator with Global Reference Support
router.post('/ai/storyboard/shot-image', requirePro, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const result = await AIService.generateStoryboardShotImage(req.body);

    db.recordGeneration({
      id: 'gen_' + Date.now(),
      user_id: userId,
      project_id: req.body.storyboard_id || null,
      module: 'STORYBOARD',
      prompt_input: req.body,
      result_data: result,
      status: 'SUCCESS',
      model: 'gemini-3.1-flash-lite-image',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AI_PROVIDER_ERROR', message: err.message });
  }
});

// ==========================================
// 10. PAYMENTS & LYNK INTEGRATION
// ==========================================

// Create payment checkout
router.post('/payments/create', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const settings = db.getSystemSettings();

  const payment = db.createPayment({
    id: 'pay_' + Date.now(),
    user_id: user.id,
    user_email: user.email,
    user_name: user.name,
    provider: 'LYNK',
    provider_transaction_id: 'LYNK-ORD-' + Date.now().toString().substring(6),
    amount: 249000,
    currency: 'IDR',
    status: 'PENDING',
    payment_url: settings.payment_url,
  });

  res.json({
    payment_url: payment.payment_url,
    payment,
    message: 'Silakan lanjutkan pembayaran di Lynk.',
  });
});

// User submits manual payment verification proof
router.post('/payments/submit-proof', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { reference, notes, proof_image } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nomor referensi pembayaran wajib diisi.' });
  }

  const payment = db.createPayment({
    id: 'pay_proof_' + Date.now(),
    user_id: user.id,
    user_email: user.email,
    user_name: user.name,
    provider: 'MANUAL',
    provider_transaction_id: reference.trim(),
    amount: 249000,
    currency: 'IDR',
    status: 'PENDING',
    payment_url: db.getSystemSettings().payment_url,
    proof_image: proof_image || '',
    notes: notes || 'Konfirmasi pembayaran manual dari user',
  });

  db.updateUser(user.id, {
    payment_status: 'PENDING',
    payment_reference: reference.trim(),
  });

  db.addNotification(
    user.id,
    'Bukti Pembayaran Terkirim',
    `Referensi ${reference} telah masuk antrian verifikasi Admin. Akun Pro Anda akan segera aktif.`,
    'INFO'
  );

  db.addAuditLog({
    user_id: user.id,
    user_email: user.email,
    action: 'PAYMENT_PROOF_SUBMITTED',
    resource: 'PAYMENTS',
    resource_id: payment.id,
    metadata: { reference },
  });

  res.json({ success: true, payment, message: 'Bukti pembayaran berhasil dikirim. Admin akan segera memverifikasi.' });
});

// Lynk Webhook receiver (Supports /payments/webhook, /lynk/webhook, and /api/payments/webhook)
router.get(['/payments/webhook', '/lynk/webhook'], (req: Request, res: Response) => {
  return res.redirect('/?lynk_paid=true');
});

router.post(['/payments/webhook', '/lynk/webhook', '/api/payments/webhook'], (req: Request, res: Response) => {
  const body = req.body || {};
  console.log('[LYNK WEBHOOK] Incoming payload:', JSON.stringify(body));

  // Extract email flexibly from multiple possible formats
  const customerEmail = (
    body.customer_email ||
    body.email ||
    body.customer?.email ||
    body.data?.customer_email ||
    body.data?.email ||
    body.buyer_email ||
    (typeof body.custom_fields === 'object' && (body.custom_fields?.email || body.custom_fields?.['Gmail'] || body.custom_fields?.['Akun Google'])) ||
    ''
  ).toString().trim().toLowerCase();

  const customerName = (
    body.customer_name ||
    body.name ||
    body.customer?.name ||
    body.data?.customer_name ||
    body.data?.name ||
    customerEmail.split('@')[0] ||
    'Pembeli Lynk'
  );

  const orderId = body.transaction_id || body.order_id || body.id || ('LYNK-' + Date.now());

  if (customerEmail && customerEmail.includes('@')) {
    let user = db.findUserByEmail(customerEmail);

    if (user) {
      // Instantly upgrade existing user to PRO LIFETIME
      PaymentService.activateProLifetime(user.id, undefined, 'LYNK_WEBHOOK_AUTO');
    } else {
      // Pre-activate user so when they log in with Google, they instantly get PRO LIFETIME!
      user = db.createUser({
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        google_id: 'google_lynk_' + Date.now(),
        email: customerEmail,
        name: customerName,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'PRO',
        membership_status: 'ACTIVE',
        membership_type: 'PRO_LIFETIME',
        lifetime_access: true,
        payment_status: 'VERIFIED',
        activated_at: new Date().toISOString(),
        expires_at: null,
      });

      db.createPayment({
        id: 'pay_' + Date.now(),
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        provider: 'LYNK',
        provider_transaction_id: orderId,
        amount: 249000,
        currency: 'IDR',
        status: 'VERIFIED',
        payment_url: db.getSystemSettings().payment_url,
        paid_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        notes: 'Aktivasi Otomatis via Lynk Webhook',
      });
    }

    return res.json({
      success: true,
      message: `Akses PRO LIFETIME otomatis aktif untuk akun Google: ${customerEmail}`,
      email: customerEmail,
    });
  }

  res.json({ received: true });
});

// Direct Self-Service Auto-Activation for Lynk Buyers (Instant Access without Admin)
router.post('/payments/lynk-auto-activate', (req: Request, res: Response) => {
  const { email, name, order_id } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Alamat email Gmail/Google wajib diisi.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = db.findUserByEmail(cleanEmail);

  if (user) {
    user = db.updateUser(user.id, {
      role: user.role === 'ADMIN' ? 'ADMIN' : 'PRO',
      membership_status: 'ACTIVE',
      membership_type: 'PRO_LIFETIME',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      activated_at: user.activated_at || new Date().toISOString(),
      expires_at: null,
    })!;
  } else {
    user = db.createUser({
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      google_id: 'google_lynk_' + Date.now(),
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'PRO',
      membership_status: 'ACTIVE',
      membership_type: 'PRO_LIFETIME',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      activated_at: new Date().toISOString(),
      expires_at: null,
    });
  }

  db.createPayment({
    id: 'pay_' + Date.now(),
    user_id: user.id,
    user_email: user.email,
    user_name: user.name,
    provider: 'LYNK',
    provider_transaction_id: order_id || ('LYNK-AUTO-' + Date.now().toString().substring(6)),
    amount: 249000,
    currency: 'IDR',
    status: 'VERIFIED',
    payment_url: db.getSystemSettings().payment_url,
    paid_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
    notes: 'Aktivasi Otomatis Pembeli Lynk (Instan)',
  });

  db.addNotification(
    user.id,
    'Selamat! Akses PRO LIFETIME Aktif 🎉',
    'Akun Google Anda telah diverifikasi otomatis sebagai PRO LIFETIME seumur hidup tanpa menunggu persetujuan admin.',
    'SUCCESS'
  );

  const token = createSessionToken(user);
  res.json({
    success: true,
    token,
    user,
    message: `Selamat! Akun Google Anda (${cleanEmail}) telah otomatis aktif sebagai PRO LIFETIME seumur hidup!`,
  });
});

// ==========================================
// 11. NOTIFICATIONS
// ==========================================
router.get('/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const notifs = db.getNotifications().filter(n => n.user_id === userId);
  res.json({ notifications: notifs });
});

router.put('/notifications/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  db.markNotificationAsRead(id, userId);
  res.json({ success: true });
});

// ==========================================
// 12. ADMIN PANEL (STRICT REQUIRE ADMIN)
// ==========================================

// Metrics Overview
router.get('/admin/stats', requireAdmin, (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  const payments = db.getPayments();
  const generations = db.getGenerations();
  const projects = db.getProjects();

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.role === 'PRO' || u.role === 'ADMIN').length;
  const lifetimeUsers = users.filter(u => u.lifetime_access).length;
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
  const verifiedPayments = payments.filter(p => p.status === 'VERIFIED').length;
  const totalGenerations = generations.length;
  const totalProjects = projects.length;

  res.json({
    metrics: {
      totalUsers,
      proUsers,
      lifetimeUsers,
      pendingPayments,
      verifiedPayments,
      totalGenerations,
      totalProjects,
      totalRevenueIdr: verifiedPayments * 249000,
    },
  });
});

// Users List
router.get('/admin/users', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ users: db.getUsers() });
});

// Update User Role & Membership (e.g. Grant Pro / Suspend)
router.put('/admin/users/:id/role', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, membership_type, lifetime_access } = req.body;

  const target = db.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'User tidak ditemukan.' });
  }

  const updates: Partial<any> = {};
  if (role) updates.role = role;
  if (membership_type) {
    updates.membership_type = membership_type;
    updates.membership_status = membership_type === 'PRO_LIFETIME' ? 'ACTIVE' : 'NONE';
  }
  if (lifetime_access !== undefined) {
    updates.lifetime_access = Boolean(lifetime_access);
    if (lifetime_access) {
      updates.expires_at = null;
      updates.activated_at = target.activated_at || new Date().toISOString();
    }
  }

  const updatedUser = db.updateUser(id, updates);

  db.addAuditLog({
    user_id: req.user!.id,
    user_email: req.user!.email,
    action: 'ADMIN_UPDATE_USER_ROLE',
    resource: 'USERS',
    resource_id: id,
    metadata: updates,
  });

  if (role === 'PRO' || updates.membership_type === 'PRO_LIFETIME') {
    db.addNotification(id, 'Akses PRO Aktif', 'Administrator telah mengaktifkan akses PRO LIFETIME untuk akun Anda.', 'SUCCESS');
  }

  res.json({ user: updatedUser, message: 'Data user berhasil diperbarui.' });
});

// Grant Pro Lifetime by Email directly (Pre-activate or Upgrade)
router.post('/admin/users/grant-by-email', requireAdmin, (req: AuthRequest, res: Response) => {
  const { email, name, notes } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Alamat email Gmail/Google wajib diisi dengan benar.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = db.findUserByEmail(cleanEmail);

  if (user) {
    user = db.updateUser(user.id, {
      role: 'PRO',
      membership_type: 'PRO_LIFETIME',
      membership_status: 'ACTIVE',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      payment_reference: notes || 'LYNK_PAID_MANUAL_GRANT',
      activated_at: user.activated_at || new Date().toISOString(),
      expires_at: null,
    })!;

    db.addNotification(
      user.id,
      'Akses PRO LIFETIME Aktif!',
      'Pembayaran Anda telah diverifikasi oleh Administrator. Akun Google Anda kini memiliki akses PRO LIFETIME penuh.',
      'SUCCESS'
    );
  } else {
    user = db.createUser({
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      google_id: 'google_pre_' + Date.now(),
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'PRO',
      membership_type: 'PRO_LIFETIME',
      membership_status: 'ACTIVE',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      payment_reference: notes || 'LYNK_PAID_PRE_ACTIVATION',
      activated_at: new Date().toISOString(),
      expires_at: null,
    });
  }

  db.createPayment({
    id: 'pay_' + Date.now(),
    user_id: user.id,
    user_email: user.email,
    user_name: user.name,
    provider: 'LYNK',
    provider_transaction_id: 'LYNK-ACT-' + Date.now().toString().substring(6),
    amount: 249000,
    currency: 'IDR',
    status: 'VERIFIED',
    payment_url: db.getSystemSettings().payment_url,
    paid_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
    notes: notes || 'Aktivasi langsung dari Admin via Gmail Lynk',
  });

  db.addAuditLog({
    user_id: req.user!.id,
    user_email: req.user!.email,
    action: 'ADMIN_GRANT_PRO_BY_EMAIL',
    resource: 'USERS',
    resource_id: user.id,
    metadata: { buyer_email: cleanEmail, buyer_name: name },
  });

  res.json({
    success: true,
    user,
    message: `Akses PRO LIFETIME berhasil diaktifkan untuk akun Google: ${cleanEmail}. Pengguna dapat langsung login dengan akun tersebut.`,
  });
});

// Payments List
router.get('/admin/payments', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ payments: db.getPayments() });
});

// Verify Payment Action
router.post('/admin/payments/:id/verify', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const payment = db.getPayments().find(p => p.id === id);

  if (!payment) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Transaksi pembayaran tidak ditemukan.' });
  }

  const result = PaymentService.activateProLifetime(payment.user_id, payment.id, req.user!.email);
  res.json(result);
});

// AI Providers Management (Masked API keys only)
router.get('/admin/providers', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ providers: db.getAIProviders() });
});

// Test Connection
router.post('/admin/providers/test', requireAuth, async (req: AuthRequest, res: Response) => {
  const testRes = await AIService.testConnection();
  res.json(testRes);
});

// Update AI Provider
router.put('/admin/providers/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, active_text_model, active_image_model, daily_limit, monthly_limit } = req.body;

  const updated = db.updateAIProvider(id, {
    status,
    active_text_model,
    active_image_model,
    daily_limit,
    monthly_limit,
  });

  db.addAuditLog({
    user_id: req.user!.id,
    user_email: req.user!.email,
    action: 'AI_PROVIDER_UPDATED',
    resource: 'AI_PROVIDERS',
    resource_id: id,
  });

  res.json({ provider: updated, message: 'Provider AI diperbarui.' });
});

// System Settings
router.put('/admin/settings', requireAdmin, (req: AuthRequest, res: Response) => {
  const updated = db.updateSystemSettings(req.body);

  db.addAuditLog({
    user_id: req.user!.id,
    user_email: req.user!.email,
    action: 'SYSTEM_SETTINGS_UPDATED',
    resource: 'SYSTEM_SETTINGS',
    metadata: req.body,
  });

  res.json({ settings: updated, message: 'Pengaturan sistem berhasil disimpan.' });
});

// Audit Logs
router.get('/admin/audit-logs', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ audit_logs: db.getAuditLogs() });
});
