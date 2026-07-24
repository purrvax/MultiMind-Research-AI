import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Brain, Search, LogOut, FileText } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ activePaper, currentUser, onLogout }) => {
  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="logo-icon-wrapper">
            <div className="logo-icon-inner">
              <Brain className="logo-icon" style={{ width: '1.125rem', height: '1.125rem', color: 'var(--cyan)' }} />
            </div>
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
            MultiMind <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Research AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/search-paper"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            <Search style={{ width: '1rem', height: '1rem' }} />
            <span>Search Papers</span>
          </NavLink>

          {activePaper && (
            <NavLink
              to="/workspace"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <FileText style={{ width: '1rem', height: '1rem' }} />
              <span>Workspace</span>
            </NavLink>
          )}

          {currentUser && (
            <div className="user-profile-section">
              <span className="user-greeting">
                Hello, <span className="user-name">{currentUser.name || currentUser.email}</span>
              </span>
              <button onClick={onLogout} className="logout-btn" title="Sign Out">
                <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
