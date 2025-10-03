# CRM Trends Analytics System

A separate analytics and insights system that integrates with the main POS + Inventory system for advanced customer relationship management, trend analysis, and demand forecasting.

## 🏗️ Architecture

This system runs as **Site 2** in the two-site architecture:
- **Site 1 (Core)**: POS + Inventory (port 3000) - Fast, stable operations
- **Site 2 (Analytics)**: CRM + Trends + Calendar (port 3001) - Advanced insights

## 🚀 Features

### Customer Analytics
- Customer segmentation (new, regular, VIP)
- Purchase history tracking
- Preferred products analysis
- Purpose tagging for customer insights

### Sales Trends
- Daily revenue and sales count tracking
- 30-day trend visualization
- Product popularity scoring
- Trend direction analysis

### Calendar Integration
- Festival and event tracking
- Demand impact assessment
- Automated forecasting adjustments

### Real-time Integration
- API-based data sync from main POS system
- Customer insights available to POS operators
- Scheduled data synchronization

## 📊 Dashboard

Access the analytics dashboard at: `http://localhost:3001`

Features:
- Customer statistics overview
- Interactive sales trend charts
- Top products by popularity
- Upcoming calendar events with demand impact

## 🔗 API Integration

### Data Sync Endpoints
```javascript
// Sync customers from main system
POST /api/sync/customers
{
  "customers": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com"
    }
  ]
}

// Sync sales data
POST /api/sync/sales
{
  "sales": [
    {
      "id": 1001,
      "customer_id": 1,
      "total_amount": 150.00,
      "created_at": "2025-09-27T10:30:00Z"
    }
  ]
}
```

### Analytics Endpoints
```javascript
// Get customer insights for POS
GET /api/customers/123/insights

// Get dashboard data
GET /api/analytics/dashboard

// Get calendar events
GET /api/calendar/events?days=30

// Add calendar event
POST /api/calendar/events
{
  "event_type": "festival",
  "name": "Diwali",
  "date": "2025-11-12",
  "impact_level": "high",
  "expected_demand_multiplier": 1.5
}
```

## 🗄️ Database Schema

### Customers Table
- Customer profiles with purchase history
- Purpose tags and preferred products
- Segmentation data

### Sales Analytics Table
- Historical sales data for trend analysis
- Customer purchase patterns

### Product Trends Table
- Product performance metrics
- Popularity scoring and trend analysis

### Calendar Events Table
- Festivals, promotions, and events
- Demand impact levels

## 🔄 Data Flow

1. **POS Sale** → Immediate inventory update in main system
2. **Background Sync** → Customer and sales data sent to CRM system
3. **Analytics Processing** → Trends calculated, customer segments updated
4. **POS Integration** → Customer insights available during checkout
5. **Management Dashboard** → Rich analytics for business decisions

## 🛠️ Setup & Installation

1. **Install Dependencies**
   ```bash
   cd crm-trends-system
   npm install
   ```

2. **Create Database Directory**
   ```bash
   mkdir db
   ```

3. **Start the Server**
   ```bash
   node server.js
   ```

4. **Access Dashboard**
   - Analytics Dashboard: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

## 🔗 Integration with Main System

The main POS system (port 3000) automatically syncs data to this CRM system:

- Customer data syncs every login/session
- Sales data syncs daily or on-demand
- Customer insights pulled during POS operations

## 📈 Usage Examples

### Adding Calendar Events
```javascript
fetch('/api/calendar/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'festival',
    name: 'Diwali Festival',
    date: '2025-11-12',
    impact_level: 'high',
    expected_demand_multiplier: 1.8,
    notes: 'Major shopping festival'
  })
});
```

### Getting Customer Insights
```javascript
// From POS system during checkout
fetch('http://localhost:3001/api/customers/123/insights')
  .then(res => res.json())
  .then(data => {
    console.log('Customer prefers:', data.preferredProducts);
    console.log('Last purchase:', data.lastPurchase);
  });
```

## 🎯 Benefits

1. **Separation of Concerns**: Core operations remain fast and stable
2. **Scalable Analytics**: Analytics can grow independently
3. **Rich Insights**: Advanced customer segmentation and forecasting
4. **Real-time Integration**: POS operators get customer insights instantly
5. **Flexible Development**: CRM features can be tested without affecting operations

## 🚀 Next Steps

- Implement advanced forecasting algorithms
- Add customer purpose tagging automation
- Integrate with external calendar APIs
- Build mobile dashboard for management
- Add automated reorder recommendations

## 📞 Support

This system integrates with the main POS + Inventory system for comprehensive business management.
