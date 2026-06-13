import React from 'react';
import './FloatingBackground.css';

const FloatingBackground = () => {
  return (
    <div className="fixed-bg">
      {/* Deep Space Background Mesh */}
      <div className="bg-space-mesh" />

      {/* Grid Pattern Overlay */}
      <div className="bg-grid-overlay" />

      {/* Ambient Blobs */}
      <div className="ambient-blob blob-cyan" />
      <div className="ambient-blob blob-purple" />
      <div className="ambient-blob blob-blue" />

      {/* Sparkles / Ambient Stars */}
      <div 
        className="ambient-star animate-pulse-slow" 
        style={{ top: '15%', left: '20%', width: '8px', height: '8px', backgroundColor: 'var(--cyan)', opacity: 0.4 }} 
      />
      <div 
        className="ambient-star animate-pulse-slow" 
        style={{ top: '75%', left: '10%', width: '12px', height: '12px', backgroundColor: 'var(--purple)', opacity: 0.3, animationDuration: '3s' }} 
      />
      <div 
        className="ambient-star animate-float" 
        style={{ top: '35%', right: '15%', width: '10px', height: '10px', backgroundColor: 'var(--blue)', opacity: 0.4 }} 
      />
      <div 
        className="ambient-star animate-pulse-slow" 
        style={{ bottom: '20%', right: '30%', width: '8px', height: '8px', backgroundColor: '#ffffff', opacity: 0.2, animationDuration: '5s' }} 
      />
    </div>
  );
};

export default FloatingBackground;
