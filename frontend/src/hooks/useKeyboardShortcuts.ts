import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onQuickBid?: () => void;
  onNextPlayer?: () => void;
  onPause?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  useEffect(() => {
    if (!config.enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          config.onQuickBid?.();
          break;
        case 'n':
          e.preventDefault();
          config.onNextPlayer?.();
          break;
        case 'p':
          e.preventDefault();
          config.onPause?.();
          break;
        case '?':
          e.preventDefault();
          config.onHelp?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [config]);
};
