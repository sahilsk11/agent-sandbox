import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, ChevronRight, Send } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { systemDesignChallenges, type SystemDesignChallenge } from '../data/challenges';
import { BackButton } from '../components/ui/BackButton';
import { GlassPanel } from '../components/ui/GlassPanel';

const stationId = 'system-design';
const color = '#a855f7';

type TabType = 'description' | 'checklist';

export function SystemDesignOverlay() {
  const { completeStation } = useAppStore();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('description');

  const currentChallenge: SystemDesignChallenge = systemDesignChallenges[currentChallengeIndex];

  const toggleItem = useCallback((item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const totalItems = Object.values(currentChallenge.rubric).reduce(
      (acc, category) => acc + category.items.length,
      0
    );
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const score = Math.round((checkedCount / totalItems) * 100);
    completeStation(stationId, score, 100);
  }, [checkedItems, currentChallenge, completeStation]);

  const allRequirements = currentChallenge.rubric.flatMap((r) => r.items);
  const checkedCount = allRequirements.filter((item) => checkedItems[item]).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4"
      >
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-50">
          <BackButton stationId={stationId} />
        </div>

        <GlassPanel className="w-full max-w-4xl h-full md:h-[90vh] flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between p-3 md:p-4 border-b border-white/10 gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-base md:text-xl font-bold" style={{ color }}>
                System Design Lab
              </h2>
              <span className="text-white/50 hidden md:inline">|</span>
              <span className="text-white/70 text-sm">
                {currentChallengeIndex + 1}/{systemDesignChallenges.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-white/50">
                {checkedCount}/{allRequirements.length} covered
              </span>
              <div
                className="w-16 md:w-24 h-2 rounded-full bg-white/10 overflow-hidden"
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(checkedCount / allRequirements.length) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex md:hidden sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'description' ? 'text-white border-b-2' : 'text-white/50'
              }`}
              style={{ borderColor: activeTab === 'description' ? color : 'transparent' }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'checklist' ? 'text-white border-b-2' : 'text-white/50'
              }`}
              style={{ borderColor: activeTab === 'checklist' ? color : 'transparent' }}
            >
              Checklist
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className={`w-full md:w-1/2 md:border-r border-white/10 overflow-y-auto ${activeTab === 'checklist' ? 'hidden md:block' : 'block'}`}>
              <div className="p-3 md:p-4">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {currentChallenge.title}
                  </h3>
                  <p className="text-white/70 text-sm">{currentChallenge.description}</p>
                </div>

                <div className="mb-4 md:mb-6">
                  <h4 className="text-sm font-semibold text-white/50 mb-2 md:mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {currentChallenge.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                        <ChevronRight
                          size={14}
                          className="mt-0.5 flex-shrink-0 md:w-4 md:h-4"
                          style={{ color }}
                        />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/50 mb-2 md:mb-3">
                    Available Components
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentChallenge.components.map((comp) => (
                      <span
                        key={comp.id}
                        className="px-2 md:px-3 py-1 text-xs md:text-sm rounded-full bg-white/5 border border-white/10"
                        style={{ borderColor: `${color}30` }}
                      >
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`w-full md:w-1/2 p-3 md:p-4 overflow-y-auto ${activeTab === 'description' ? 'hidden md:block' : 'block'}`}>
              <h4 className="text-sm font-semibold text-white/50 mb-3 md:mb-4">
                Design Checklist
              </h4>

              {currentChallenge.rubric.map((category, idx) => (
                <div key={idx} className="mb-4 md:mb-6">
                  <h5 className="text-sm font-semibold mb-2" style={{ color }}>
                    {category.category}
                  </h5>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleItem(item)}
                        className="flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors min-h-[44px]"
                      >
                        {checkedItems[item] ? (
                          <CheckSquare
                            size={18}
                            className="flex-shrink-0 mt-0.5 md:w-5 md:h-5"
                            style={{ color }}
                          />
                        ) : (
                          <Square
                            size={18}
                            className="flex-shrink-0 mt-0.5 text-white/30 md:w-5 md:h-5"
                          />
                        )}
                        <span
                          className={`text-sm ${
                            checkedItems[item]
                              ? 'text-white'
                              : 'text-white/50'
                          }`}
                        >
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-4 md:mt-6">
                <h4 className="text-sm font-semibold text-white/50 mb-2">
                  Design Notes
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your design approach here..."
                  className="w-full h-32 md:h-40 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 p-3 md:p-4 border-t border-white/10">
            <button
              onClick={() => {
                if (currentChallengeIndex > 0) {
                  setCurrentChallengeIndex((i) => i - 1);
                  setCheckedItems({});
                  setNotes('');
                }
              }}
              disabled={currentChallengeIndex === 0}
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Previous Challenge
            </button>

            <button
              onClick={handleSubmit}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg transition-colors min-h-[44px]"
              style={{ backgroundColor: color, color: '#0a0a1a' }}
            >
              <Send size={14} className="md:w-4 md:h-4" />
              <span className="text-sm">Submit Design</span>
            </button>

            <button
              onClick={() => {
                if (
                  currentChallengeIndex <
                  systemDesignChallenges.length - 1
                ) {
                  setCurrentChallengeIndex((i) => i + 1);
                  setCheckedItems({});
                  setNotes('');
                }
              }}
              disabled={
                currentChallengeIndex === systemDesignChallenges.length - 1
              }
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Next Challenge
            </button>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}