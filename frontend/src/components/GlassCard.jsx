import { motion } from 'framer-motion';

/** Glassmorphism surface with subtle entrance animation. */
export function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`glass-panel p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
