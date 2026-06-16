import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import NoPaperSelected from '../components/NoPaperSelected';
import { FileText, ArrowLeft, Lightbulb, Compass, Award, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import './Summary.css';

const Summary = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;
  
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
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
      setError(null);
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
      console.log(data);
      console.log(data.summary);
      console.log(typeof data.summary.summary);
      setSummary(data.summary.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


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
        <div className="asset-badge cyan">
          <FileText style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>Executive Summary</span>
        </div>
        <h1 className="asset-title">
          {paper.title}
        </h1>
        {paper.authors && (
          <div className="asset-meta">
            <span>By {paper.authors}</span>
          </div>
        )}
      </div>

      {/* Summary Controls */}
      <div className="summary-controls glass">
        <div className="control-group">
          <select
            value={length}
            disabled = {loading}
            onChange={(e) => setLength(e.target.value)}
          >
            <option value="beginner-friendly">Beginner Friendly</option>
            <option value="technical">Technical</option>
            <option value="mathematical">Mathematical</option>
            </select>
        </div>

        <div className="control-group">
          <select
            value={length}
            disabled = {loading}
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
            {hasGenerated
              ? "Regenerate"
              : "Generate Summary"}
          </span>
        </button>
      </div>

      {/* Content Area */}
            {!hasGenerated ? (
        <div className="empty-results-card glass">
          <h2>Generate Summary</h2>
          <p>
            Select your preferred summary style and length,
            then generate a personalized summary.
          </p>
        </div>
      ) 
      :loading ? (
        <div className="empty-results-card glass">
          <div className="spinner-container">
            <div className="loader-ring"></div>
          </div>
          <h2>Generating Summary...</h2>
          <p className="loading-subtext">Synthesizing content with {style} focus and {length} length...</p>
        </div>
      ) : error ? (
        <div className="empty-results-card error-card glass">
          <div className="error-icon-box">
            <AlertTriangle style={{ width: '2rem', height: '2rem', color: 'var(--pink)' }} />
          </div>
          <h2>Failed to generate summary</h2>
          <p>{error}</p>
          <button onClick={fetchSummary} className="btn-export" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Try Again
          </button>
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

      {/* Action panel */}
      <div className="summary-footer-actions">
        {hasGenerated && !loading && !error && (
          <button
            onClick={() => window.print()}
            className="btn-export"
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            <span>Export Summary (PDF)</span>
          </button>
        )} </div>
        
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
