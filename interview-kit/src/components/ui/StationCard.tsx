import { motion } from 'framer-motion';

interface StationCardProps {
  title: string;
  description: string;
  color: string;
  isVisible: boolean;
}

export function StationCard({ title, description, color, isVisible }: StationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
        scale: isVisible ? 1 : 0.95,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
        style={{ borderColor: `${color}30` }}
      >
        <h3 className="text-xl font-bold mb-2" style={{ color }}>
          {title}
        </h3>
        <p className="text-white/70 text-sm max-w-xs">{description}</p>
      </div>
    </motion.div>
  );
}