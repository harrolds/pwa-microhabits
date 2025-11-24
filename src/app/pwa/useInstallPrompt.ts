import { useCallback, useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export type InstallPromptController = {
  canInstall: boolean;
  dismissed: boolean;
  prompt: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  reset: () => void;
};

export const useInstallPrompt = (): InstallPromptController => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      const typedEvent = event as BeforeInstallPromptEvent;
      typedEvent.preventDefault();
      setPromptEvent(typedEvent);
      setDismissed(false);
    };

    const handleInstalled = () => {
      setPromptEvent(null);
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const prompt = useCallback(async () => {
    if (!promptEvent) {
      return 'unavailable';
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'dismissed') {
      setDismissed(true);
    } else {
      setPromptEvent(null);
    }
    return choice.outcome;
  }, [promptEvent]);

  const reset = useCallback(() => {
    setPromptEvent(null);
    setDismissed(false);
  }, []);

  return {
    canInstall: Boolean(promptEvent),
    dismissed,
    prompt,
    reset,
  };
};

