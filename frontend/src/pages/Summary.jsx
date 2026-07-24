import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import NoPaperSelected from '../components/NoPaperSelected';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import './Summary.css';

const Summary = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;
  
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [explanationStyle, setExplanationStyle] = useState("beginner-friendly");
  const [length, setLength] = useState("medium");

  // Fetch summary from API
  const fetchSummary = async () => {
    if (!paper) return;
    try {
      setLoading(true);
      setError(null);
      setHasGenerated(true);
      const response = await fetch(
        "http://localhost:8000/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('multimind_token')}`
          },
          body: JSON.stringify({
            paper_url: paper.pdf_url || paper.paper_url,
            style: explanationStyle,
            length
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate summary");
      }
      setSummary(data.summary.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load summary automatically on mount
  useEffect(() => {
    if (paper) {
      fetchSummary();
    }
  }, []);

  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }

  return (
    <div className="container-narrow summary-page-wrapper" style={{ padding: '3rem 1.5rem', textAlign: 'left' }}>
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
      <div className="asset-header-section">
        <h1 className="asset-title">
          {paper.title}
        </h1>
      </div>

      {/* Summary Controls */}
      <div className="summary-controls glass">
        <div className="control-group">
          <select
            value={explanationStyle}
            disabled={loading}
            onChange={(e) => setExplanationStyle(e.target.value)}
          >
            <option value="beginner-friendly">Beginner Friendly</option>
            <option value="technical">Technical</option>
            <option value="mathematical">Mathematical</option>
          </select>
        </div>

        <div className="control-group">
          <select
            value={length}
            disabled={loading}
            onChange={(e) => setLength(e.target.value)}
          >
            <option value="concise">Concise</option>
            <option value="medium">Medium</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <button
          onClick={fetchSummary}
          className="btn-generate-summary"
          disabled={loading}
        >
          <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} className={loading ? "spin-animation" : ""} />
          <span>
            {hasGenerated ? "Regenerate" : "Generate Summary"}
          </span>
        </button>
      </div>

      {/* Content Area */}
      {!hasGenerated ? (
        <div className='page-loading'>
          <div className="empty-results-card glass">
            <h2>Generate Summary</h2>
            <p>
              Select your preferred summary style and length,
              then generate a personalized summary.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className='page-loading'>
          <div className="empty-results-card glass">
            <div className="spinner-container">
              <div className="loader-ring"></div>
            </div>
            <h2>Generating Summary...</h2>
            <p className="loading-subtext">Synthesizing content with {explanationStyle} focus and {length} length...</p>
          </div>
        </div>
      ) : error ? (
        <div className='page-loading'>
          <div className="empty-results-card error-card glass">
            <h2>Failed to generate summary</h2>
            <button onClick={fetchSummary} className="btn-export" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="summary-document glass">
          <div className="summary-content">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="summary-footer-actions">
        {hasGenerated && !loading && !error && (
          <button
            onClick={() => window.print()}
            className="btn-export"
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            <span>Export Summary (PDF)</span>
          </button>
        )}

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
