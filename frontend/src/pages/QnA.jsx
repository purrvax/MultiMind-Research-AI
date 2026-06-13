import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NoPaperSelected from '../components/NoPaperSelected';
import { MessageSquare, ArrowLeft, Send, Cpu, User, Sparkles } from 'lucide-react';
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
          text: `Hello! I am MultiMind Research AI, optimized to discuss "${paper.title}". Feel free to ask me any question about this research.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [paper]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    setInputValue('');

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // AI Response Generation Logic
    setTimeout(() => {
      let replyText = "";
      const lowerInput = userMessageText.toLowerCase();

      // 1. Try to find match in Q&A Pairs
      const matchedQna = paper.qnaPairs?.find(qna => 
        lowerInput.includes(qna.question.toLowerCase()) || 
        qna.question.toLowerCase().split(' ').filter(w => w.length > 4).some(w => lowerInput.includes(w))
      );

      // 2. Try to find match in Flashcards
      const matchedFlash = paper.flashcards?.find(fc => 
        lowerInput.includes(fc.question.toLowerCase()) ||
        fc.question.toLowerCase().split(' ').filter(w => w.length > 4).some(w => lowerInput.includes(w))
      );

      if (matchedQna) {
        replyText = matchedQna.answer;
      } else if (matchedFlash) {
        replyText = matchedFlash.answer;
      } else if (lowerInput.includes('abstract') || lowerInput.includes('summary') || lowerInput.includes('overview')) {
        replyText = `Here is the summary of the paper's abstract: ${paper.abstract}`;
      } else if (lowerInput.includes('year') || lowerInput.includes('published') || lowerInput.includes('date')) {
        replyText = `"${paper.title}" was published in the year ${paper.year}.`;
      } else if (lowerInput.includes('citation') || lowerInput.includes('citations') || lowerInput.includes('cited')) {
        replyText = `According to our index, this paper has been cited approximately ${paper.citations.toLocaleString()} times in scientific literature.`;
      } else if (lowerInput.includes('methodology') || lowerInput.includes('method') || lowerInput.includes('how did they')) {
        replyText = `Based on the paper's methodology section, the authors utilized the following approach: \n\n${paper.methodology?.map(m => `• ${m}`).join('\n') || paper.notes?.methodology}`;
      } else if (lowerInput.includes('contribution') || lowerInput.includes('novelty') || lowerInput.includes('impact')) {
        replyText = `The main scientific contributions of this research are: \n\n${paper.contributions?.map(c => `• ${c}`).join('\n') || "Establishing new theoretical frameworks and testing them extensively."}`;
      } else {
        // Fallback dynamic response
        replyText = `Regarding your query about "${userMessageText}" in "${paper.title}": The paper primarily addresses this through its proposed optimization paradigms. More specifically, the authors highlight that by reorganizing layer dependencies and utilizing their methodology (which achieved ${paper.citations.toLocaleString()} citations), they mitigate standard bottlenecks. Let me know if you would like me to detail the findings, methodology, or results sections!`;
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200); // Realistic AI thinking delay
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
