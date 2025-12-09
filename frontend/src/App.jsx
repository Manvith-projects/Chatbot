import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const API_BASE = "https://sv-royal-backend.onrender.com";

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

const initialMessages = [
  {
    type: 'bot',
    text: 'Welcome to SV Royal Hotel! 👋 How can I assist you today?',
    timestamp: new Date()
  }
];

function App() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = sessionStorage.getItem('svroyal_messages');
      if (stored) {
        return JSON.parse(stored).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
    return initialMessages;
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingData, setBookingData] = useState({
    guest_name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
    room_type: '',
    notes: ''
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem('svroyal_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  }, [messages]);

  const restartConversation = () => {
    if (window.confirm('Are you sure you want to restart the conversation? All messages will be cleared.')) {
      setMessages(initialMessages);
      sessionStorage.removeItem('svroyal_messages');
      setInputValue('');
      setShowQuickActions(false);
      setShowFeedback(null);
    }
  };

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

  const handleSendMessage = async (e, overrideText = null) => {
    if (e?.preventDefault) e.preventDefault();
    
    const outbound = overrideText ?? inputValue;
    if (!outbound.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: outbound,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = outbound;
    if (!overrideText) setInputValue('');
    setIsLoading(true);

    // Check if user is asking to book
    const lowerText = questionText.toLowerCase();
    const bookingKeywords = ['book', 'reservation', 'reserve', 'check-in', 'check in'];
    const roomKeywords = ['room', 'suite', 'accommodation', 'stay', 'night'];
    const exclusionKeywords = ['housekeeping', 'amenities', 'clean', 'service', 'review', 'feedback', 'waitlist', 'cab', 'taxi', 'tour', 'spa', 'restaurant', 'food', 'directions', 'location'];

    const hasBookingKeyword = bookingKeywords.some(k => lowerText.includes(k));
    const hasRoomKeyword = roomKeywords.some(k => lowerText.includes(k));
    const hasExclusion = exclusionKeywords.some(k => lowerText.includes(k));

    let isBookingRequest = false;

    if (hasBookingKeyword) {
      // If explicitly mentioning room/stay, it's likely a room booking even if exclusions are present (e.g. "book room with amenities")
      if (hasRoomKeyword) {
        isBookingRequest = true;
      } else {
        // If saying "book" but not "room", check if it's "book cab" etc.
        if (!hasExclusion) {
          isBookingRequest = true;
        }
      }
    } else if (hasRoomKeyword) {
      // If mentioning "room" without "book", only show if no service keywords (e.g. "need a room" vs "clean room")
      if (!hasExclusion) {
        isBookingRequest = true;
      }
    }

    if (isBookingRequest) {
      setShowBookingForm(true);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'I can help you with that. Please fill out the booking form below.',
        timestamp: new Date()
      }]);
      setIsLoading(false);
      return;
    }

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

  const quickIntents = [
    {
      label: 'Show best rates',
      text: 'What are the best rates and current offers?'
    },
    {
      label: 'Family package',
      text: 'Do you have any family or weekend packages?'
    },
    {
      label: 'Airport pickup',
      text: 'Can you arrange airport pickup and what is the cost?'
    },
    {
      label: 'Corporate stay',
      text: 'Do you offer corporate or long-stay discounts?'
    },
    {
      label: 'Weekend deal',
      text: 'Any weekend or time-based deals available now?'
    },
    {
      label: 'Business package',
      text: 'What business or meeting packages do you have?'
    },
    {
      label: 'Spa / restaurant slots',
      text: 'Help me book a restaurant table or spa slot.'
    },
    {
      label: 'Cab / tour help',
      text: 'Can you arrange cabs or local tours and share an itinerary?'
    },
    {
      label: 'Housekeeping request',
      text: 'I need housekeeping / amenities in my room.'
    },
    {
      label: 'Talk to a human',
      text: 'Connect me to a human agent right now.'
    },
    {
      label: 'Share a review',
      text: 'I want to leave a review for my stay.'
    },
    {
      label: 'Refer a friend',
      text: 'Can I get a referral code for friends or corporates?'
    },
    {
      label: 'Group / wedding quote',
      text: 'Need a quick quote for a group / wedding / event booking.'
    },
    {
      label: 'Waitlist me',
      text: 'If rooms are sold out, please waitlist me for my dates.'
    }
  ];

  const quickLinks = [
    { label: 'Call reception', href: 'tel:+919563776776' },
    { label: 'Get directions', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL_LOCATION.query)}` },
    { label: 'Talk to human', href: 'tel:+919563776776' }
  ];

  const handleLeadSubmit = () => {
    if (!leadName && !leadEmail && !leadPhone) return;

    // Send lead to backend (optional implementation)
    // For now, just acknowledge receipt
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `Thanks ${leadName || 'there'}! We have received your details. Our team will contact you shortly at ${leadPhone || leadEmail}.`,
      timestamp: new Date()
    }]);

    setLeadName('');
    setLeadEmail('');
    setLeadPhone('');
  };

  const handleBookingSubmit = async () => {
    const required = ['guest_name', 'phone', 'check_in', 'check_out', 'guests'];
    const errors = {};
    
    required.forEach(field => {
      if (!bookingData[field]) {
        const fieldLabels = {
          guest_name: 'Guest Name',
          phone: 'Phone Number',
          check_in: 'Check-in Date',
          check_out: 'Check-out Date',
          guests: 'Number of Guests'
        };
        errors[field] = `${fieldLabels[field]} is required`;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setBookingErrors(errors);
      return;
    }
    
    setBookingErrors({});

    try {
      const response = await axios.post(`${API_BASE}/bookings`, {
        ...bookingData,
        source: 'chatbot'
      });

      const booking = response.data.booking;

      setMessages(prev => [...prev, {
        type: 'bot',
        text: `🎉 Booking confirmed! ID: **${booking.booking_id}**\n\nA confirmation email has been sent to ${booking.email}.`,
        timestamp: new Date()
      }]);

      setBookingData({
        guest_name: '',
        email: '',
        phone: '',
        check_in: '',
        check_out: '',
        guests: 1,
        room_type: '',
        notes: ''
      });
      setShowBookingForm(false);
    } catch (error) {
      console.error('Booking error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, booking failed. Please call us at +91 9563 776 776.',
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  const sendQuickIntent = (text) => {
    setInputValue(text);
    setShowQuickActions(false);
  };

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
        <div className="header-actions">
          <button 
            className="restart-btn" 
            onClick={restartConversation}
            title="Restart conversation"
          >
            🔄 Restart
          </button>
          <div className="contact-info">
            <span>📞 +91 9563 776 776</span>
          </div>
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

      <div className={`quick-actions-panel ${showQuickActions ? 'open' : ''}`}>
        <div className="quick-panel-header">
          <div className="quick-head">
            <h3>Grow with SV Royal</h3>
            <p>Instant actions to book, contact, and discover.</p>
          </div>
          <button
            className="quick-close"
            type="button"
            onClick={() => setShowQuickActions(false)}
            aria-label="Close quick actions"
          >
            ×
          </button>
        </div>

        <div className="quick-grid">
          {quickIntents.map((item, idx) => (
            <button
              key={idx}
              className="pill-btn"
              onClick={() => sendQuickIntent(item.text)}
              disabled={isLoading}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="quick-links">
          {quickLinks.map((link, idx) => (
            <a key={idx} className="cta-link" href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>

        <div className="cta-row">
          <button
            className="pill-btn booking-btn"
            onClick={() => setShowBookingForm(true)}
          >
            📅 Book a room
          </button>
          <button
            className="pill-btn"
            onClick={() => sendQuickIntent('Please waitlist me')}
          >
            Waitlist me
          </button>
          <button
            className="pill-btn"
            onClick={() => sendQuickIntent('I want to share a review')}
          >
            Share a review
          </button>
          <button
            className="pill-btn"
            onClick={() => sendQuickIntent('I want to refer a friend')}
          >
            Refer a friend
          </button>
          <button
            className="pill-btn"
            onClick={() => sendQuickIntent('I need a quote for a group event')}
          >
            Group / event quote
          </button>
        </div>

        <div className="lead-box">
          <div className="lead-text">
            <h4>Request a call back</h4>
            <p>Share your contact; we will get back to you.</p>
          </div>
          <div className="lead-form">
            <input
              type="text"
              placeholder="Name"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
            />
            <button className="submit-lead" onClick={handleLeadSubmit}>
              Request Callback
            </button>
          </div>
          <p className="consent-note">By sharing your contact, you agree to be contacted for bookings and offers. No data is stored server-side—draft stays in your email client.</p>
        </div>
      </div>

      {showBookingForm && (
        <div className="booking-modal">
          <div className="booking-modal-content">
            <div className="booking-header">
              <h3>📅 Book Your Stay</h3>
              <button
                className="quick-close"
                type="button"
                onClick={() => setShowBookingForm(false)}
                aria-label="Close booking form"
              >
                ×
              </button>
            </div>
            <div className="booking-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Guest Name *"
                  value={bookingData.guest_name}
                  onChange={(e) => setBookingData({...bookingData, guest_name: e.target.value})}
                  className={bookingErrors.guest_name ? 'error' : ''}
                />
                {bookingErrors.guest_name && <span className="error-msg">{bookingErrors.guest_name}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  className={bookingErrors.phone ? 'error' : ''}
                />
                {bookingErrors.phone && <span className="error-msg">{bookingErrors.phone}</span>}
              </div>

              <div className="form-group">
                <input
                  type="date"
                  placeholder="Check-in *"
                  value={bookingData.check_in}
                  onChange={(e) => setBookingData({...bookingData, check_in: e.target.value})}
                  className={bookingErrors.check_in ? 'error' : ''}
                />
                {bookingErrors.check_in && <span className="error-msg">{bookingErrors.check_in}</span>}
              </div>

              <div className="form-group">
                <input
                  type="date"
                  placeholder="Check-out *"
                  value={bookingData.check_out}
                  onChange={(e) => setBookingData({...bookingData, check_out: e.target.value})}
                  className={bookingErrors.check_out ? 'error' : ''}
                />
                {bookingErrors.check_out && <span className="error-msg">{bookingErrors.check_out}</span>}
              </div>

              <div className="form-group">
                <input
                  type="number"
                  placeholder="Guests *"
                  min="1"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                  className={bookingErrors.guests ? 'error' : ''}
                />
                {bookingErrors.guests && <span className="error-msg">{bookingErrors.guests}</span>}
              </div>

              <div className="form-group">
                <select
                  value={bookingData.room_type}
                  onChange={(e) => setBookingData({...bookingData, room_type: e.target.value})}
                >
                  <option value="">Select Room Type</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Special requests or notes"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <button className="submit-booking" onClick={handleBookingSubmit}>
                Confirm Booking
              </button>
            </div>
            <p className="consent-note">Booking confirmation will be sent via Email.</p>
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
        <button
          className="quick-actions-toggle"
          type="button"
          onClick={() => setShowQuickActions((open) => !open)}
          aria-label={showQuickActions ? 'Hide quick actions' : 'Open quick actions'}
        >
          {showQuickActions ? (
            <span aria-hidden="true">×</span>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>

      <div className="chat-footer">
        <p>
          Powered by AI • Contact: svroyalguntur@gmail.com
          {' • '}
          <a href="#/admin" style={{color: '#667eea', textDecoration: 'none'}}>Admin Dashboard</a>
        </p>
      </div>
    </div>
  );
}

export default App;
