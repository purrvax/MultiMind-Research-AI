import React, { useState } from 'react';
import { Mail, Lock, User, Brain, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLoginMode && !name.trim())) {
      setError("Please fill in all required fields.");
      return;
    }

    setError('');
    setIsLoading(true);

    const url = isLoginMode 
      ? 'http://localhost:8000/api/auth/login' 
      : 'http://localhost:8000/api/auth/register';

    const payload = isLoginMode 
      ? { email, password } 
      : { email, password, name };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      if (isLoginMode) {
        // Logged in successfully
        localStorage.setItem('multimind_token', data.access_token);
        localStorage.setItem('multimind_user', JSON.stringify(data.user));
        onLoginSuccess(data.access_token, data.user);
      } else {
        // Registered successfully, auto login
        setIsLoginMode(true);
        setEmail(email);
        setPassword(password);
        
        // Trigger login
        const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error("Registration succeeded but failed to auto-login. Please sign in manually.");
        }
        localStorage.setItem('multimind_token', loginData.access_token);
        localStorage.setItem('multimind_user', JSON.stringify(loginData.user));
        onLoginSuccess(loginData.access_token, loginData.user);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <Brain className="login-logo-icon animate-pulse-slow" />
          </div>
          <h1 className="login-title">
            {isLoginMode ? 'Continue Your Research' : 'Start Your Research'}
          </h1>
          <p className="login-subtitle">
            {isLoginMode 
              ? 'Sign in to access your personalized workspace, saved notes, and research history.' 
              : 'Create an account to save your work, track papers, and build your research workspace.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error-alert">
              {error}
            </div>
          )}

          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="login-input"
                  required
                />
                <User className="input-icon" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
              <Mail className="input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
              <Lock className="input-icon" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isLoginMode ? 'Sign In' : 'Register'}</span>
                <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </>
            )}
          </button>
        </form>

        <p className="toggle-mode-text">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleMode} className="toggle-mode-btn">
            {isLoginMode ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <div className="login-glow-line" />
      </div>
    </div>
  );
};

export default Login;
