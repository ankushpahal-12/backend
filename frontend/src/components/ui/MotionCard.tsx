import React from 'react';
import { motion } from 'framer-motion';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const MotionCard: React.FC<Props> = ({ children, className = '', ...rest }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
