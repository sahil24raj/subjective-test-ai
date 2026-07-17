'use client';

import React, { useEffect, useState } from 'react';

export const CyberGrid: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate static floating particles
    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    }));
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 bg-[#050816] overflow-hidden pointer-events-none">
      {/* 1. Cyber Radial Ambient Glow */}
      <div className="absolute inset-0 cyber-radial-glow opacity-80" />
      
      {/* 2. Top and Bottom Neon Blur Accents */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-cyber-blue/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-cyber-purple/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyber-pink/5 rounded-full blur-[100px]" />

      {/* 3. Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-25" />
      <div className="absolute inset-0 cyber-grid-blue opacity-40" />

      {/* 4. Scanning Scanline Laser */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue/40 to-transparent top-0 animate-scanline shadow-[0_0_12px_rgba(0,240,255,0.8)]" />

      {/* 5. Floating Binary Elements / Particles */}
      <div className="absolute inset-0 opacity-40">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyber-blue animate-float"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: `0 0 10px #00f0ff`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
