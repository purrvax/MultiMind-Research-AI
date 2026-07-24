import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingBackground from './components/FloatingBackground';

// Pages
import Home from './pages/Home';
import SearchPaper from './pages/SearchPaper';
import Workspace from './pages/Workspace';
import Workspace_Building from './pages/Workspace_building';
import Summary from './pages/Summary';
import Notes from './pages/Notes';
import Flashcards from './pages/Flashcards';
import QnA from './pages/QnA';
import Login from './pages/Login';

function App() {
  const [activePaper, setActivePaper] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Sync and verify user token on app mount
  useEffect(() => {
    const savedToken = localStorage.getItem('multimind_token');
    const savedUser = localStorage.getItem('multimind_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }

      fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Session expired");
        }
        return res.json();
      })
      .then(user => {
        setCurrentUser(user);
        localStorage.setItem('multimind_user', JSON.stringify(user));
      })
      .catch(err => {
        console.error("Session verification failed:", err);
        // Clear expired session
        localStorage.removeItem('multimind_token');
        localStorage.removeItem('multimind_user');
        localStorage.removeItem('multimind_active_paper');
        setCurrentUser(null);
        setToken(null);
        setActivePaper(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
    } else {
      setAuthLoading(false);
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

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('multimind_token');
    localStorage.removeItem('multimind_user');
    localStorage.removeItem('multimind_active_paper');
    setCurrentUser(null);
    setToken(null);
    setActivePaper(null);
  };

  if (authLoading) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#03030d',
          color: '#f3f4f6',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            Loading MultiMind Research AI...
          </p>
        </div>
      </div>
    );
  }

  // Render Login page if not authenticated
  if (!currentUser) {
    return (
      <Router>
        <div className="relative min-h-screen text-gray-200 flex flex-col antialiased bg-[#03030d]">
          <FloatingBackground />
          <main className="flex-1 w-full flex flex-col justify-center items-center">
            <Routes>
              <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="relative min-h-screen text-gray-200 flex flex-col antialiased">
        {/* Glowing Background Overlay and Blobs */}
        <FloatingBackground />

        {/* Global Navigation Bar */}
        <Navbar 
          activePaper={activePaper} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />

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
              element={<Workspace_Building setActivePaper={handleSetActivePaper} />} 
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
