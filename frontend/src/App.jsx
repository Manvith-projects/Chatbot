import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const API_BASE = 'https://sv-royal-backend.onrender.com';

// Hotel location
const HOTEL_LOCATION = {
  name: 'SV Royal Hotel',
  query: 'SV Royal Hotel Guntur Andhra Pradesh'
};

// Tourist attractions with search queries
const ATTRACTIONS = {
  'Uppalapadu Nature Conservation': 'Uppalapadu Birds Sanctuary Guntur',
  'Uppalapadu': 'Uppalapadu Birds Sanctuary Guntur',
  'Birds Lake': 'Uppalapadu Birds Sanctuary Guntur',
  'Haailand': 'Haailand Amusement Park Guntur',
  'Haailand Amusement': 'Haailand Amusement Park Guntur',
  'Theme Park': 'Haailand Amusement Park Guntur',
  'Mangalagiri': 'Mangalagiri Lakshmi Narasimha Swamy Temple',
  'Mangalagiri Temple': 'Mangalagiri Lakshmi Narasimha Swamy Temple',
  'Lakshmi Narasimha': 'Mangalagiri Lakshmi Narasimha Swamy Temple',
  'Kondaveedu': 'Kondaveedu Fort Guntur',
  'Krishna Barrage': 'Krishna Barrage Vijayawada',
  'Undavalli Caves': 'Undavalli Caves Vijayawada',
  'Undavalli': 'Undavalli Caves Vijayawada',
  'Amaravati': 'Amaravati Stupa Andhra Pradesh',
  'Amaravati Stupa': 'Amaravati Stupa Andhra Pradesh',
  'Suryalanka Beach': 'Suryalanka Beach Bapatla',
  'Suryalanka': 'Suryalanka Beach Bapatla',
  'Kotappakonda': 'Kotappakonda Temple Guntur',
  'Nagarjuna Sagar': 'Nagarjuna Sagar Dam',
  'Nagarjuna Sagar Dam': 'Nagarjuna Sagar Dam'
};

function App() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Welcome to SV Royal Hotel! 👋 How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectLocations = (text, question) => {
    const locations = [];
    const lowerText = text.toLowerCase();
    const lowerQuestion = question.toLowerCase();
    
    // Check if user is asking about location or directions
    const isLocationQuery = /location|where|address|direction|map|how to (get|reach)|nearby|tourist|attraction/i.test(lowerQuestion);
    
    if (isLocationQuery) {
      // Always add hotel location for location queries
      locations.push({
        name: HOTEL_LOCATION.name,
        query: HOTEL_LOCATION.query
      });
    }
    
    // Check for tourist attractions in the response
    Object.keys(ATTRACTIONS).forEach(attraction => {
      if (lowerText.includes(attraction.toLowerCase())) {
        // Avoid duplicates
        if (!locations.find(loc => loc.query === ATTRACTIONS[attraction])) {
          locations.push({
            name: attraction,
            query: ATTRACTIONS[attraction]
          });
        }
      }
    });
    
    return locations.length > 0 ? locations : null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/ask`, {
        question: questionText,
        user_id: userId
      });

      const locations = detectLocations(response.data.answer, questionText);

      const botMessage = {
        type: 'bot',
        text: response.data.answer,
        timestamp: new Date(),
        feedbackQuestion: response.data.feedback_question,
        originalQuestion: questionText,
        messageId: Date.now(),
        locations: locations
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, rating, feedbackText = '') => {
    const message = messages.find(m => m.messageId === messageId);
    
    if (!message) return;

    try {
      await axios.post(`${API_BASE}/feedback`, {
        user_id: userId,
        question: message.originalQuestion,
        answer: message.text,
        rating: rating,
        feedback_text: feedbackText,
        feedback_type: message.feedbackQuestion?.type || 'csat_short'
      });

      setMessages(prev => prev.map(m => 
        m.messageId === messageId 
          ? { ...m, feedbackGiven: true, userRating: rating }
          : m
      ));
      
      setShowFeedback(null);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const suggestedQuestions = [
    "What are your room rates?",
    "Do you have a restaurant?",
    "What amenities do you offer?",
    "How can I make a reservation?"
  ];

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="hotel-logo">
          <span className="logo-icon">🏨</span>
          <div>
            <h1>SV Royal Hotel</h1>
            <p>Chat Assistant</p>
          </div>
        </div>
        <div className="contact-info">
          <span>📞 +91 9563 776 776</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.type === 'bot' ? (
                <div className="markdown-content">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                <p>{message.text}</p>
              )}
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {message.type === 'bot' && !message.isError && message.feedbackQuestion && !message.feedbackGiven && (
                <div className="feedback-section">
                  <p className="feedback-question">{message.feedbackQuestion.text}</p>
                  <div className="feedback-buttons">
                    <button
                      className="feedback-btn positive"
                      onClick={() => handleFeedback(message.messageId, 5)}
                    >
                      👍 Yes
                    </button>
                    <button
                      className="feedback-btn negative"
                      onClick={() => setShowFeedback(message.messageId)}
                    >
                      👎 No
                    </button>
                  </div>
                  {showFeedback === message.messageId && (
                    <div className="feedback-form">
                      <textarea
                        placeholder="How can we improve?"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleFeedback(message.messageId, 1, e.target.value);
                          }
                        }}
                      />
                      <button
                        className="submit-feedback"
                        onClick={(e) => {
                          const textarea = e.target.previousSibling;
                          handleFeedback(message.messageId, 1, textarea.value);
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {message.feedbackGiven && (
                <div className="feedback-thanks">
                  Thank you for your feedback! 🙏
                </div>
              )}

              {message.locations && message.locations.length > 0 && (
                <div className="location-maps">
                  <div className="map-header">📍 View on Map:</div>
                  {message.locations.map((location, idx) => (
                    <a
                      key={idx}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      <span className="map-icon">🗺️</span>
                      <span className="map-name">{location.name}</span>
                      <span className="map-arrow">→</span>
                    </a>
                  ))}
                  {message.locations.length > 1 && (
                    <a
                      href={`https://www.google.com/maps/dir/${encodeURIComponent(HOTEL_LOCATION.query)}/${message.locations.slice(1).map(l => encodeURIComponent(l.query)).join('/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link directions-link"
                    >
                      <span className="map-icon">🧭</span>
                      <span className="map-name">Get Directions from Hotel</span>
                      <span className="map-arrow">→</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="suggested-questions">
          <p>Try asking:</p>
          <div className="suggestions">
            {suggestedQuestions.map((question, index) => (
              <button 
                key={index}
                className="suggestion-btn"
                onClick={() => setInputValue(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything about SV Royal Hotel..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>

      <div className="chat-footer">
        <p>Powered by AI • Contact: svroyalguntur@gmail.com</p>
      </div>
    </div>
  );
}

export default App;
