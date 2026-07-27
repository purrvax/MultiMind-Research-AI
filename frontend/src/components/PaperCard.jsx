import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Bookmark, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import './PaperCard.css';

const PaperCard = ({ paper, onSelect }) => {
  const navigate = useNavigate();
  const { title, year, citation_count, abstract, pdf_url } = paper;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = () => {
    navigate("/building-workspace", {
      state: {paper}
    });
  };

  return (
    <div className="paper-card glass">
      <div>
        {/* Top Badges */}
        <div className="paper-card-badges">
          <span className="badge-year">
            <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
            <span>{year || "N/A"}</span>
          </span>
        </div>

        {/* Paper Title (More Prominent & Larger) */}
        <h3 className="paper-card-title">{title}</h3>

        {/* Abstract - Collapsible */}
        <div className="paper-abstract-box">
          <p className={`paper-abstract-text ${isExpanded ? '' : 'clamped'}`}>
            {abstract || "No abstract available"}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="abstract-toggle-btn"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp style={{ width: '0.875rem', height: '0.875rem' }} />
              </>
            ) : (
              <>
                <span>Read abstract</span>
                <ChevronDown style={{ width: '0.875rem', height: '0.875rem' }} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="paper-card-actions">
        {pdf_url && (
          <a
            href={pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Eye style={{ width: '1rem', height: '1rem' }} />
            <span>View PDF</span>
            <ExternalLink style={{ width: '0.75rem', height: '0.75rem', opacity: 0.6 }} />
          </a>
        )}
        
        <button
          onClick = {handleSelect}
          className="btn-primary"
        >
          <span>Select Paper</span>
        </button>
      </div>

      {/* Ambient bottom glow bar */}
      <div className="paper-glow-line" />
    </div>
  );
};

export default PaperCard;
