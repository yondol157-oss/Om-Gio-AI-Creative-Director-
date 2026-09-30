import { User, Project, Asset, Character, PromptItem, Storyboard, Generation, PublicSettings } from '../types/index';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('om_gio_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-user-id'] = token.replace('om_gio_tok_', '');
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || data.error || 'Terjadi kesalahan pada server.';
      const error: any = new Error(errorMsg);
      error.status = res.status;
      error.code = data.error;
      error.needs_upgrade = data.needs_upgrade;
      throw error;
    }

    return data as T;
  }

  // Public settings
  async getPublicSettings(): Promise<PublicSettings> {
    return this.request<PublicSettings>('/api/settings/public');
  }

  // Auth
  async loginWithGoogle(
    email: string,
    name?: string,
    avatar_url?: string,
    is_lynk_buyer?: boolean,
    order_id?: string
  ): Promise<{ token: string; user: User; message: string }> {
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name, avatar_url, is_lynk_buyer, order_id }),
    });
  }

  async autoActivateLynkBuyer(
    email: string,
    name?: string,
    order_id?: string
  ): Promise<{ token: string; user: User; message: string }> {
    return this.request('/api/payments/lynk-auto-activate', {
      method: 'POST',
      body: JSON.stringify({ email, name, order_id }),
    });
  }

  async switchDemoAccount(targetRole: 'ADMIN' | 'PRO' | 'USER'): Promise<{ token: string; user: User; message: string }> {
    return this.request('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ targetRole }),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request('/api/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request('/api/projects');
  }

  async createProject(data: Partial<Project>): Promise<{ project: Project }> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<{ project: Project }> {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request(`/api/projects/${id}`, { method: 'DELETE' });
  }

  async duplicateProject(id: string): Promise<{ project: Project; message: string }> {
    return this.request(`/api/projects/${id}/duplicate`, { method: 'POST' });
  }

  // Assets
  async getAssets(category?: string, projectId?: string): Promise<{ assets: Asset[] }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (projectId) params.set('project_id', projectId);
    return this.request(`/api/assets?${params.toString()}`);
  }

  async createAsset(data: Partial<Asset>): Promise<{ asset: Asset }> {
    return this.request('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<{ asset: Asset; message: string }> {
    return this.request(`/api/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string): Promise<{ message: string }> {
    return this.request(`/api/assets/${id}`, { method: 'DELETE' });
  }

  // Characters
  async getCharacters(): Promise<{ characters: Character[] }> {
    return this.request('/api/characters');
  }

  async createCharacter(data: Partial<Character>): Promise<{ character: Character }> {
    return this.request('/api/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCharacter(id: string, data: Partial<Character>): Promise<{ character: Character; message: string }> {
    return this.request(`/api/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async duplicateCharacter(id: string): Promise<{ character: Character; message: string }> {
    return this.request(`/api/characters/${id}/duplicate`, { method: 'POST' });
  }

  async deleteCharacter(id: string): Promise<{ message: string }> {
    return this.request(`/api/characters/${id}`, { method: 'DELETE' });
  }

  // Prompts
  async getPrompts(category?: string): Promise<{ prompts: PromptItem[] }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    return this.request(`/api/prompts?${params.toString()}`);
  }

  async createPrompt(data: Partial<PromptItem>): Promise<{ prompt: PromptItem }> {
    return this.request('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrompt(id: string, data: Partial<PromptItem>): Promise<{ prompt: PromptItem; message: string }> {
    return this.request(`/api/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async duplicatePrompt(id: string): Promise<{ prompt: PromptItem; message: string }> {
    return this.request(`/api/prompts/${id}/duplicate`, { method: 'POST' });
  }

  async toggleFavoritePrompt(id: string): Promise<{ prompt: PromptItem }> {
    return this.request(`/api/prompts/${id}/favorite`, { method: 'PUT' });
  }

  async deletePrompt(id: string): Promise<{ message: string }> {
    return this.request(`/api/prompts/${id}`, { method: 'DELETE' });
  }

  async getPromptTemplates(): Promise<{ templates: any[] }> {
    return this.request('/api/prompt-templates');
  }

  // Storyboard
  async getStoryboards(): Promise<{ storyboards: Storyboard[] }> {
    return this.request('/api/storyboards');
  }

  async createStoryboard(data: Partial<Storyboard>): Promise<{ storyboard: Storyboard }> {
    return this.request('/api/storyboards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteStoryboard(id: string): Promise<{ message: string }> {
    return this.request(`/api/storyboards/${id}`, { method: 'DELETE' });
  }

  async updateStoryboard(id: string, data: Partial<Storyboard>): Promise<{ storyboard: Storyboard; message: string }> {
    return this.request(`/api/storyboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Generations
  async getGenerations(module?: string, limit?: number): Promise<{ generations: Generation[] }> {
    const params = new URLSearchParams();
    if (module) params.set('module', module);
    if (limit) params.set('limit', String(limit));
    return this.request(`/api/generations?${params.toString()}`);
  }

  async deleteGeneration(id: string): Promise<{ message: string }> {
    return this.request(`/api/generations/${id}`, { method: 'DELETE' });
  }

  // AI Generators
  async generateAffiliatePrompt(data: any): Promise<{ success: boolean; result: any }> {
    return this.request('/api/ai/affiliate-prompt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateGeneralPrompt(data: any): Promise<{ success: boolean; result: any }> {
    return this.request('/api/ai/general-prompt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateImage(prompt: string, aspect_ratio?: string, style?: string): Promise<{ success: boolean; imageUrl: string; prompt: string }> {
    return this.request('/api/ai/image-gen', {
      method: 'POST',
      body: JSON.stringify({ prompt, aspect_ratio, style }),
    });
  }

  async upscaleImage(imageUrl: string, prompt?: string): Promise<{ success: boolean; imageUrl: string; prompt: string }> {
    return this.request('/api/ai/upscale', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, prompt }),
    });
  }

  async generateStoryboardShotImage(data: { storyboard_id?: string; shot_number: number; prompt: string; aspect_ratio?: string; style?: string }): Promise<{ success: boolean; imageUrl: string }> {
    return this.request('/api/ai/storyboard/shot-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateInfluencer(data: any): Promise<{ success: boolean; influencer: any }> {
    return this.request('/api/ai/influencer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateStoryboard(data: any): Promise<{ success: boolean; storyboard: any }> {
    return this.request('/api/ai/storyboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async createPayment(): Promise<{ payment_url: string; payment: any; message: string }> {
    return this.request('/api/payments/create', { method: 'POST' });
  }

  async submitPaymentProof(reference: string, notes?: string, proof_image?: string): Promise<{ success: boolean; payment: any; message: string }> {
    return this.request('/api/payments/submit-proof', {
      method: 'POST',
      body: JSON.stringify({ reference, notes, proof_image }),
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: any[] }> {
    return this.request('/api/notifications');
  }

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  // Admin
  async getAdminStats(): Promise<{ metrics: any }> {
    return this.request('/api/admin/stats');
  }

  async getAdminUsers(): Promise<{ users: User[] }> {
    return this.request('/api/admin/users');
  }

  async updateAdminUserRole(id: string, data: { role?: string; membership_type?: string; lifetime_access?: boolean }): Promise<{ user: User; message: string }> {
    return this.request(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async grantProByEmail(email: string, name?: string, notes?: string): Promise<{ success: boolean; user: User; message: string }> {
    return this.request('/api/admin/users/grant-by-email', {
      method: 'POST',
      body: JSON.stringify({ email, name, notes }),
    });
  }

  async getAdminPayments(): Promise<{ payments: any[] }> {
    return this.request('/api/admin/payments');
  }

  async verifyAdminPayment(paymentId: string): Promise<any> {
    return this.request(`/api/admin/payments/${paymentId}/verify`, { method: 'POST' });
  }

  async getAdminProviders(): Promise<{ providers: any[] }> {
    return this.request('/api/admin/providers');
  }

  async testAdminProvider(): Promise<{ success: boolean; message: string; model: string }> {
    return this.request('/api/admin/providers/test', { method: 'POST' });
  }

  async updateAdminProvider(id: string, data: any): Promise<{ provider: any; message: string }> {
    return this.request(`/api/admin/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAdminSettings(data: any): Promise<{ settings: any; message: string }> {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminAuditLogs(): Promise<{ audit_logs: any[] }> {
    return this.request('/api/admin/audit-logs');
  }
}

export const api = new ApiClient();
