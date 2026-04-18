import { create } from 'zustand';

export type StationId = 'leetcode' | 'system-design' | 'refactoring' | 'culture-fit';

export interface StationScore {
  stationId: StationId;
  completed: boolean;
  score: number;
  maxScore: number;
}

interface AppState {
  activeStation: StationId | null;
  scores: Record<StationId, StationScore>;
  setActiveStation: (stationId: StationId | null) => void;
  completeStation: (stationId: StationId, score: number, maxScore: number) => void;
  resetAll: () => void;
}

const createDefaultScore = (stationId: StationId): StationScore => ({
  stationId,
  completed: false,
  score: 0,
  maxScore: 100,
});

export const useAppStore = create<AppState>((set) => ({
  activeStation: null,
  scores: {
    'leetcode': createDefaultScore('leetcode'),
    'system-design': createDefaultScore('system-design'),
    'refactoring': createDefaultScore('refactoring'),
    'culture-fit': createDefaultScore('culture-fit'),
  },
  setActiveStation: (stationId) => set({ activeStation: stationId }),
  completeStation: (stationId, score, maxScore) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [stationId]: { stationId, completed: true, score, maxScore },
      },
      activeStation: null,
    })),
  resetAll: () =>
    set({
      activeStation: null,
      scores: {
        'leetcode': createDefaultScore('leetcode'),
        'system-design': createDefaultScore('system-design'),
        'refactoring': createDefaultScore('refactoring'),
        'culture-fit': createDefaultScore('culture-fit'),
      },
    }),
}));
