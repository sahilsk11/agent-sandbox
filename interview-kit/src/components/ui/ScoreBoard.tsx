import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import type { StationId } from '../../store/useAppStore';

const stationInfo: Record<StationId, { name: string; color: string }> = {
  'leetcode': { name: 'LeetCode Arena', color: '#00d4ff' },
  'system-design': { name: 'System Design Lab', color: '#a855f7' },
  'refactoring': { name: 'Refactoring Garage', color: '#ea580c' },
  'culture-fit': { name: 'Culture Fit Lounge', color: '#10b981' },
};

export function ScoreBoard() {
  const { scores } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalScore = Object.values(scores).reduce(
    (acc, station) => acc + (station.completed ? station.score : 0),
    0
  );
  const maxTotalScore = Object.values(scores).reduce(
    (acc, station) => acc + station.maxScore,
    0
  );
  const completedCount = Object.values(scores).filter((s) => s.completed).length;

  return (
    <div className="fixed top-3 left-3 md:top-4 md:left-auto md:right-4 z-50">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10"
          >
            <span className="text-sm text-white">
              {completedCount}/4
            </span>
            <span className="text-xs text-white/50">completed</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${isExpanded ? 'block' : 'hidden'} md:block`}
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Mission Control</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="md:hidden p-1 text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {(Object.keys(stationInfo) as StationId[]).map((stationId) => {
              const info = stationInfo[stationId];
              const score = scores[stationId];
              return (
                <div key={stationId} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{info.name}</span>
                  <span className="text-sm font-mono" style={{ color: info.color }}>
                    {score.completed ? `${score.score}/${score.maxScore}` : '--'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Total</span>
              <span className="text-lg font-bold text-white">
                {totalScore}/{maxTotalScore}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-white/50">Completed</span>
              <span className="text-xs text-white/50">
                {completedCount}/4 stations
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}