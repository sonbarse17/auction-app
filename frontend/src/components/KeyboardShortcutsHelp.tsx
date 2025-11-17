import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Quick Bid (minimum or +increment)', forAdmin: false },
    { key: 'Esc', action: 'Close modals', forAdmin: false },
    { key: '?', action: 'Show this help', forAdmin: false },
    ...(isAdmin ? [
      { key: 'N', action: 'Next Player', forAdmin: true },
      { key: 'P', action: 'Pause/Resume', forAdmin: true },
    ] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">{shortcut.action}</span>
              <kbd className="px-3 py-1 bg-gray-800 text-white rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded">?</kbd> anytime to show this help
        </div>
      </div>
    </div>
  );
};
