import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

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
  const { passMark, unlockAll } = useSettings();
  return useMemo(
    () => ({ validDays, weekOf, completedDays: new Set(completed), weekTests, passMark, unlockAll }),
    [completed, weekTests, passMark, unlockAll],
  );
}

/** Font size scaled by the learner's text-size setting (90–150%). */
export function useFs() {
  const scale = useSettings().textScale;
  return (n: number) => Math.round(n * scale);
}
