import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import './ChatInterface.css';

const SUGGESTIONS = [
  {
    title: 'Compare Perspectives',
    text: 'What are the pros and cons of remote work vs. office work?',
    prompt: 'Compare the pros and cons of remote work versus working from an office. Provide a balanced analysis.'
  },
  {
    title: 'Creative Writing',
    text: 'Write a short sci-fi story about a robot who learns to paint.',
    prompt: 'Write a short science fiction story about a robot who discovers a passion for painting and what happens when it tries to express emotions.'
  },
  {
    title: 'Code Review',
    text: 'Explain the difference between React Context and Redux.',
    prompt: 'Explain the key differences between React Context API and Redux for state management, and when to use each.'
  },
  {
    title: 'Complex Analysis',
    text: 'Analyze the economic impact of renewable energy transition.',
    prompt: 'Analyze the potential economic impacts of a global transition to renewable energy sources over the next 20 years.'
  }
];

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (prompt) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-interface">
        <div className="empty-state">
          <h2>Welcome to LLM Council</h2>
          <p>
            Consult a council of AI models to get comprehensive, ranked, and synthesized answers.
            Start a new conversation or choose a topic below.
          </p>
          <div className="suggestions-grid">
            {SUGGESTIONS.map((s, i) => (
              <div 
                key={i} 
                className="suggestion-card"
                onClick={() => window.dispatchEvent(new CustomEvent('new-conversation-with-prompt', { detail: s.prompt }))}
              >
                <div className="suggestion-title">{s.title}</div>
                <div className="suggestion-text">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <h2>Start a conversation</h2>
            <p>Ask a question to consult the LLM Council</p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <div 
                  key={i} 
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(s.prompt)}
                >
                  <div className="suggestion-title">{s.title}</div>
                  <div className="suggestion-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          conversation.messages.map((msg, index) => (
            <div key={index} className="message-group">
              {msg.role === 'user' ? (
                <div className="user-message">
                  <div className="message-label">You</div>
                  <div className="message-content">
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="assistant-message">
                  <div className="message-label">LLM Council</div>

                  {/* Stage 1 */}
                  {msg.loading?.stage1 && (
                    <div className="stage-loading">
                      <div className="spinner"></div>
                      <span>Running Stage 1: Collecting individual responses...</span>
                    </div>
                  )}
                  {msg.stage1 && <Stage1 responses={msg.stage1} />}

                  {/* Stage 2 */}
                  {msg.loading?.stage2 && (
                    <div className="stage-loading">
                      <div className="spinner"></div>
                      <span>Running Stage 2: Peer rankings...</span>
                    </div>
                  )}
                  {msg.stage2 && (
                    <Stage2
                      rankings={msg.stage2}
                      labelToModel={msg.metadata?.label_to_model}
                      aggregateRankings={msg.metadata?.aggregate_rankings}
                    />
                  )}

                  {/* Stage 3 */}
                  {msg.loading?.stage3 && (
                    <div className="stage-loading">
                      <div className="spinner"></div>
                      <span>Running Stage 3: Final synthesis...</span>
                    </div>
                  )}
                  {msg.stage3 && <Stage3 finalResponse={msg.stage3} />}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Consulting the council...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {(conversation.messages.length > 0 || isLoading) && (
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            className="message-input"
            placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={3}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </form>
      )}
      
      {/* Show input form even in empty state if a conversation is selected */}
      {conversation.messages.length === 0 && !isLoading && (
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            className="message-input"
            placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={3}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
