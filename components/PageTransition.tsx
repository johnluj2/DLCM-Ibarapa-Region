'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Scroll to top on route change smoothly
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.35,
          ease: [0.25, 1, 0.5, 1],
        }}
        className="w-full flex-1 flex flex-col"
        id={`page-transition-${pathname.replace(/[^a-zA-Z0-9_-]/g, '_') || 'root'}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
