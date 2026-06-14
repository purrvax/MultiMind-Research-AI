import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NoPaperSelected from '../components/NoPaperSelected';
import {ArrowLeft, Send, Cpu, User, Sparkles } from 'lucide-react';
import './QnA.css';

const QnA = ({ activePaper }) => {
  const location = useLocation();
  const paper = location.state?.paper || activePaper;

  // If no paper is selected, render the empty state route protection
  if (!paper) {
    return <NoPaperSelected />;
  }

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  // Initialize chat with AI greeting specific to the paper
  useEffect(() => {
    if (paper) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I'm your MultiMind Research Assistant. I've analyzed "${paper.title}" and can answer questions about its methodology, findings, contributions, experiments, limitations, and technical details.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [paper]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
  e.preventDefault();

  if (!inputValue.trim() || isTyping) return;

  const question = inputValue.trim();

  const userMessage = {
    id: `user-${Date.now()}`,
    sender: "user",
    text: question,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputValue("");
  setIsTyping(true);

  try {
    const response = await fetch(
      "http://localhost:8000/api/qna",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paper_url: paper.pdf_url,
          query: question
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to get answer");
    }
    const aiMessage = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: data.answer,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    console.error("QnA Error:", error);

    const errorMessage = {
      id: `error-${Date.now()}`,
      sender: "ai",
      text: "Sorry, I couldn't answer your question right now.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};

  const presetQuestions = [
    "What is the core methodology?",
    "Tell me about the key findings.",
    "What are the main contributions?"
  ];

  return (
    <div className="container-chat chat-page-wrapper">
      {/* Back Link */}
      <div className="breadcrumb-row" style={{ marginBottom: '1rem' }}>
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
      <div className="asset-header-section" style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Chat: {paper.title}
        </h1>
      </div>

      {/* Chat Area Panel */}
      <div className="chat-panel-container glass">
        
        {/* Messages List Container */}
        <div className="chat-messages-area">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`chat-row ${isAI ? 'ai' : 'user'}`}
              >
                {/* Avatar Icon */}
                <div className="chat-avatar-box">
                  {isAI ? <Cpu style={{ width: '1rem', height: '1rem' }} /> : <User style={{ width: '1rem', height: '1rem' }} />}
                </div>

                {/* Message Bubble */}
                <div className="chat-bubble">
                  <p className="chat-bubble-text">{msg.text}</p>
                  <span className="chat-bubble-timestamp">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-row ai">
              <div className="chat-avatar-box">
                <Cpu style={{ width: '1rem', height: '1rem' }} className="animate-pulse-slow" />
              </div>
              <div className="chat-bubble">
                <div className="typing-indicators-row">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Preset suggestions */}
        <div className="chat-suggestions-bar">
          <span className="suggestions-label">
            <Sparkles style={{ width: '0.75rem', height: '0.75rem', color: 'var(--purple)' }} />
            <span>Suggested:</span>
          </span>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputValue(q);
              }}
              className="chat-suggestion-btn"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form Box */}
        <div className="chat-input-bar">
          <form onSubmit={handleSend} className="chat-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask something about "${paper.title}"...`}
              className="chat-text-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="chat-send-btn"
            >
              <Send style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QnA;
