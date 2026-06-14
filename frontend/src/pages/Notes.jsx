import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NoPaperSelected from '../components/NoPaperSelected';
import { Edit3, ArrowLeft, BookOpen, Layers, Award, Terminal } from 'lucide-react';
import './Notes.css';

const Notes = ({ activePaper }) => {
  const location = useLocation();
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paper = location.state?.paper || activePaper;

  if (!paper) {
    return <NoPaperSelected />;
  }
  useEffect(() => {
  const fetchNotes = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/notes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              paper_url: paper.pdf_url
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail);
        }

        setNotes(data.notes);

      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [paper]);

  if (loading) {
    return (
      <div className="empty-results-card glass">
        <h2>Generating Notes...</h2>
        <p>Analyzing paper understanding and building study notes...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="empty-results-card glass">
        <h2>Failed to load notes</h2>
        <p>{error}</p>
      </div>
    );
  }

  const noteSections = [
    {
      id: "problem",
      title: "Problem",
      content: notes?.problem,
      icon: BookOpen,
      class: "cyan"
    },
    {
      id: "methodology",
      title: "Methodology",
      content: notes?.methodology,
      icon: Layers,
      class: "purple"
    },
    {
      id: "concepts",
      title: "Key Concepts",
      content: notes?.key_concepts,
      icon: Layers,
      class: "blue"
    },
    {
      id: "findings",
      title: "Important Findings",
      content: notes?.important_findings,
      icon: Award,
      class: "blue"
    },
    {
      id: "limitations",
      title: "Limitations",
      content: notes?.limitations,
      icon: Terminal,
      class: "pink"
    },
    {
      id: "conclusion",
      title: "Conclusion",
      content: notes?.conclusion,
      icon: Edit3,
      class: "purple"
    }
  ];

  const visibleSections = noteSections.filter((sec) => {
    if (Array.isArray(sec.content)) {
      return sec.content.length > 0;
    }

    return sec.content && sec.content.trim() !== "";
  });
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
        <h1 className="asset-title">
          {paper.title}
        </h1>
      </div>

      {/* Main Layout: Sidebar + Notes */}
      <div className="notes-layout-row">
        
        {/* Sticky Index Sidebar */}
        <aside className="notes-sidebar">
          <h3 className="sidebar-title">Note Index</h3>
          <nav className="sidebar-nav">
            {visibleSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="sidebar-nav-link"
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Notes Container */}
        <div className="notes-list-container">
          {visibleSections.map((sec) => {
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
                {Array.isArray(sec.content) ? (
                  <ul className="notes-list">
                    {sec.content?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="note-block-text">
                    {sec.content}
                  </p>
                )}

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
