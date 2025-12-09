import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const API_BASE ='https://sv-royal-backend.onrender.com';

function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE}/analytics`),
        axios.get(`${API_BASE}/bookings${statusFilter ? `?status=${statusFilter}` : ''}`)
      ]);
      setAnalytics(analyticsRes.data);
      setBookings(bookingsRes.data.bookings);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    setProcessingBookingId(bookingId);
    try {
      await axios.patch(`${API_BASE}/bookings/${bookingId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setProcessingBookingId(null);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-header">
          <h2>🏨 SV Royal</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h4>DASHBOARD</h4>
            <div className="nav-item active">📊 Overview</div>
          </div>
          <div className="nav-section">
            <h4>QUICK LINKS</h4>
            <div className="nav-item" onClick={() => {
              document.querySelector('.bookings-management')?.scrollIntoView({ behavior: 'smooth' });
            }}>📅 Bookings</div>
            <div className="nav-item" onClick={() => {
              document.querySelector('.feedback-management')?.scrollIntoView({ behavior: 'smooth' });
            }}>💬 Feedback</div>
          </div>
        </nav>
      </aside>
      {isMobile && sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="top-bar-title">
            <h1>Dashboard</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="top-bar-right">
            <div className="user-profile">👤 Admin</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Key Metrics */}
          {analytics && (
            <section className="metrics-section">
              <h2>Key Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">📅</span>
                    <span className="metric-title">Total Bookings</span>
                  </div>
                  <div className="metric-value">{analytics.totals.bookings}</div>
                  <div className="metric-footer">
                    <span className="trend up">↑ +12% this month</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">⭐</span>
                    <span className="metric-title">Avg Rating</span>
                  </div>
                  <div className="metric-value">
                    {analytics.totals.avg_rating ? analytics.totals.avg_rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="metric-footer">
                    <span className="trend up">↑ From {(analytics.totals.avg_rating - 0.3).toFixed(1)}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">👥</span>
                    <span className="metric-title">Active Users</span>
                  </div>
                  <div className="metric-value">{analytics.totals.users}</div>
                  <div className="metric-footer">
                    <span className="trend up">↑ +8% this week</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-icon">💬</span>
                    <span className="metric-title">Feedback</span>
                  </div>
                  <div className="metric-value">{analytics.totals.feedback}</div>
                  <div className="metric-footer">
                    <span className="trend up">↑ +5% this week</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Status Overview */}
          {analytics && analytics.booking_status && (
            <section className="status-section">
              <div className="section-header">
                <h2>Booking Status Overview</h2>
              </div>
              <div className="status-overview">
                <div className="status-item pending">
                  <div className="status-number">{analytics.booking_status.pending || 0}</div>
                  <div className="status-name">Pending</div>
                  <div className="status-percent">
                    {Math.round((analytics.booking_status.pending / analytics.totals.bookings) * 100) || 0}%
                  </div>
                </div>
                <div className="status-item confirmed">
                  <div className="status-number">{analytics.booking_status.confirmed || 0}</div>
                  <div className="status-name">Confirmed</div>
                  <div className="status-percent">
                    {Math.round((analytics.booking_status.confirmed / analytics.totals.bookings) * 100) || 0}%
                  </div>
                </div>
                <div className="status-item cancelled">
                  <div className="status-number">{analytics.booking_status.cancelled || 0}</div>
                  <div className="status-name">Cancelled</div>
                  <div className="status-percent">
                    {Math.round((analytics.booking_status.cancelled / analytics.totals.bookings) * 100) || 0}%
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Bookings Management */}
          <section className="bookings-management">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter-dropdown"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {bookings.length === 0 ? (
              <p className="empty-state">No bookings found. Create a new booking to get started.</p>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-title">
                        <h3>{booking.guest_name}</h3>
                        <span className={`badge badge-${booking.status}`}>{booking.status.toUpperCase()}</span>
                      </div>
                      <div className="booking-id">ID: {booking.booking_id.substring(0, 8)}...</div>
                    </div>
                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">📧 Email</span>
                        <span className="detail-value">{booking.email || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📞 Phone</span>
                        <span className="detail-value">{booking.phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📅 Check-in</span>
                        <span className="detail-value">{booking.check_in}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📅 Check-out</span>
                        <span className="detail-value">{booking.check_out}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">👥 Guests</span>
                        <span className="detail-value">{booking.guests}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🛏️ Room Type</span>
                        <span className="detail-value">{booking.room_type || 'Standard'}</span>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="booking-notes">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}
                    <div className="booking-footer">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            disabled={processingBookingId === booking.booking_id}
                            onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                          >
                            {processingBookingId === booking.booking_id ? 'Processing...' : '✓ Confirm'}
                          </button>
                          <button
                            className="btn btn-danger"
                            disabled={processingBookingId === booking.booking_id}
                            onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                          >
                            {processingBookingId === booking.booking_id ? 'Processing...' : '✗ Cancel'}
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          className="btn btn-danger"
                          disabled={processingBookingId === booking.booking_id}
                          onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                        >
                          {processingBookingId === booking.booking_id ? 'Processing...' : '✗ Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Feedback */}
          {analytics && analytics.recent_feedback && analytics.recent_feedback.length > 0 && (
            <section className="feedback-management">
              <div className="section-header">
                <h2>Recent Feedback & Ratings</h2>
              </div>
              <div className="feedback-cards">
                {analytics.recent_feedback.slice(0, 6).map((fb) => (
                  <div key={fb.id} className="feedback-card">
                    <div className="feedback-header">
                      <div className="feedback-rating-star">
                        {'⭐'.repeat(fb.rating)}
                        <span className="rating-text">{fb.rating}/5</span>
                      </div>
                    </div>
                    <div className="feedback-question">{fb.question}</div>
                    <div className="feedback-time">
                      {new Date(fb.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Admin;
