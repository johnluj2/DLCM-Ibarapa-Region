'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ScrollFadeProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  delay?: number;
  amount?: number | 'some' | 'all';
  className?: string;
  id?: string;
}

export default function ScrollFade({
  children,
  direction = 'up',
  distance = 32,
  duration = 0.6,
  delay = 0,
  amount = 0.15,
  className = '',
  id,
  ...props
}: ScrollFadeProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialOffset = getInitialPosition();

  return (
    <motion.div
      id={id}
      className={className}
      initial={{
        opacity: 0,
        ...initialOffset,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: false, // Ensures fade in when scrolling into view AND fade out when scrolling out of view (up or down)
        amount: amount,
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
