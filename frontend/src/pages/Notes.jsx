import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NoPaperSelected from '../components/NoPaperSelected';
import {
  Edit3,
  ArrowLeft,
  BookOpen,
  Layers,
  Award,
  Terminal,
  HelpCircle,
  CheckCircle,
  Info,
  Flame,
  Lightbulb,
  Bookmark,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import './Notes.css';

const Notes = ({ activePaper }) => {
  const location = useLocation();
  const [data, setData] = useState(null); // stores the entire payload: { notes, highlights }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});

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
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('multimind_token')}`
            },
            body: JSON.stringify({
              paper_url: paper.pdf_url || paper.paper_url
            })
          }
        );

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.detail || "Failed to retrieve notes");
        }

        // resData should contain: { notes, highlights, status }
        setData(resData);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [paper]);

  const toggleAnswer = (idx) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (loading) {
    return (
      <div className='loading-page'>
      <div className="empty-results-card glass">
        <div className="spinner-container">
          <div className="loader-ring"></div>
        </div>
        <h2>Generating Study Notes...</h2>
        <p className="loading-subtext">Analyzing paper mechanics, terminology, and synthesizing revision questions...</p>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='loading-page'>
      <div className="empty-results-card error-card glass">
        <div className="error-icon-box">
          <AlertTriangle style={{ width: '2rem', height: '2rem', color: 'var(--pink)' }} />
        </div>
        <h2>Failed to load notes</h2>
        <p>{error}</p>
        <Link to="/workspace" state={{ paper }} className="btn-return-workspace" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
          Back to Workspace
        </Link>
      </div>
      </div>
    );
  }

  const notes = data?.notes;
  const highlights = data?.highlights;

  // Dynamically determine which sections are available
  const noteSections = [
    {
      id: "overview",
      title: "Overview",
      content: notes?.overview,
      icon: Info,
      class: "cyan"
    },
    {
      id: "quick_revision",
      title: "Quick Revision Sheet",
      content: notes?.quick_revision_sheet,
      icon: Bookmark,
      class: "purple"
    },
    {
      id: "problem",
      title: "Problem Statement",
      content: notes?.problem_statement || notes?.problem,
      icon: BookOpen,
      class: "cyan"
    },
    {
      id: "methodology",
      title: "Methodology Breakdown",
      content: notes?.methodology_breakdown || notes?.methodology,
      icon: Cpu,
      class: "purple"
    },
    {
      id: "concepts",
      title: "Core Concepts",
      content: notes?.core_concepts,
      icon: Layers,
      class: "blue"
    },
    {
      id: "findings",
      title: "Key Findings",
      content: notes?.key_findings,
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
      id: "revision_notes",
      title: "Revision Notes",
      content: notes?.revision_notes,
      icon: Edit3,
      class: "purple"
    },
    {
      id: "questions",
      title: "Practice Questions",
      content: notes?.possible_exam_questions,
      icon: HelpCircle,
      class: "pink"
    },
    {
      id: "conclusion",
      title: "Conclusion",
      content: notes?.conclusion,
      icon: CheckCircle,
      class: "cyan"
    }
  ];

  const visibleSections = noteSections.filter((sec) => {
    if (!sec.content) return false;
    if (Array.isArray(sec.content)) {
      return sec.content.length > 0;
    }
    if (typeof sec.content === 'object') {
      return Object.values(sec.content).some(val => 
        (Array.isArray(val) && val.length > 0) || (typeof val === 'string' && val.trim() !== '')
      );
    }
    return String(sec.content).trim() !== "";
  });

  return (
    <div className="container-wide notes-page-wrapper" style={{ padding: '3rem 1.5rem', textAlign: 'left' }}>
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
          <h3 className="sidebar-title">Study Guide Index</h3>
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
                {/* Header block */}
                <div className="note-card-header">
                  <div className="note-card-title-group">
                    <h2 className="note-section-title">{sec.title}</h2>
                  </div>
                </div>

                {/* Content rendering per section schema */}
                <div className="note-card-content">
                  
                  {/* OVERVIEW SECTION */}
                  {sec.id === "overview" && (
                    <div className="overview-grid">
                      {notes?.overview?.paper_goal && (
                        <div className="overview-item">
                          <h4>Goal of the Paper</h4>
                          <p>{notes.overview.paper_goal}</p>
                        </div>
                      )}
                      {notes?.overview?.main_contribution && (
                        <div className="overview-item">
                          <h4>Main Contribution</h4>
                          <p>{notes.overview.main_contribution}</p>
                        </div>
                      )}
                      {notes?.overview?.why_it_matters && (
                        <div className="overview-item">
                          <h4>Why It Matters</h4>
                          <p>{notes.overview.why_it_matters}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUICK REVISION SHEET */}
                  {sec.id === "quick_revision" && (
                    <div className="revision-sheet-layout">
                      {notes?.quick_revision_sheet?.must_remember && notes.quick_revision_sheet.must_remember.length > 0 && (
                        <div className="revision-column must-remember">
                          <h4>Must Remember</h4>
                          <ul>
                            {notes.quick_revision_sheet.must_remember.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {notes?.quick_revision_sheet?.key_takeaways && notes.quick_revision_sheet.key_takeaways.length > 0 && (
                        <div className="revision-column key-takeaways">
                          <h4> Key Takeaways</h4>
                          <ul>
                            {notes.quick_revision_sheet.key_takeaways.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {notes?.quick_revision_sheet?.important_terms && notes.quick_revision_sheet.important_terms.length > 0 && (
                        <div className="revision-column important-terms">
                          <h4>Important Terms</h4>
                          <div className="terms-glossary">
                            {notes.quick_revision_sheet.important_terms.map((term, i) => (
                              <span key={i} className="glossary-term">{term}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROBLEM STATEMENT */}
                  {sec.id === "problem" && (
                    <div className="problem-statement-box">
                      {Array.isArray(sec.content) ? (
                        <ul className="notes-list-styled">
                          {sec.content.map((item, idx) => (
                            <li key={idx}>
                              <div className="bullet-indicator"></div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="note-block-text">{sec.content}</p>
                      )}
                    </div>
                  )}

                  {/* METHODOLOGY TIMELINE */}
                  {sec.id === "methodology" && (
                    <div className="methodology-container">
                      {Array.isArray(notes?.methodology_breakdown) ? (
                        <div className="methodology-timeline">
                          {notes.methodology_breakdown.map((item, idx) => (
                            <div key={idx} className="timeline-node">
                              <div className="timeline-badge">
                                <span>{idx + 1}</span>
                              </div>
                              <div className="timeline-content glass">
                                <h4>{item.step}</h4>
                                <p className="timeline-desc">{item.description}</p>
                                {item.purpose && (
                                  <div className="timeline-purpose-tag">
                                    <strong>Purpose:</strong> {item.purpose}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : Array.isArray(notes?.methodology) ? (
                        <ul className="notes-list-styled">
                          {notes.methodology.map((item, idx) => (
                            <li key={idx}>
                              <div className="bullet-indicator"></div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="note-block-text">{sec.content}</p>
                      )}
                    </div>
                  )}

                  {/* CORE CONCEPTS GRID */}
                  {sec.id === "concepts" && (
                    <div className="concepts-grid">
                      {notes?.core_concepts?.map((concept, idx) => (
                        <div key={idx} className="concept-card glass">
                          <h3>{concept.title}</h3>
                          
                          {/* Fallback support */}
                          {concept.explanation && (
                            <p className="concept-explanation">{concept.explanation}</p>
                          )}

                          {concept.definition && (
                            <div className="concept-sub-field">
                              <span className="field-label">Definition</span>
                              <p className="concept-definition-text">{concept.definition}</p>
                            </div>
                          )}

                          {concept.how_it_works && (
                            <div className="concept-sub-field">
                              <span className="field-label">How it Works</span>
                              <p>{concept.how_it_works}</p>
                            </div>
                          )}

                          {concept.why_it_matters && (
                            <div className="concept-sub-field">
                              <span className="field-label">Why It Matters</span>
                              <p>{concept.why_it_matters}</p>
                            </div>
                          )}

                          {concept.example && (
                            <div className="study-callout example-callout">
                              <div className="callout-header">
                                <span>Example</span>
                              </div>
                              <p>{concept.example}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* KEY FINDINGS */}
                  {sec.id === "findings" && (
                    <div className="findings-container">
                      {notes?.key_findings?.map((item, idx) => (
                        <div key={idx} className="finding-card glass">
                          <div className="finding-title-row">
                            <h3>{item.finding}</h3>
                          </div>
                          
                          {item.interpretation && (
                            <div className="finding-detail">
                              <strong>Interpretation:</strong> {item.interpretation}
                            </div>
                          )}
                          
                          {item.significance && (
                            <div className="finding-detail highlight-significance">
                              <strong>Significance:</strong> {item.significance}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LIMITATIONS */}
                  {sec.id === "limitations" && (
                    <div className="limitations-container">
                      {Array.isArray(notes?.limitations) && typeof notes.limitations[0] === 'object' ? (
                        <div className="limitations-grid">
                          {notes.limitations.map((item, idx) => (
                            <div key={idx} className="limitation-item glass">
                              <h4>{item.limitation}</h4>
                              {item.impact && (
                                <p className="limitation-impact">
                                  <strong>Impact:</strong> {item.impact}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : Array.isArray(notes?.limitations) ? (
                        <ul className="notes-list-styled">
                          {notes.limitations.map((item, idx) => (
                            <li key={idx}>
                              <div className="bullet-indicator warning"></div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="note-block-text">{sec.content}</p>
                      )}
                    </div>
                  )}

                  {/* REVISION NOTES */}
                  {sec.id === "revision_notes" && Array.isArray(sec.content) && (
                    <ul className="notes-list-styled">
                      {sec.content.map((item, idx) => (
                        <li key={idx}>
                          <div className="bullet-indicator info"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* EXAM QUESTIONS ACCORDION */}
                  {sec.id === "questions" && (
                    <div className="exam-questions-accordion">
                      {notes?.possible_exam_questions?.map((item, idx) => {
                        const isOpen = !!revealedAnswers[idx];
                        return (
                          <div key={idx} className={`question-wrapper glass ${isOpen ? 'open' : ''}`}>
                            <button className="question-header-btn" onClick={() => toggleAnswer(idx)}>
                              <div className="question-title-col">
                                <span className="question-number">Question {idx + 1}</span>
                                <h4>{item.question}</h4>
                              </div>
                              <div className="toggle-indicator">
                                {isOpen ? <ChevronUp style={{ width: '1.25rem', height: '1.25rem' }} /> : <ChevronDown style={{ width: '1.25rem', height: '1.25rem' }} />}
                              </div>
                            </button>
                            <div className="question-answer-body">
                              <div className="answer-content">
                                <div className="answer-badge">Model Answer</div>
                                <p>{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CONCLUSION */}
                  {sec.id === "conclusion" && (
                    <div className="conclusion-block">
                      {Array.isArray(sec.content) ? (
                        <ul className="notes-list-styled">
                          {sec.content.map((item, idx) => (
                            <li key={idx}>
                              <div className="bullet-indicator success"></div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="note-block-text">{sec.content}</p>
                      )}
                    </div>
                  )}

                </div>

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

export default Notes;
