import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingBackground from './components/FloatingBackground';

// Pages
import Home from './pages/Home';
import SearchPaper from './pages/SearchPaper';
import Workspace from './pages/Workspace';
import Workspace_Building from './pages/Workspace_Building';
import Summary from './pages/Summary';
import Notes from './pages/Notes';
import Flashcards from './pages/Flashcards';
import QnA from './pages/QnA';''

function App() {
  const [activePaper, setActivePaper] = useState(null);

  // Sync state with localStorage to persist selected paper across refreshes
  useEffect(() => {
    const savedPaper = localStorage.getItem('multimind_active_paper');
    if (savedPaper) {
      try {
        setActivePaper(JSON.parse(savedPaper));
      } catch (e) {
        console.error("Failed to parse saved paper", e);
      }
    }
  }, []);

  const handleSetActivePaper = (paper) => {
    setActivePaper(paper);
    if (paper) {
      localStorage.setItem('multimind_active_paper', JSON.stringify(paper));
    } else {
      localStorage.removeItem('multimind_active_paper');
    }
  };

  return (
    <Router>
      <div className="relative min-h-screen text-gray-200 flex flex-col antialiased">
        {/* Glowing Background Overlay and Blobs */}
        <FloatingBackground />

        {/* Global Navigation Bar */}
        <Navbar activePaper={activePaper} />

        {/* Main Application Screens */}
        <main className="flex-1 w-full flex flex-col justify-start">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/search-paper" 
              element={<SearchPaper setActivePaper={handleSetActivePaper} />} 
            />
            <Route
              path="/building-workspace"
              element ={<Workspace_Building setActivePaper ={handleSetActivePaper}/>} 
              />
            <Route 
              path="/workspace" 
              element={<Workspace activePaper={activePaper} setActivePaper={handleSetActivePaper} />} 
            />
            <Route 
              path="/summary" 
              element={<Summary activePaper={activePaper} />} 
            />
            <Route 
              path="/notes" 
              element={<Notes activePaper={activePaper} />} 
            />
            <Route 
              path="/flashcards" 
              element={<Flashcards activePaper={activePaper} />} 
            />
            <Route 
              path="/qna" 
              element={<QnA activePaper={activePaper} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
