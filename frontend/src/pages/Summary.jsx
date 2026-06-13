import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import NoPaperSelected from '../components/NoPaperSelected';
import { FileText, ArrowLeft, Lightbulb, Compass, Award, Download } from 'lucide-react';
import './Summary.css';

const Summary = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;

  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }

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
      <div className="asset-header-section">
        <span className="asset-badge cyan">
          <FileText style={{ width: '1rem', height: '1rem' }} />
          <span>Cognitive Asset // Executive Summary</span>
        </span>
        <h1 className="asset-title">
          {paper.title}
        </h1>
        <p className="asset-meta">
          Published {paper.year} • Synthesized by MultiMind AI Engine
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="summary-card-group">
        
        {/* Key Findings Card */}
        <div className="summary-block-card cyan">
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '8rem',
              height: '8rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.03)',
              filter: 'blur(32px)',
              pointerEvents: 'none'
            }} 
          />
          
          <div className="summary-block-header">
            <div className="summary-block-icon">
              <Lightbulb style={{ width: '1.25rem', height: '1.25rem' }} className="text-glow-cyan" />
            </div>
            <h2 className="summary-block-title">Key Findings</h2>
          </div>

          <ul className="summary-list">
            {paper.keyFindings?.map((finding, idx) => (
              <li key={idx} className="summary-list-item">
                <span className="list-index-circle">
                  {idx + 1}
                </span>
                <p className="list-item-content">
                  {finding}
                </p>
              </li>
            )) || (
              <p className="list-item-content" style={{ fontStyle: 'italic' }}>No findings available.</p>
            )}
          </ul>
        </div>

        {/* Methodology Card */}
        <div className="summary-block-card purple">
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '8rem',
              height: '8rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(168, 85, 247, 0.03)',
              filter: 'blur(32px)',
              pointerEvents: 'none'
            }} 
          />

          <div className="summary-block-header">
            <div className="summary-block-icon">
              <Compass style={{ width: '1.25rem', height: '1.25rem' }} className="text-glow-purple" />
            </div>
            <h2 className="summary-block-title">Methodology</h2>
          </div>

          <ul className="summary-list">
            {paper.methodology?.map((method, idx) => (
              <li key={idx} className="summary-list-item">
                <span className="list-index-circle" />
                <p className="list-item-content">
                  {method}
                </p>
              </li>
            )) || (
              <p className="list-item-content" style={{ fontStyle: 'italic' }}>No methodology steps documented.</p>
            )}
          </ul>
        </div>

        {/* Contributions Card */}
        <div className="summary-block-card blue">
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '8rem',
              height: '8rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.03)',
              filter: 'blur(32px)',
              pointerEvents: 'none'
            }} 
          />

          <div className="summary-block-header">
            <div className="summary-block-icon">
              <Award style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <h2 className="summary-block-title">Core Contributions</h2>
          </div>

          <ul className="summary-list">
            {paper.contributions?.map((contribution, idx) => (
              <li key={idx} className="summary-list-item">
                <span className="list-index-circle" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  ✓
                </span>
                <p className="list-item-content">
                  {contribution}
                </p>
              </li>
            )) || (
              <p className="list-item-content" style={{ fontStyle: 'italic' }}>No contributions listed.</p>
            )}
          </ul>
        </div>

      </div>

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
