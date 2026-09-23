import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'system';
export type RegionId = '8' | '7'; // 8: O'Higgins, 7: Metropolitana

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  subtext: string;
  primary: string;
  chipBackground: string;
  inputBackground: string;
  statusBarStyle: 'light-content' | 'dark-content';
}

const darkColors: ThemeColors = {
  background: '#0B1120',
  card: '#1E293B',
  cardBorder: '#334155',
  text: '#F8FAFC',
  subtext: '#94A3B8',
  primary: '#10B981',
  chipBackground: '#0F172A',
  inputBackground: '#1E293B',
  statusBarStyle: 'light-content',
};

const lightColors: ThemeColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#CBD5E1',
  text: '#0F172A',
  subtext: '#64748B',
  primary: '#059669',
  chipBackground: '#E2E8F0',
  inputBackground: '#FFFFFF',
  statusBarStyle: 'dark-content',
};

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  region: RegionId;
  setRegion: (region: RegionId) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const THEME_STORAGE_KEY = '@turnoya_theme_mode';
const REGION_STORAGE_KEY = '@turnoya_selected_region';

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'dark',
  setMode: () => {},
  region: '8',
  setRegion: () => {},
  colors: darkColors,
  isDark: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [region, setRegionState] = useState<RegionId>('8');
  const systemScheme = useColorScheme();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
          setModeState(savedTheme);
        }

        const savedRegion = await AsyncStorage.getItem(REGION_STORAGE_KEY);
        if (savedRegion === '8' || savedRegion === '7') {
          setRegionState(savedRegion);
        }
      } catch (error) {
        console.error('Error cargando preferencias de AsyncStorage:', error);
      }
    };
    loadPreferences();
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch((err) =>
      console.error('Error guardando tema:', err)
    );
  };

  const setRegion = (newRegion: RegionId) => {
    setRegionState(newRegion);
    AsyncStorage.setItem(REGION_STORAGE_KEY, newRegion).catch((err) =>
      console.error('Error guardando region:', err)
    );
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, setMode, region, setRegion, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
