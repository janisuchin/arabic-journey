// Persisted state. Profiles live under one key; each learner's progress, settings and cards live
// under their own key (<app>/state/<learnerId>), so learners never share data.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_PREFIX, UNLOCK_ALL_EDITION } from '../base/config';
import type { ThemeName } from '../base/palette';
import { DEFAULT_PASS_MARK } from '../core/progress';
import { newCard, review, type Card, type Grade } from '../core/srs';
import type { TranslitStyle } from '../core/translit';

export interface Learner {
  id: string;
  name: string;
  age?: number;
  pin?: string;
  createdAt: number;
}

interface ProfilesState {
  learners: Learner[];
  currentId: string | null;
  addLearner: (l: Omit<Learner, 'id' | 'createdAt'>) => string;
  removeLearner: (id: string) => void;
  setCurrent: (id: string | null) => void;
}

export const useProfiles = create<ProfilesState>()(
  persist(
    (set) => ({
      learners: [],
      currentId: null,
      addLearner: (l) => {
        const id = `l${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
        set((s) => ({ learners: [...s.learners, { ...l, id, createdAt: Date.now() }], currentId: id }));
        return id;
      },
      removeLearner: (id) =>
        set((s) => ({ learners: s.learners.filter((x) => x.id !== id), currentId: s.currentId === id ? null : s.currentId })),
      setCurrent: (id) => set({ currentId: id }),
    }),
    { name: `${STORAGE_PREFIX}/profiles`, storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  colorTheme: ThemeName;
  textScale: number;
  highContrast: boolean;
  showTranslations: boolean;
  showTranslit: boolean;
  translitStyle: TranslitStyle;
  showHarakat: boolean;
  readAloudOnTap: boolean;
  speechRate: number;
  slowRate: number;
  passMark: number;
  unlockAll: boolean;
  reminders: boolean;
  speakingConsent: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  colorTheme: 'Palm',
  textScale: 1,
  highContrast: false,
  showTranslations: true,
  showTranslit: true,
  translitStyle: 'academic',
  showHarakat: true,
  readAloudOnTap: true,
  speechRate: 0.9,
  slowRate: 0.55,
  passMark: DEFAULT_PASS_MARK,
  unlockAll: UNLOCK_ALL_EDITION,
  reminders: false,
  speakingConsent: false,
};

export interface LearnerData {
  settings: Settings;
  completedDays: number[];
  quizScores: Record<number, number>;
  weekTests: Record<number, number>;
  lastPage: { day: number; page: number } | null;
  cards: Record<string, Card>;
  favourites: string[];
  recent: string[];
  activity: Record<string, number>;
  answered: { correct: number; total: number; bySkill: Record<string, { correct: number; total: number }> };
}

const freshData = (): LearnerData => ({
  settings: { ...DEFAULT_SETTINGS },
  completedDays: [],
  quizScores: {},
  weekTests: {},
  lastPage: null,
  cards: {},
  favourites: [],
  recent: [],
  activity: {},
  answered: { correct: 0, total: 0, bySkill: {} },
});

interface LearnerActions {
  hydrated: boolean;
  updateSettings: (p: Partial<Settings>) => void;
  completeDay: (day: number, score: number, wordIds: string[]) => void;
  setWeekTest: (week: number, score: number) => void;
  setLastPage: (day: number, page: number) => void;
  gradeCard: (id: string, grade: Grade) => void;
  toggleFavourite: (id: string) => void;
  noteRecent: (id: string) => void;
  logAnswer: (skill: string, correct: boolean) => void;
  logActivity: (minutes: number) => void;
  resetProgress: () => void;
}

export type LearnerState = LearnerData & LearnerActions;

const today = () => new Date().toISOString().slice(0, 10);

export const useLearner = create<LearnerState>()(
  persist(
    (set) => ({
      ...freshData(),
      hydrated: false,
      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      completeDay: (day, score, wordIds) =>
        set((s) => {
          const now = Date.now();
          const cards = { ...s.cards };
          for (const id of wordIds) if (!cards[id]) cards[id] = newCard(id, now);
          return {
            completedDays: s.completedDays.includes(day) ? s.completedDays : [...s.completedDays, day],
            quizScores: { ...s.quizScores, [day]: Math.max(score, s.quizScores[day] ?? 0) },
            cards,
            recent: [...wordIds, ...s.recent.filter((r) => !wordIds.includes(r))].slice(0, 40),
          };
        }),
      setWeekTest: (week, score) =>
        set((s) => ({ weekTests: { ...s.weekTests, [week]: Math.max(score, s.weekTests[week] ?? 0) } })),
      setLastPage: (day, page) => set({ lastPage: { day, page } }),
      gradeCard: (id, grade) =>
        set((s) => {
          const now = Date.now();
          const card = s.cards[id] ?? newCard(id, now);
          return { cards: { ...s.cards, [id]: review(card, grade, now) } };
        }),
      toggleFavourite: (id) =>
        set((s) => ({ favourites: s.favourites.includes(id) ? s.favourites.filter((f) => f !== id) : [...s.favourites, id] })),
      noteRecent: (id) => set((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 40) })),
      logAnswer: (skill, correct) =>
        set((s) => {
          const prev = s.answered.bySkill[skill] ?? { correct: 0, total: 0 };
          return {
            answered: {
              correct: s.answered.correct + (correct ? 1 : 0),
              total: s.answered.total + 1,
              bySkill: { ...s.answered.bySkill, [skill]: { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 } },
            },
          };
        }),
      logActivity: (minutes) => set((s) => ({ activity: { ...s.activity, [today()]: (s.activity[today()] ?? 0) + minutes } })),
      resetProgress: () => set((s) => ({ ...freshData(), settings: s.settings })),
    }),
    {
      name: `${STORAGE_PREFIX}/state/none`,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) =>
        Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as Partial<LearnerState>,
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<LearnerData>;
        if (version < 1) return { ...freshData(), ...p } as LearnerState;
        return p as LearnerState;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<LearnerData>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } };
      },
    },
  ),
);

/** Point the learner store at a learner's own key and load it. */
export async function loadLearner(id: string | null) {
  useLearner.setState({ ...freshData(), hydrated: false });
  if (!id) {
    useLearner.setState({ hydrated: true });
    return;
  }
  useLearner.persist.setOptions({ name: `${STORAGE_PREFIX}/state/${id}` });
  await useLearner.persist.rehydrate();
  useLearner.setState({ hydrated: true });
}
