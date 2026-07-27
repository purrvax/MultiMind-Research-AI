import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="hero-container">

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
          <span className="btn-text">Get Started</span>
        </span>
      </button>
    </section>
  );
};

export default Hero;
