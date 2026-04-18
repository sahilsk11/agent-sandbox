import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { leetCodeProblems, type LeetCodeProblem } from '../data/challenges';
import { BackButton } from '../components/ui/BackButton';
import { GlassPanel } from '../components/ui/GlassPanel';

const stationId = 'leetcode';
const color = '#00d4ff';

type TabType = 'instructions' | 'editor';

export function LeetCodeOverlay() {
  const { completeStation } = useAppStore();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [code, setCode] = useState(leetCodeProblems[0].starterCode);
  const [timeLeft, setTimeLeft] = useState(300);
  const [output, setOutput] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('instructions');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentProblem: LeetCodeProblem = leetCodeProblems[currentProblemIndex];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRun = useCallback(() => {
    setOutput('Running tests...');
    setTimeout(() => {
      const testCase = currentProblem.testCases[0];
      setOutput(`Test: ${testCase.input}\nExpected: ${testCase.expected}`);
      setIsCorrect(Math.random() > 0.5);
    }, 500);
  }, [currentProblem]);

  const handleSubmit = useCallback(() => {
    const score = isCorrect ? 100 : 50;
    completeStation(stationId, score, 100);
  }, [isCorrect, completeStation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextProblem = () => {
    if (currentProblemIndex < leetCodeProblems.length - 1) {
      setCurrentProblemIndex((i) => i + 1);
      setCode(leetCodeProblems[currentProblemIndex + 1].starterCode);
      setOutput(null);
      setIsCorrect(null);
    }
  };

  const prevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex((i) => i - 1);
      setCode(leetCodeProblems[currentProblemIndex - 1].starterCode);
      setOutput(null);
      setIsCorrect(null);
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

        <GlassPanel className="w-full max-w-6xl h-full md:h-[90vh] flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between p-3 md:p-4 border-b border-white/10 gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="text-base md:text-xl font-bold" style={{ color }}>
                LeetCode Arena
              </h2>
              <span className="text-white/50 hidden md:inline">|</span>
              <span className="text-white/70 text-sm">
                {currentProblemIndex + 1}/{leetCodeProblems.length}
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-white/5"
                style={{ borderColor: `${color}30` }}
              >
                <Clock size={14} style={{ color }} className="md:w-4 md:h-4" />
                <span className="font-mono text-sm md:text-lg">{formatTime(timeLeft)}</span>
              </div>
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
              Code Editor
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className={`w-full md:w-1/2 md:border-r border-white/10 overflow-y-auto ${activeTab === 'editor' ? 'hidden md:block' : 'block'}`}>
              <div className="p-3 md:p-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          currentProblem.difficulty === 'Easy'
                            ? '#10b981'
                            : currentProblem.difficulty === 'Medium'
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      {currentProblem.difficulty}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white">
                      {currentProblem.title}
                    </h3>
                  </div>
                  <p className="text-white/70 text-sm">{currentProblem.description}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white/50 mb-2">
                    Examples
                  </h4>
                  {currentProblem.examples.map((example, i) => (
                    <div key={i} className="mb-3 p-3 rounded-lg bg-white/5">
                      <div className="text-sm">
                        <span className="text-white/50">Input: </span>
                        <code className="text-white">{example.input}</code>
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-white/50">Output: </span>
                        <code className="text-white">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div className="text-sm mt-1 text-white/50">
                          {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/50 mb-2">
                    Constraints
                  </h4>
                  <ul className="list-disc list-inside text-sm text-white/70">
                    {currentProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className={`flex-1 flex flex-col ${activeTab === 'instructions' ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex-1 min-h-[200px] md:min-h-0">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
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
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors min-h-[44px]"
                  >
                    <Play size={14} className="md:w-4 md:h-4" />
                    <span className="text-sm">Run</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                    style={{ backgroundColor: color, color: '#0a0a1a' }}
                  >
                    <CheckCircle size={14} className="md:w-4 md:h-4" />
                    <span className="text-sm">Submit</span>
                  </button>
                </div>

                {output && (
                  <div className="p-3 rounded-lg bg-white/5 font-mono text-xs md:text-sm">
                    <pre className="text-white/70 whitespace-pre-wrap">{output}</pre>
                    {isCorrect !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        {isCorrect ? (
                          <CheckCircle size={14} className="md:w-4 md:h-4 text-green-500" />
                        ) : (
                          <XCircle size={14} className="md:w-4 md:h-4 text-red-500" />
                        )}
                        <span
                          style={{ color: isCorrect ? '#10b981' : '#ef4444' }}
                        >
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-0 p-3 md:p-4 border-t border-white/10">
            <button
              onClick={prevProblem}
              disabled={currentProblemIndex === 0}
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Previous Problem
            </button>
            <button
              onClick={nextProblem}
              disabled={currentProblemIndex === leetCodeProblems.length - 1}
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors min-h-[44px] text-sm"
            >
              Next Problem
            </button>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}