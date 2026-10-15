'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  id?: string;
}

export default function LogoLoader({
  size = 'md',
  text,
  subtext,
  id = 'logo-loader',
}: LogoLoaderProps) {
  const sizeMap = {
    sm: { box: 'w-20 h-20', logo: 'w-12 h-12', stroke: 3, radius: 36, view: 80, dashLength: 60, dashGap: 166 },
    md: { box: 'w-28 h-28', logo: 'w-18 h-18', stroke: 3.5, radius: 46, view: 100, dashLength: 85, dashGap: 204 },
    lg: { box: 'w-36 h-36', logo: 'w-24 h-24', stroke: 4, radius: 60, view: 130, dashLength: 110, dashGap: 267 },
  };

  const config = sizeMap[size];

  return (
    <div id={id} className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${config.box} flex items-center justify-center`}>
        {/* Moving Line SVG round the logo */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${config.view} ${config.view}`}
        >
          <defs>
            <linearGradient id={`movingLineGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CA8A04" />
              <stop offset="65%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#0B132B" />
            </linearGradient>
          </defs>

          {/* Background subtle guide track */}
          <circle
            cx={config.view / 2}
            cy={config.view / 2}
            r={config.radius}
            fill="none"
            stroke="#CA8A04"
            strokeOpacity="0.18"
            strokeWidth={config.stroke}
          />

          {/* Moving line round the logo */}
          <motion.circle
            cx={config.view / 2}
            cy={config.view / 2}
            r={config.radius}
            fill="none"
            stroke={`url(#movingLineGrad-${size})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${config.dashLength} ${config.dashGap}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: 'center' }}
          />
        </svg>

        {/* DLCM Logo Badged in Center */}
        <div className={`relative ${config.logo} rounded-full bg-white p-2.5 shadow-lg shadow-royal-gold/10 border border-royal-gold/25 flex items-center justify-center overflow-hidden`}>
          <motion.div
            className="w-full h-full relative"
            animate={{ scale: [0.95, 1.03, 0.95] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/logo.png"
              alt="Deeper Life Logo"
              fill
              className="object-contain"
              referrerPolicy="no-referrer"
              priority
            />
          </motion.div>
        </div>
      </div>

      {(text || subtext) && (
        <div className="text-center space-y-1">
          {text && (
            <p className="text-xs font-mono font-bold text-deep-navy uppercase tracking-widest">
              {text}
            </p>
          )}
          {subtext && (
            <p className="text-[11px] text-gray-400 font-sans">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
