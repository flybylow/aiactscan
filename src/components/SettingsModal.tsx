import React from 'react';
import { X, Volume2, Mic, User } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="voice-volume" className="flex items-center gap-3 text-sm font-medium text-gray-700 mb-3">
              <Volume2 className="w-4 h-4" />
              Voice Volume
            </label>
            <input
              id="voice-volume"
              type="range"
              min="0"
              max="100"
              defaultValue="75"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div>
            <label htmlFor="mic-sensitivity" className="flex items-center gap-3 text-sm font-medium text-gray-700 mb-3">
              <Mic className="w-4 h-4" />
              Microphone Sensitivity
            </label>
            <input
              id="mic-sensitivity"
              type="range"
              min="0"
              max="100"
              defaultValue="60"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div>
            <label htmlFor="voice-selection" className="flex items-center gap-3 text-sm font-medium text-gray-700 mb-3">
              <User className="w-4 h-4" />
              Voice Selection
            </label>
            <select 
              id="voice-selection"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option>Sarah (Natural)</option>
              <option>David (Professional)</option>
              <option>Emma (Friendly)</option>
              <option>James (Calm)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="auto-start" className="text-sm font-medium text-gray-700">Auto-start conversations</label>
            <button 
              id="auto-start"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="noise-suppression" className="text-sm font-medium text-gray-700">Background noise suppression</label>
            <button 
              id="noise-suppression"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};