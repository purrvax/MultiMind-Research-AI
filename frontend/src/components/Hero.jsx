import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="hero-container">
      {/* Decorative center ambient light */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '300px',
          background: 'linear-gradient(to right, var(--cyan-glow), var(--blue-glow), var(--purple-glow))',
          filter: 'blur(120px)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: -10
        }}
      />
      <h1 className="hero-title">
        MultiMind <span className="gradient-text-glow text-glow-cyan">Research AI</span>
      </h1>

      {/* Tagline */}
      <p className="hero-tagline">
        "Analyze, Understand, and Learn Research Papers with AI-Powered Intelligence."
      </p>

      {/* Description */}
      <p className="hero-description">
        MultiMind Research AI helps students and researchers discover research papers and instantly generate summaries, notes, flashcards, and Q&A content using advanced AI.
      </p>

      <button
        onClick={() => navigate('/search-paper')}
        className="btn-glowing-wrapper"
      >
        <span className="btn-glowing-inner">
          <span>Get Started</span>
          <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
        </span>
      </button>
    </section>
  );
};

export default Hero;
