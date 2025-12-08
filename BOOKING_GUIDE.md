# 📅 Booking & Analytics Guide

## Overview

The SV Royal chatbot now includes a complete booking management system and analytics dashboard. Here's how to use these features:

---

## 🏨 For Guests - Making a Booking

### Via Chat Interface

1. **Open Quick Actions Menu**
   - Click the menu icon (☰) next to the chat input
   - Click "📅 Book a room" button

2. **Fill Booking Form**
   - **Guest Name** * (required)
   - **Email** (optional but recommended)
   - **Phone** * (required)
   - **Check-in Date** * (required)
   - **Check-out Date** * (required)
   - **Number of Guests** * (required)
   - **Room Type** (Standard, Deluxe, Suite)
   - **Special Requests** (optional notes)

3. **Submit Booking**
   - Click "Confirm Booking"
   - System will:
     - Create booking in database
     - Open WhatsApp with confirmation message
     - Open email client with confirmation details
     - Display booking ID in chat

### Booking Confirmation

After submission, you'll receive:
- **WhatsApp Message**: Pre-filled confirmation to your phone
- **Email Draft**: Detailed booking confirmation
- **Booking ID**: Reference number for tracking

---

## 🎯 For Hotel Staff - Managing Bookings

### Access Admin Dashboard

Navigate to: `https://your-domain.com/admin`

Or click "Admin Dashboard" link in the chatbot footer.

### Dashboard Overview

The admin panel shows:

1. **Analytics Cards**
   - Total Feedback
   - Active Users
   - Total Bookings
   - Average Rating

2. **Booking Status Summary**
   - Pending bookings
   - Confirmed bookings
   - Cancelled bookings

3. **Recent Bookings List**
   - Guest details (name, phone, email)
   - Check-in/out dates
   - Number of guests
   - Room type
   - Special notes
   - Current status

4. **Recent Feedback**
   - Latest user ratings
   - Questions asked
   - Timestamps

### Managing Bookings

**View Bookings:**
- Use status filter dropdown to view:
  - All bookings
  - Pending only
  - Confirmed only
  - Cancelled only

**Update Booking Status:**
- For **Pending** bookings:
  - Click "✓ Confirm" to confirm
  - Click "✗ Cancel" to cancel
- For **Confirmed** bookings:
  - Click "✗ Cancel" to cancel

**Booking Details:**
Each booking shows:
- Guest name and contact info
- Check-in/check-out dates
- Number of guests
- Room type preference
- Special requests/notes
- Current status badge

---

## 📊 Analytics Features

### Available Metrics

1. **Engagement Metrics**
   - Total chat interactions
   - Active user count
   - Average satisfaction rating

2. **Booking Metrics**
   - Total bookings created
   - Status breakdown (pending/confirmed/cancelled)
   - Booking source (chatbot vs. other channels)

3. **Feedback Analytics**
   - Recent user ratings
   - Satisfaction trends
   - Question topics

### Using Analytics for Business Decisions

- **Low ratings?** Review recent feedback to identify issues
- **High pending bookings?** Reach out to guests for confirmation
- **Peak booking times?** Plan staff accordingly
- **Common questions?** Update knowledge base

---

## 🔌 API Integration

### Booking API Endpoints

**Create Booking:**
```bash
POST /bookings
Content-Type: application/json

{
  "guest_name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "check_in": "2025-12-15",
  "check_out": "2025-12-18",
  "guests": 2,
  "room_type": "Deluxe",
  "notes": "Late check-in expected"
}
```

**List Bookings:**
```bash
GET /bookings?status=pending
```

**Update Booking:**
```bash
PATCH /bookings/:booking_id
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Room upgraded"
}
```

**Get Analytics:**
```bash
GET /analytics
```

---

## 🔔 Notifications

### WhatsApp Confirmation
- Automatically opens WhatsApp with pre-filled message
- Includes booking ID and guest details
- Sends to guest's phone number

### Email Confirmation
- Opens default email client
- Pre-filled subject and body
- Includes complete booking details
- Professional formatting

---

## 💡 Best Practices

### For Guests
1. Provide accurate phone number for WhatsApp confirmations
2. Include email for detailed confirmation
3. Mention special requests in notes field
4. Save your booking ID for reference

### For Hotel Staff
1. Check admin dashboard daily for new bookings
2. Confirm pending bookings within 24 hours
3. Review feedback regularly to improve service
4. Update booking status promptly
5. Use analytics to track trends

---

## 🛠️ Troubleshooting

### Booking Form Issues
- **Form won't submit:** Ensure all required fields (*) are filled
- **WhatsApp not opening:** Check if WhatsApp is installed
- **Email not working:** Verify default email client is configured

### Admin Dashboard Issues
- **Data not loading:** Check internet connection and backend status
- **Status update fails:** Verify booking ID and try again
- **Analytics missing:** Ensure bookings/feedback exist in database

---

## 🔒 Data & Privacy

- **Booking data** is stored securely in MongoDB Atlas
- **No credit card** information is collected
- **Email/WhatsApp confirmations** are drafted locally (not stored on server)
- **Phone numbers** are only used for WhatsApp confirmations
- **Admin access** should be password-protected (implement authentication)

---

## 📞 Support

For technical issues:
- **Email:** svroyalguntur@gmail.com
- **Phone:** +91 9563 776 776

For feature requests:
- Create an issue on GitHub
- Contact the development team

---

**Last Updated:** December 8, 2025
