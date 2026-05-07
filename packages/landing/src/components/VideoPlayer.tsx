import React from 'react';

interface VideoPlayerProps {
  src: string;
  label?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, label, className = '' }) => {
  return (
    <div className={`relative bg-card border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {label && (
        <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-blue-400 z-10">
          ● {label}
        </span>
      )}
      <video autoPlay loop muted playsInline className="w-full h-full object-cover">
        <source src={src} type="video/webm" />
      </video>
    </div>
  );
};
