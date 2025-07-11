
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserSettings } from '@/lib/types';
import { localStorage } from '@/lib/utils';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: UserSettings = {
  id: 1,
  servingsDefault: 2,
  measurementUnits: 'US',
  dietaryFilters: [],
  allergies: [],
  maxSpiciness: 6, // 6 = Any level
  hasSeenSwipeOverlay: false,
  showAllergyWarning: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load settings from localStorage
        const savedSettings = localStorage.get('userSettings');
        
        if (savedSettings) {
          console.log('SettingsProvider: Loaded settings from localStorage:', savedSettings);
          setSettings({ ...defaultSettings, ...savedSettings });
        } else {
          console.log('SettingsProvider: No saved settings found, using defaults');
          // Save default settings to localStorage
          localStorage.set('userSettings', defaultSettings);
        }
      } catch (error) {
        console.error('SettingsProvider: Error loading settings:', error);
        // Fallback to defaults
        setSettings(defaultSettings);
        localStorage.set('userSettings', defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    // Load settings after a short delay to ensure localStorage is available
    const timer = setTimeout(loadSettings, 100);
    return () => clearTimeout(timer);
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = {
      ...settings,
      ...newSettings,
      updatedAt: new Date(),
    };
    
    console.log('SettingsProvider: Updating settings:', newSettings);
    setSettings(updated);
    
    // Save to localStorage
    try {
      localStorage.set('userSettings', updated);
      console.log('SettingsProvider: Settings saved to localStorage');
    } catch (error) {
      console.error('SettingsProvider: Error saving settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
