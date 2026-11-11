import { useEffect, useMemo } from 'react';
import { AppState, useColorScheme } from 'react-native';

import { paletteFor, type Palette } from '../base/palette';
import { validDays, weekOf } from '../content';
import type { ProgressInput } from '../core/progress';
import { useLearner, useProfiles } from './store';

export const useSettings = () => useLearner((s) => s.settings);

export function usePalette(): Palette {
  const scheme = useColorScheme();
  const { theme, colorTheme, highContrast } = useSettings();
  const dark = theme === 'dark' || (theme === 'system' && scheme === 'dark');
  return useMemo(() => paletteFor(colorTheme, dark, highContrast), [colorTheme, dark, highContrast]);
}

export function useCurrentLearner() {
  return useProfiles((s) => s.learners.find((l) => l.id === s.currentId) ?? null);
}

export function useProgressInput(): ProgressInput {
  const completed = useLearner((s) => s.completedDays);
  const weekTests = useLearner((s) => s.weekTests);
  const placementWeek = useLearner((s) => s.placement?.week);
  const { passMark, unlockAll } = useSettings();
  return useMemo(
    () => ({ validDays, weekOf, completedDays: new Set(completed), weekTests, passMark, unlockAll, placementWeek }),
    [completed, weekTests, passMark, unlockAll, placementWeek],
  );
}

/** Font size scaled by the learner's text-size setting (90–150%). */
export function useFs() {
  const scale = useSettings().textScale;
  return (n: number) => Math.round(n * scale);
}

/**
 * Counts study time while a learning screen is open: one minute is logged to today's activity every 60 seconds
 * (foreground only on native). Nothing is sent anywhere; it feeds the Me stats and the Report.
 */
export function useStudyTimer() {
  const logActivity = useLearner((s) => s.logActivity);
  useEffect(() => {
    let active = AppState.currentState !== 'background';
    const sub = AppState.addEventListener('change', (st) => {
      active = st === 'active';
    });
    const id = setInterval(() => {
      if (active) logActivity(1);
    }, 60_000);
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [logActivity]);
}
