import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowRight } from 'lucide-react';
import './NoPaperSelected.css';

const NoPaperSelected = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-state-wrapper">
      {/* Container with Glassmorphism and Hover Glow */}
      <div className="empty-state-card glass animate-float">
        {/* Glow Effects */}
        <div 
          style={{
            position: 'absolute',
            top: '-3rem',
            left: '-3rem',
            width: '8rem',
            height: '8rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            filter: 'blur(32px)',
            pointerEvents: 'none'
          }} 
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-3rem',
            right: '-3rem',
            width: '8rem',
            height: '8rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            filter: 'blur(32px)',
            pointerEvents: 'none'
          }} 
        />

        {/* Floating Icon */}
        <div className="empty-state-icon-box">
          <FileQuestion className="empty-state-icon text-glow-cyan" style={{ width: '2.5rem', height: '2.5rem' }} />
        </div>

        {/* Heading */}
        <h2 className="empty-state-title">
          No Paper Selected
        </h2>

        {/* Subtitle */}
        <p className="empty-state-subtitle">
          Please select a research paper from the Search Papers page to access your AI workspace and study resources.
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate('/search-paper')}
          className="empty-state-btn-wrapper"
        >
          <span className="empty-state-btn-inner">
            <span>Go To Search Papers</span>
            <ArrowRight style={{ width: '1.125rem', height: '1.125rem' }} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default NoPaperSelected;
