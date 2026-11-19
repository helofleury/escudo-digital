
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getKv, setKv } from '@/db/userRepository';
import type { AppSettings } from '@/types';
import { colors } from '@/constants/theme';
import { isRecord } from '@/utils/guards';

type SettingsState = AppSettings;

const DEFAULTS: SettingsState = {
  largeText: false,
  notifications: true,
  saveHistory: true,
};

const KEY = 'app_settings';

interface SettingsValue {
  settings: SettingsState;
  fontScale: number;
  isDark: false;
  colors: typeof colors;
  update: (patch: Partial<SettingsState>) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

function parseSettings(raw: string | null): SettingsState {
  if (raw === null) return DEFAULTS;

  try {
    const data: unknown = JSON.parse(raw);

    if (!isRecord(data)) return DEFAULTS;

    return {
      largeText:
        typeof data.largeText === 'boolean'
          ? data.largeText
          : DEFAULTS.largeText,

      notifications:
        typeof data.notifications === 'boolean'
          ? data.notifications
          : DEFAULTS.notifications,

      saveHistory:
        typeof data.saveHistory === 'boolean'
          ? data.saveHistory
          : DEFAULTS.saveHistory,
    };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);

  useEffect(() => {
    let active = true;

    getKv(KEY)
      .then((raw) => {
        if (active) {
          setSettings(parseSettings(raw));
        }
      })
      .catch(() => {
        if (active) {
          setSettings(DEFAULTS);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    async (patch: Partial<SettingsState>): Promise<void> => {
      const next = { ...settings, ...patch };

      setSettings(next);
      await setKv(KEY, JSON.stringify(next));
    },
    [settings],
  );

  const value = useMemo<SettingsValue>(
    () => ({
      settings,
      fontScale: settings.largeText ? 1.2 : 1,
      isDark: false,
      colors,
      update,
    }),
    [settings, update],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);

  if (ctx === null) {
    throw new Error('useSettings fora do SettingsProvider');
  }

  return ctx;
}
