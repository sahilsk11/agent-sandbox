import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { Canvas3D } from './components/Canvas3D';
import { ScoreBoard } from './components/ui/ScoreBoard';
import { LeetCodeOverlay } from './overlays/LeetCodeOverlay';
import { SystemDesignOverlay } from './overlays/SystemDesignOverlay';
import { RefactoringOverlay } from './overlays/RefactoringOverlay';
import { CultureFitOverlay } from './overlays/CultureFitOverlay';
import './App.css';

function App() {
  const { activeStation } = useAppStore();

  return (
    <div className="w-full h-full relative">
      <Canvas3D />

      <ScoreBoard />

      <AnimatePresence mode="wait">
        {activeStation === 'leetcode' && (
          <LeetCodeOverlay key="leetcode" />
        )}
        {activeStation === 'system-design' && (
          <SystemDesignOverlay key="system-design" />
        )}
        {activeStation === 'refactoring' && (
          <RefactoringOverlay key="refactoring" />
        )}
        {activeStation === 'culture-fit' && (
          <CultureFitOverlay key="culture-fit" />
        )}
      </AnimatePresence>

      {!activeStation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-white/50 text-xs md:text-sm">
            <span className="hidden sm:inline">Click on a station to begin your interview preparation</span>
            <span className="sm:hidden">Tap a station to begin</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default App;