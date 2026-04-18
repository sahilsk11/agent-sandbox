import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface BackButtonProps {
  stationId: string;
  onClick?: () => void;
}

export function BackButton({ stationId, onClick }: BackButtonProps) {
  const { setActiveStation } = useAppStore();

  const handleClick = () => {
    setActiveStation(null);
    onClick?.();
  };

  const colors: Record<string, string> = {
    'leetcode': '#00d4ff',
    'system-design': '#a855f7',
    'refactoring': '#ea580c',
    'culture-fit': '#10b981',
  };

  const color = colors[stationId] || '#ffffff';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex items-center gap-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white hover:bg-white/10 transition-colors"
      style={{ borderColor: `${color}30` }}
    >
      <ArrowLeft size={18} style={{ color }} />
      <span className="text-sm font-medium">Back to Hub</span>
    </motion.button>
  );
}