import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import FlashCard from '../components/FlashCard';
import NoPaperSelected from '../components/NoPaperSelected';
import { ArrowLeft, Layers, Sparkles, Award } from 'lucide-react';
import './Flashcards.css';

const Flashcards = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;
  const [topic, setTopic] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }
  const handleGenerate = async () => {
    try {
      setLoading(true);
      setHasGenerated(true);
      const response = await fetch(
        "http://localhost:8000/api/flashcards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('multimind_token')}`
          },
          body: JSON.stringify({
            paper_url: paper.pdf_url || paper.paper_url,
            topic,
            difficulty,
            count
          })
        }
      );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate flashcards"
      );
    }

    setCards(data.flashcards || []);
  } catch (error) {
    console.error(error);
    alert("Failed to generate flashcards");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem', textAlign: 'left' }}>
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
      <div className="flashcard-generator glass">
  <h3>Generate Flashcards</h3>

  <div className="flashcard-generator-row">
    <div className='control-group'> 
    <label htmlFor="topic-select">Topic:</label>
    <select
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
    >
      <option value="mixed">Mixed</option>
      <option value="methodology">Methodology</option>
      <option value="results">Results</option>
      <option value="contributions">Contributions</option>
      <option value="limitations">Limitations</option>
      <option value="experiments">Experiments</option>
    </select>
    </div>
  <div className='control-group'>
    <label htmlFor="difficulty-select">Difficulty:</label>
    <select
      value={difficulty}
      onChange={(e) => setDifficulty(e.target.value)}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    </div>
    <div className='control-group'>
      <label htmlFor="count-select">Card Count:</label>
    <select
      value={count}
      onChange={(e) => setCount(Number(e.target.value))}
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={15}>15</option>
      <option value={20}>20</option>
    </select>
    </div>
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="generate-flashcards-btn"
    >
      {loading
        ? "Generating..."
        : "Generate Flashcards"}
    </button>

  </div>
</div>
      {/* Grid of Flashcards */}
      {loading ? (
        <div className='loading-page'>
        <div className="empty-results-card">
          <h3 className="empty-results-title">
            Generating Flashcards...
          </h3>
          <p className="empty-results-desc">
            Creating personalized study cards from the paper.
          </p>
        </div>
        </div>
      ) : cards.length > 0 ? (
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
      ) : !hasGenerated ? (
        <div className='loading-page'>
        <div className="empty-results-card">
          <h3 className="empty-results-title">
            Generate Flashcards
          </h3>
          <p className="empty-results-desc">
            Choose topic, difficulty and number of cards,
            then click Generate Flashcards.
          </p>
        </div>
        </div>
      ) : (
        <div className = 'loading-page'>
        <div className="empty-results-card glass">
          <h3 className="empty-results-title">
            No flashcards found
          </h3>
          <p className="empty-results-desc">
            Try another topic or difficulty level.
          </p>
        </div>
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
