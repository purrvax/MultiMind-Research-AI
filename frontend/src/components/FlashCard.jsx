import React, { useState } from 'react';
import { HelpCircle, CheckCircle, RotateCw } from 'lucide-react';
import './FlashCard.css';

const FlashCard = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
    >
      <div className="flashcard-inner">
        
        {/* CARD FRONT (Question) */}
        <div className="flashcard-face front">
          <div className="flashcard-face-header">
            <div className="face-header-label">
              <HelpCircle style={{ width: '1.125rem', height: '1.125rem' }} />
              <span>Question</span>
            </div>
            <RotateCw className="face-header-flip-icon" style={{ width: '1rem', height: '1rem' }} />
          </div>

          <div className="flashcard-body">
            <p className="flashcard-text">
              {question}
            </p>
          </div>

          <div className="flashcard-footer-tip">
            Click card to reveal answer
          </div>
        </div>

        {/* CARD BACK (Answer) */}
        <div className="flashcard-face back">
          <div className="flashcard-face-header">
            <div className="face-header-label">
              <CheckCircle style={{ width: '1.125rem', height: '1.125rem' }} />
              <span>Answer</span>
            </div>
            <RotateCw className="face-header-flip-icon" style={{ width: '1rem', height: '1rem' }} />
          </div>

          <div className="flashcard-body">
            <p className="flashcard-text">
              {answer}
            </p>
          </div>

          <div className="flashcard-footer-tip">
            Click card to view question again
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlashCard;
