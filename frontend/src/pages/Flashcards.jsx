import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import FlashCard from '../components/FlashCard';
import NoPaperSelected from '../components/NoPaperSelected';
import { ArrowLeft, Layers, Sparkles, Award } from 'lucide-react';
import './Flashcards.css';

const Flashcards = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;

  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }

  const cards = paper.flashcards || [];

  // Keep track of how many cards have been flipped/studied
  const [studiedCount, setStudiedCount] = useState(0);
  const [studiedSet, setStudiedSet] = useState(new Set());

  const handleCardClick = (idx) => {
    if (!studiedSet.has(idx)) {
      const updated = new Set(studiedSet);
      updated.add(idx);
      setStudiedSet(updated);
      setStudiedCount(updated.size);
    }
  };

  return (
    <div className="container-wide" style={{ padding: '3rem 1.5rem', textAlign: 'left' }}>
      {/* Back Link */}
      <div className="breadcrumb-row">
        <Link 
          to="/workspace" 
          state={{ paper }}
          className="breadcrumb-link"
        >
          <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>Back to Workspace</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="flashcards-header-row">
        <div>
          <span className="asset-badge blue">
            <Layers style={{ width: '1rem', height: '1rem' }} />
            <span>Cognitive Asset // Q&A Flashcards</span>
          </span>
          <h1 className="asset-title">
            {paper.title}
          </h1>
          <p className="asset-meta">
            Interactive memory recall flashcards based on research conclusions and methodology.
          </p>
        </div>

        {/* Progress Tracker Card */}
        {cards.length > 0 && (
          <div className="flashcard-progress-card">
            <div className="progress-icon-box">
              <Award style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <div className="progress-title">Studied Progress</div>
              <div className="progress-counter">
                {studiedCount} of {cards.length} Cards
              </div>
              {/* Minimal Progress Bar */}
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${(studiedCount / cards.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Flashcards */}
      {cards.length > 0 ? (
        <div className="flashcards-grid">
          {cards.map((card, idx) => (
            <div key={idx} onClick={() => handleCardClick(idx)}>
              <FlashCard
                question={card.question}
                answer={card.answer}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results-card glass">
          <Layers className="empty-results-icon" style={{ width: '3rem', height: '3rem' }} />
          <h3 className="empty-results-title">No flashcards found</h3>
          <p className="empty-results-desc">
            We couldn't generate study cards for this paper. Try selecting another item.
          </p>
        </div>
      )}

      {/* Info Notice */}
      {cards.length > 0 && (
        <div className="flashcards-help-notice">
          <Sparkles className="help-notice-icon" style={{ width: '1rem', height: '1rem' }} />
          <p style={{ lineHeight: '1.5' }}>
            <strong>How to study:</strong> Read the question on the front. Try to recall the answer, then click the card to flip and verify your understanding. Repeat until all cards are marked as studied.
          </p>
        </div>
      )}

      {/* Footer Return */}
      <div className="summary-footer-actions" style={{ justifyContent: 'flex-end', marginTop: '3rem' }}>
        <Link
          to="/workspace"
          state={{ paper }}
          className="btn-return-workspace"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
};

export default Flashcards;
