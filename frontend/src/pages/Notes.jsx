import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import NoPaperSelected from '../components/NoPaperSelected';
import { Edit3, ArrowLeft, BookOpen, Layers, Award, Terminal } from 'lucide-react';
import './Notes.css';

const Notes = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;

  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }

  const noteSections = [
    {
      id: "introduction",
      title: "1. Introduction & Background",
      content: paper.notes?.introduction || paper.introduction || "No introduction notes available.",
      icon: BookOpen,
      color: "border-accentCyan/30 text-accentCyan bg-accentCyan/5",
      class: "cyan"
    },
    {
      id: "methodology",
      title: "2. Technical Methodology",
      content: paper.notes?.methodology || "No methodology notes available.",
      icon: Layers,
      color: "border-accentPurple/30 text-accentPurple bg-accentPurple/5",
      class: "purple"
    },
    {
      id: "results",
      title: "3. Experimental Results",
      content: paper.notes?.results || "No results notes available.",
      icon: Award,
      color: "border-accentBlue/30 text-accentBlue bg-accentBlue/5",
      class: "blue"
    },
    {
      id: "conclusion",
      title: "4. Conclusion & Outlook",
      content: paper.notes?.conclusion || "No conclusion notes available.",
      icon: Terminal,
      color: "border-pink-500/30 text-pink-500 bg-pink-500/5",
      class: "pink"
    },
  ];

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
      <div className="asset-header-section">
        <span className="asset-badge purple">
          <Edit3 style={{ width: '1rem', height: '1rem' }} />
          <span>Cognitive Asset // Structured Study Notes</span>
        </span>
        <h1 className="asset-title">
          {paper.title}
        </h1>
        <p className="asset-meta">
          Double-click any section to annotate or add custom notes.
        </p>
      </div>

      {/* Main Layout: Sidebar + Notes */}
      <div className="notes-layout-row">
        
        {/* Sticky Index Sidebar */}
        <aside className="notes-sidebar">
          <h3 className="sidebar-title">Note Index</h3>
          <nav className="sidebar-nav">
            {noteSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="sidebar-nav-link"
              >
                {sec.title.split('. ')[1]}
              </a>
            ))}
          </nav>
        </aside>

        {/* Notes Container */}
        <div className="notes-list-container">
          {noteSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section 
                key={sec.id} 
                id={sec.id}
                className={`note-block-card glass ${sec.class}`}
              >
                {/* Header block with floating details */}
                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'between', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <div className="note-block-icon-box">
                      <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                    </div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{sec.title}</h2>
                  </div>
                  <span style={{ fontSize: '9px', color: '#4b5563', fontFamily: 'monospace', textTransform: 'uppercase' }}>Read Only</span>
                </div>

                {/* Content body */}
                <p className="note-block-text">
                  {sec.content}
                </p>

                {/* Micro-interaction decoration */}
                <div className="note-block-decoration">
                  <span className="badge-note-ref">
                    Section Ref: {sec.id}
                  </span>
                </div>
              </section>
            );
          })}
        </div>

      </div>

      {/* Footer Return */}
      <div className="summary-footer-actions" style={{ justifyContent: 'flex-end' }}>
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

export default Notes;
