import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { behavioralQuestions, type BehavioralQuestion } from '../data/challenges';
import { BackButton } from '../components/ui/BackButton';
import { GlassPanel } from '../components/ui/GlassPanel';

const stationId = 'culture-fit';
const color = '#10b981';

export function CultureFitOverlay() {
  const { completeStation } = useAppStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedRubric, setSelectedRubric] = useState<number | null>(null);

  const currentQuestion: BehavioralQuestion =
    behavioralQuestions[currentQuestionIndex];

  const handleSubmit = useCallback(() => {
    const score = selectedRubric ?? 50;
    completeStation(stationId, score, 100);
  }, [selectedRubric, completeStation]);

  const nextQuestion = () => {
    if (currentQuestionIndex < behavioralQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setAnswer('');
      setSelectedRubric(null);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      setAnswer('');
      setSelectedRubric(null);
    }
  };

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

        <GlassPanel className="w-full max-w-3xl h-full md:h-[90vh] flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between p-3 md:p-4 border-b border-white/10 gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-base md:text-xl font-bold" style={{ color }}>
                Culture Fit Lounge
              </h2>
              <span className="text-white/50 hidden md:inline">|</span>
              <span className="text-white/70 text-sm">
                {currentQuestionIndex + 1}/{behavioralQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded bg-white/5 text-white/50">
                {currentQuestion.category}
              </span>
            </div>
          </div>

          <div className="flex-1 p-3 md:p-6 overflow-y-auto">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">
                  {currentQuestion.question}
                </h3>
                <p className="text-white/50 text-sm">
                  <Star size={14} className="inline mr-1" />
                  {currentQuestion.starPrompt}
                </p>
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-semibold text-white/50 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer using the STAR method..."
                  className="w-full h-32 md:h-40 p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/50 mb-2 md:mb-3">
                  Self-Assessment (STAR Rubric)
                </label>
                <div className="space-y-2">
                  {currentQuestion.rubric.map((item) => (
                    <button
                      key={item.level}
                      onClick={() => setSelectedRubric(item.score)}
                      className={`w-full p-3 md:p-4 rounded-lg text-left transition-all min-h-[60px] ${
                        selectedRubric === item.score
                          ? 'bg-white/10 border-2'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      style={
                        selectedRubric === item.score
                          ? { borderColor: color }
                          : {}
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-semibold text-sm md:text-base"
                          style={{
                            color:
                              item.score >= 80
                                ? '#10b981'
                                : item.score >= 60
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        >
                          {item.level}
                        </span>
                        <span className="text-sm text-white/50">
                          {item.score} points
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mt-1">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 p-3 md:p-4 border-t border-white/10">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={handleSubmit}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 md:px-6 py-2 rounded-lg transition-colors min-h-[44px]"
              style={{ backgroundColor: color, color: '#0a0a1a' }}
            >
              <Send size={14} className="md:w-4 md:h-4" />
              <span className="text-sm">Submit</span>
            </button>

            <button
              onClick={nextQuestion}
              disabled={
                currentQuestionIndex ===
                  behavioralQuestions.length - 1
              }
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}