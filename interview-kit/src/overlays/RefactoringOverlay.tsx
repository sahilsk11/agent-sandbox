import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Lightbulb, Send, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { refactoringExercises, type RefactoringExercise } from '../data/challenges';
import { BackButton } from '../components/ui/BackButton';
import { GlassPanel } from '../components/ui/GlassPanel';

const stationId = 'refactoring';
const color = '#ea580c';

type TabType = 'instructions' | 'editor';

export function RefactoringOverlay() {
  const { completeStation } = useAppStore();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('instructions');

  const currentExercise: RefactoringExercise = refactoringExercises[currentExerciseIndex];

  const handleSubmit = useCallback(() => {
    const baseScore = showSolution ? 60 : 80;
    completeStation(stationId, baseScore, 100);
  }, [showSolution, completeStation]);

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

        <GlassPanel className="w-full max-w-6xl h-full md:h-[90vh] flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between p-3 md:p-4 border-b border-white/10 gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-base md:text-xl font-bold" style={{ color }}>
                Refactoring Garage
              </h2>
              <span className="text-white/50 hidden md:inline">|</span>
              <span className="text-white/70 text-sm">
                {currentExerciseIndex + 1}/{refactoringExercises.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor:
                    currentExercise.difficulty === 'Easy'
                      ? '#10b981'
                      : currentExercise.difficulty === 'Medium'
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              >
                {currentExercise.difficulty}
              </span>
            </div>
          </div>

          <div className="flex md:hidden sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'instructions' ? 'text-white border-b-2' : 'text-white/50'
              }`}
              style={{ borderColor: activeTab === 'instructions' ? color : 'transparent' }}
            >
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'editor' ? 'text-white border-b-2' : 'text-white/50'
              }`}
              style={{ borderColor: activeTab === 'editor' ? color : 'transparent' }}
            >
              Your Solution
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className={`w-full md:w-1/3 md:border-r border-white/10 overflow-y-auto ${activeTab === 'editor' ? 'hidden md:block' : 'block'}`}>
              <div className="p-3 md:p-4">
                <div className="mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {currentExercise.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {currentExercise.description}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white/50 mb-2">
                    Original Code
                  </h4>
                  <div className="p-3 rounded-lg bg-white/5 font-mono text-xs overflow-x-auto">
                    <pre className="text-white/70 whitespace-pre">
                      {currentExercise.originalCode}
                    </pre>
                  </div>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white min-h-[44px] w-full px-3 py-2 rounded-lg hover:bg-white/5"
                  >
                    <Lightbulb size={16} style={{ color }} />
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>

                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 rounded-lg bg-white/5"
                    >
                      <ul className="space-y-1 text-sm text-white/70">
                        {currentExercise.hints.map((hint, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color }}>{i + 1}.</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white min-h-[44px] w-full px-3 py-2 rounded-lg hover:bg-white/5"
                  >
                    <ArrowRight size={16} style={{ color }} />
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                  </button>

                  {showSolution && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 rounded-lg bg-white/5"
                    >
                      <pre className="text-xs text-white/70 whitespace-pre font-mono">
                        {currentExercise.refactoredCode}
                      </pre>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className={`flex-1 flex flex-col ${activeTab === 'instructions' ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex-1 min-h-[200px] md:min-h-0">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={userCode || currentExercise.originalCode}
                  onChange={(value) => setUserCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              <div className="p-3 md:p-4 border-t border-white/10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                  <h4 className="text-sm font-semibold text-white/50 whitespace-nowrap">
                    Principles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.principles.map((principle) => (
                      <span
                        key={principle}
                        className="px-2 py-0.5 text-xs rounded bg-white/5 text-white/70"
                        style={{ borderColor: `${color}30` }}
                      >
                        {principle}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors min-h-[44px]"
                    style={{ backgroundColor: color, color: '#0a0a1a' }}
                  >
                    <Send size={16} />
                    Submit Refactor
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-0 p-3 md:p-4 border-t border-white/10">
            <button
              onClick={() => {
                if (currentExerciseIndex > 0) {
                  setCurrentExerciseIndex((i) => i - 1);
                  setUserCode('');
                  setShowHints(false);
                  setShowSolution(false);
                }
              }}
              disabled={currentExerciseIndex === 0}
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Previous Exercise
            </button>
            <button
              onClick={() => {
                if (
                  currentExerciseIndex <
                  refactoringExercises.length - 1
                ) {
                  setCurrentExerciseIndex((i) => i + 1);
                  setUserCode('');
                  setShowHints(false);
                  setShowSolution(false);
                }
              }}
              disabled={
                currentExerciseIndex === refactoringExercises.length - 1
              }
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Next Exercise
            </button>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}