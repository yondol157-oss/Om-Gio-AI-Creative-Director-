import crypto from 'crypto';
import { db } from './db.ts';
import type { Payment, User } from './db.ts';

export interface VerifyPaymentResult {
  success: boolean;
  message: string;
  user?: User;
  payment?: Payment;
}

export class PaymentService {
  // Idempotently activate PRO Lifetime for a user upon verified payment
  static activateProLifetime(userId: string, paymentId?: string, verifiedBy: string = 'SYSTEM'): VerifyPaymentResult {
    const user = db.findUserById(userId);
    if (!user) {
      return { success: false, message: 'User tidak ditemukan' };
    }

    const now = new Date().toISOString();

    // Update user
    const updatedUser = db.updateUser(user.id, {
      role: user.role === 'ADMIN' ? 'ADMIN' : 'PRO',
      membership_status: 'ACTIVE',
      membership_type: 'PRO_LIFETIME',
      lifetime_access: true,
      payment_status: 'VERIFIED',
      activated_at: user.activated_at || now,
      expires_at: null, // Lifetime: no expiration
    });

    // Update payment record if given
    let updatedPayment: Payment | undefined;
    if (paymentId) {
      updatedPayment = db.updatePayment(paymentId, {
        status: 'VERIFIED',
        verified_at: now,
      });
    }

    // Add membership record if not already present
    const existingMem = db.getMemberships().find(m => m.user_id === user.id && m.type === 'PRO_LIFETIME');
    if (!existingMem) {
      db.getMemberships().push({
        id: 'mem_' + Date.now(),
        user_id: user.id,
        type: 'PRO_LIFETIME',
        status: 'ACTIVE',
        lifetime: true,
        starts_at: now,
        expires_at: null,
        created_at: now,
      });
      db.scheduleSave();
    }

    // Send notification
    db.addNotification(
      user.id,
      'Selamat! Akses PRO LIFETIME Aktif 🎉',
      'Pembayaran Anda telah diverifikasi. Seluruh fitur Om Gio AI Creative Director kini aktif selamanya tanpa batas waktu kadaluarsa!',
      'SUCCESS'
    );

    // Add audit log
    db.addAuditLog({
      user_id: user.id,
      user_email: user.email,
      action: 'PAYMENT_VERIFIED',
      resource: 'PAYMENT',
      resource_id: paymentId,
      metadata: {
        verified_by: verifiedBy,
        membership: 'PRO_LIFETIME',
        lifetime_access: true,
        activated_at: now,
      },
    });

    return {
      success: true,
      message: `Akun ${user.name} (${user.email}) berhasil diaktifkan menjadi PRO LIFETIME.`,
      user: updatedUser,
      payment: updatedPayment,
    };
  }

  // Verify Lynk webhook signature
  static verifyWebhookSignature(payload: string, signature: string | undefined, secret: string | undefined): boolean {
    if (!secret) return true; // If no secret configured in dev mode, accept payload
    if (!signature) return false;

    try {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch {
      return false;
    }
  }
}
