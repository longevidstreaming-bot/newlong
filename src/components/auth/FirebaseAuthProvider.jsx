import { useState, useEffect } from 'react';
import { auth } from '@/firebase';

export function useAuth() {
  // Simple stub for 2FA and auth helpers used by components.
  const enable2FA = async () => {
    // Return a QR-code URL (mock). In production, implement TOTP secret generation.
    return { qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LONGEVID-2FA' };
  };

  const disable2FA = async () => true;

  return { enable2FA, disable2FA, auth };
}

export default useAuth;
