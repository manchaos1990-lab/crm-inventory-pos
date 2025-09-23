# SubhaLakshmi Creation - CRM, POS & Inventory Management System

A complete business management solution with web interface and mobile app support.

## 🚀 Features

- **CRM (Customer Relationship Management)**: Customer database, contact management
- **POS (Point of Sale)**: Sales processing, receipt generation, payment tracking
- **Inventory Management**: Stock tracking, low stock alerts, product catalog
- **Web Interface**: Full-featured web application
- **Mobile App Support**: API endpoints for React Native mobile apps
- **Offline Sync**: Data synchronization capabilities
- **User Management**: Admin and user roles, approval system

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (local), PostgreSQL (cloud)
- **Frontend**: HTML, CSS, JavaScript
- **Mobile**: React Native (separate project)
- **Deployment**: Render, Railway, or any Node.js hosting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-inventory-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Web interface: http://localhost:3000
   - API endpoints: http://localhost:3000/api/*

## 🌐 Deployment to Render (Free)

### Step 1: Prepare Your Code
1. Push your code to GitHub
2. Ensure you have `package.json`, `server.js`, and `.env` files

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account

### Step 3: Create New Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: subha-lakshmi-crm
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 4: Add Environment Variables
In Render dashboard, add these environment variables:
```
PORT=10000
NODE_ENV=production
DB_TYPE=sqlite
DB_PATH=./db/app.db
SESSION_SECRET=your-secure-session-secret
CORS_ORIGINS=https://your-app-name.onrender.com
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your app will be live at: `https://your-app-name.onrender.com`

## 📊 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration
- `GET /logout` - User logout

### CRM
- `GET /customers/all` - Get all customers
- `POST /customers/add` - Add new customer

### Inventory
- `GET /inventory/all` - Get all products
- `POST /inventory/add` - Add new product

### POS
- `GET /sales/all` - Get all sales
- `POST /sales/add` - Process new sale

### Mobile App APIs
- `GET /api/mobile/dashboard` - Dashboard statistics
- `GET /api/mobile/products` - Product list for POS
- `GET /api/mobile/customers` - Customer list for CRM
- `POST /api/sync` - Data synchronization

## 🗄️ Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `customers` - Customer information
- `inventory` - Product catalog and stock
- `sales` - Sales transactions
- `sale_items` - Individual sale line items
- `categories` - Product categories
- `suppliers` - Supplier information
- `stock_movements` - Inventory movement tracking

## 🔒 Security Features

- Session-based authentication
- Admin approval system for new users
- CORS protection
- Input validation
- SQL injection prevention

## 📱 Mobile App Integration

This backend serves a companion React Native mobile app with:
- Offline data storage
- Real-time synchronization
- Cross-platform compatibility
- Professional UI/UX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support or questions, please contact the development team.
