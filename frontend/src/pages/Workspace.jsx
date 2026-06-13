import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import WorkspaceCard from '../components/WorkspaceCard';
import NoPaperSelected from '../components/NoPaperSelected';
import { FileText, Edit3, HelpCircle, MessageSquare, BookOpen, ExternalLink, Calendar } from 'lucide-react';
import './Workspace.css';

const Workspace = ({ activePaper, setActivePaper }) => {
  const location = useLocation();

  // Find the selected paper from either location state or global state
  const paper = location.state?.paper || activePaper;

  // Sync state with parent active paper
  useEffect(() => {
    if (paper && (!activePaper || activePaper.id !== paper.id)) {
      setActivePaper(paper);
    }
  }, [paper, activePaper, setActivePaper]);

  // If no paper is selected, show the beautiful Route Protection screen
  if (!paper) {
    return <NoPaperSelected />;
  }

  const workspaceFeatures = [
    {
      title: "Executive Summary",
      description: "Access synthesized key findings, core methodology, and main contributions of the paper.",
      path: "/summary",
      icon: FileText,
      colorClass: "cyan",
    },
    {
      title: "Structured Notes",
      description: "Read organized literature study notes covering introduction, method details, results, and conclusions.",
      path: "/notes",
      icon: Edit3,
      colorClass: "blue",
    },
    {
      title: "Flashcards",
      description: "Test your understanding of the paper's key parameters and concepts with interactive flip cards.",
      path: "/flashcards",
      icon: HelpCircle,
      colorClass: "blue",
    },
    {
      title: "Interactive QnA",
      description: "Ask specific questions regarding equations, implementations, or dataset details from this paper.",
      path: "/qna",
      icon: MessageSquare,
      colorClass: "cyan",
    },
  ];

  return (
    <div className="container-wide" style={{ padding: '3rem 1.5rem', textAlign: 'left' }}>
      {/* Navigation Breadcrumb */}
      <div className="breadcrumb-row">
        <Link 
          to="/search-paper" 
          className="breadcrumb-link"
        >
          <span>← Back to Search Papers</span>
        </Link>
      </div>

      {/* Main OS Title */}
      <div className="workspace-title-box">
        <h1 className="workspace-main-title">
          Research Workspace
        </h1>
      </div>

      {/* Selected Paper Details - Premium Hero Card */}
      <div className="workspace-paper-hero">
        {/* Glow ambient background lights */}
        <div 
          style={{
            position: 'absolute',
            top: '-3rem',
            right: '-3rem',
            width: '16rem',
            height: '16rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 182, 212, 0.04)',
            filter: 'blur(48px)',
            pointerEvents: 'none',
            zIndex: -10
          }} 
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-3rem',
            left: '-3rem',
            width: '16rem',
            height: '16rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(168, 85, 247, 0.04)',
            filter: 'blur(48px)',
            pointerEvents: 'none',
            zIndex: -10
          }} 
        />

        <div className="workspace-hero-inner">
          <div className="workspace-hero-content">
            {/* Metadata Badges */}
            <div className="workspace-hero-metadata">
              <span className="badge-published">
                <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Published {paper.year}</span>
              </span>
              <span className="badge-gray">
                {paper.citations.toLocaleString()} Citations
              </span>
            </div>

            {/* Paper Title */}
            <h2 className="workspace-hero-title">
              {paper.title}
            </h2>

            {/* Abstract / Intro snippet */}
            <p className="workspace-hero-abstract">
              {paper.introduction || paper.abstract}
            </p>
          </div>

          {/* Action button */}
          <div className="workspace-hero-action">
            <a
              href={paper.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-source-pdf"
            >
              <BookOpen style={{ width: '1.125rem', height: '1.125rem', color: 'var(--cyan)' }} />
              <span>Read Source PDF</span>
              <ExternalLink style={{ width: '0.875rem', height: '0.875rem', opacity: 0.6 }} />
            </a>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid (2x2 Grid of Floating Cards) */}
      <div className="workspace-grid">
        {workspaceFeatures.map((feature, idx) => (
          <WorkspaceCard
            key={idx}
            title={feature.title}
            description={feature.description}
            path={feature.path}
            icon={feature.icon}
            colorClass={feature.colorClass}
            paper={paper}
          />
        ))}
      </div>
    </div>
  );
};

export default Workspace;
