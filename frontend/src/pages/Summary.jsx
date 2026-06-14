import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import NoPaperSelected from '../components/NoPaperSelected';
import { FileText, ArrowLeft, Lightbulb, Compass, Award, Download } from 'lucide-react';
import './Summary.css';

const Summary = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [style, setStyle] = useState("technical");
  const [length, setLength] = useState("medium");
  

  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setHasGenerated(true);
      const response = await fetch(
        "http://localhost:8000/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paper_url: paper.pdf_url,
            style,
            length
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate summary"
        );
      }

      setSummary(data.summary);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem', textAlign: 'left' }}>
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
    <div className="summary-controls glass">

      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
      >
        <option value="beginner-friendly">
          Beginner Friendly
        </option>
        <option value="technical">
          Technical
        </option>
        <option value="code-oriented">
          Code Oriented
        </option>
        <option value="mathematical">
          Mathematical
        </option>
      </select>

      <select
        value={length}
        onChange={(e) => setLength(e.target.value)}
      >
        <option value="concise">Concise</option>
        <option value="medium">Medium</option>
        <option value="detailed">Detailed</option>
      </select>

      <button
        onClick={fetchSummary}
        className="btn-export"
      >
        Generate Summary
      </button>

    </div>

    {loading ? (
      <div className="empty-results-card glass">
        <h2>Generating Summary...</h2>
      </div>
    ) : error ? (
      <div className="empty-results-card glass">
        <h2>Failed to generate summary</h2>
        <p>{error}</p>
      </div>
    ) : (
      <div className="summary-document glass">
        <ReactMarkdown className="summary-content">
          {summary}
        </ReactMarkdown>
      </div>
    )}
      {/* Action panel */}
      <div className="summary-footer-actions">
        <button
          onClick={() => window.print()}
          className="btn-export"
        >
          <Download style={{ width: '1rem', height: '1rem' }} />
          <span>Export Summary (PDF)</span>
        </button>
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

export default Summary;
