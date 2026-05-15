'use client';

/**
 * useAuthGate
 *
 * Returns a function that:
 *  - If the user is already logged in, immediately runs `onSuccess()`
 *  - If the user is NOT logged in, opens the login modal and stores the
 *    pending action so the LoginModal can call it after auth completes.
 *
 * Usage:
 *   const { gate, loginModalOpen, closeModal, pendingRedirect, clearPending } = useAuthGate();
 *   <button onClick={() => gate(() => router.push('/dashboard?plan=free'))}>Start</button>
 */

import { useState } from 'react';
import { useAuth } from './auth-context';

export function useAuthGate() {
  const { user } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  /** Call this on any button that should require login first */
  const gate = (action: () => void) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setLoginModalOpen(true);
    }
  };

  /** Called by the modal after a successful login */
  const onAuthSuccess = () => {
    setLoginModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const closeModal = () => {
    setLoginModalOpen(false);
    setPendingAction(null);
  };

  return { gate, loginModalOpen, onAuthSuccess, closeModal };
}
