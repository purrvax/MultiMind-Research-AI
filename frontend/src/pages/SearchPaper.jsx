import React, { useState } from 'react';
import PaperCard from '../components/PaperCard';
import { dummyPapers } from '../data/dummyPapers';
import { Icon, Search, Sliders, Sparkles } from 'lucide-react';
import './SearchPaper.css';

const SearchPaper = ({ setActivePaper }) => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [papers, setPapers] = useState(dummyPapers);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const sampleTags = ["Transformers", "Deep Learning", "Computer Vision", "GANs", "BERT"];

  const generateDynamicPaper = (searchTerm) => {
    const title = searchTerm.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    return {
      id: `dynamic-${Date.now()}`,
      title: `Advances in ${title}: A Survey of Next-Generation Architectures`,
      year: 2025,
      citations: Math.floor(Math.random() * 450) + 12,
      abstract: `This paper presents a comprehensive review of recent developments in ${searchTerm}. We analyze critical performance bottlenecks, propose a unified framework for cross-layer optimization, and discuss key architectural enhancements that improve computational efficiency. Our experiments demonstrate a 15% reduction in training latency alongside improved generalization bounds across standard benchmark suites.`,
      pdf_url: "https://arxiv.org/pdf/2301.00001.pdf",
      introduction: `The rapid evolution of ${searchTerm} has transformed modern computational workflows. In this work, we trace its historical roots, detail the current state-of-the-art implementations, and project key developmental tracks for the next decade.`,
      keyFindings: [
        `Proposes a novel optimization paradigm specifically designed for ${title} workloads.`,
        "Demonstrates a 15% reduction in training latency compared to standard baseline configurations.",
        "Establishes new convergence bounds, proving mathematically that learning rates can scale logarithmically.",
        "Presents an open-source evaluation suite containing 12 distinct edge scenarios for robust testing."
      ],
      methodology: [
        "Layer Fusion: Merges adjacent activation maps to minimize memory transit times between cache lines.",
        "Adaptive Learning Rates: Applies a modified AdamW optimizer where weight decay is coupled to local gradient variances.",
        "Empirical Benchmark Suite: Tests architectures on a variety of diverse multi-modal and sequential environments."
      ],
      contributions: [
        "A novel formulation of loss calculations that penalizes dimensional collapses.",
        "A highly parallelized GPU kernel implementation that speeds up forward propagation by 1.25x.",
        "A comprehensive open-source dataset containing annotated edge runs."
      ],
      notes: {
        introduction: `Introduced to resolve scalability issues when deploying ${searchTerm} on low-resource edge devices.`,
        methodology: "Features nested transformer encoder blocks coupled with attention-free linear projections. Employs post-layer norm and residual shortcuts to prevent gradient dimming.",
        results: "Evaluated on custom synthetic datasets. Outperformed previous baseline models by 3.2% in precision while using 20% fewer parameters.",
        conclusion: `By rethinking sequence modeling, this work provides a framework for scaling ${searchTerm} efficiently across modern hardware accelerators.`
      },
      flashcards: [
        {
          question: `What is the primary contribution of this ${title} paper?`,
          answer: "A novel layer-fusion memory optimization and a modified AdamW optimizer that reduces latency by 15%."
        },
        {
          question: `How does this paper improve training speed for ${title}?`,
          answer: "By utilizing a highly parallelized GPU kernel implementation that accelerates forward propagation by 1.25x."
        },
        {
          question: "What hardware setup was used for the benchmarks?",
          answer: "A cluster of 8 NVIDIA H100 GPUs, executing batch training over 72 hours."
        }
      ],
      qnaPairs: [
        {
          question: `Why is the layer fusion technique crucial for ${title}?`,
          answer: "Traditional networks copy intermediate states back and forth between GPU global memory and fast SRAM cache. By fusing adjacent activation maps, the model retains activations inside local SRAM registers, eliminating cache misses and reducing memory transit latency."
        },
        {
          question: "How does the adaptive decay rate prevent dimensional collapse?",
          answer: "It checks the eigenvalues of the feature covariance matrix in real-time. If it detects a collapse in representation dimensionality, it temporarily scales up the weight decay of orthogonal vectors, forcing the network to diversify its projections."
        }
      ]
    };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      let filtered = dummyPapers.filter(paper => 
        paper.title.toLowerCase().includes(query.toLowerCase()) || 
        paper.abstract.toLowerCase().includes(query.toLowerCase())
      );

      if (filtered.length === 0 && query.trim() !== '') {
        const dynamicPaper = generateDynamicPaper(query.trim());
        filtered = [dynamicPaper];
      } else if (query.trim() === '') {
        filtered = dummyPapers;
        setHasSearched(false);
      }

      setPapers(filtered.slice(0, limit));
      setIsSearching(false);
    }, 600);
  };

  const selectSuggestedTag = (tag) => {
    setQuery(tag);
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const filtered = dummyPapers.filter(paper => 
        paper.title.toLowerCase().includes(tag.toLowerCase()) || 
        paper.abstract.toLowerCase().includes(tag.toLowerCase())
      );
      setPapers(filtered.slice(0, limit));
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="container-wide" style={{ padding: '3rem 1.5rem' }}>
      {/* Page Header */}
      <div className="page-title-section">
        <h1 className="page-title">
          Search Research Papers
        </h1>
        <p className="page-subtitle">
          Search research papers on any topic and discover relevant academic literature.
          Build an AI-powered workspace to explore, analyze, and organize your research.
        </p>
      </div>

      {/* Search Bar & Controls: Premium Horizontal Layout */}
      <div className="search-controls-wrapper glass">
        <form onSubmit={handleSearch}>
          <div className="search-form-row">
            
            {/* Topic Input (70%) */}
            <div className="search-input-box">
              <Search className="search-input-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter research topic (Ex.Transformers, Deep Learning...)"
                className="search-text-input"
              />
            </div>

            {/* Paper Limit Selector (15%) */}
            <div className="search-limit-box">
              <Sliders className="search-input-icon" style={{ width: '1rem', height: '1rem', position: 'static', transform: 'none' }} />
              <div className="limit-inner">
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="limit-select"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Search Button (15%) */}
            <button
              type="submit"
              disabled={isSearching}
              className="search-btn"
            >
              {isSearching ? (
                <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', border: '2px solid var(--text-dark)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }} />
              ) : (
                <>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Tag suggestions */}
          <div className="tags-row">
            <span className="tags-label">Trending:</span>
            {sampleTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSuggestedTag(tag)}
                className="tag-btn"
              >
                {tag}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results / Suggestions Section */}
      <div style={{ width: '100%' }}>
        <div className="results-header-row">
          <h2 className="results-title">
            <span>{hasSearched ? "Search Results" : "Suggested Papers"}</span>
            <span className="results-counter">
              {papers.length}
            </span>
          </h2>
        </div>

        {papers.length > 0 ? (
          <div className="cards-grid">
            {papers.map((paper) => (
              <PaperCard
                key={paper.id || paper.title}
                paper={paper}
                onSelect={setActivePaper}
              />
            ))}
          </div>
        ) : (
          <div className="empty-results-card glass">
            <Search className="empty-results-icon" style={{ width: '3rem', height: '3rem' }} />
            <h3 className="empty-results-title">No papers found</h3>
            <p className="empty-results-desc">
              We couldn't find matches. Try typing a custom topic and we'll generate an AI workspace on the spot!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPaper;
