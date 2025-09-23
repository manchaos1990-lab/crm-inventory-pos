# CRM POS Inventory App

A comprehensive **CRM + POS + Inventory management** mobile application built with **Expo React Native**, **TypeScript**, and **NativeWind (Tailwind CSS)**.

## 🚀 Features

### Core Modules
- **CRM (Customer Management)** - Customer profiles, purchase history, recommendations
- **POS (Point of Sale)** - Product catalog, shopping cart, checkout system
- **Inventory Management** - Stock tracking, low-stock alerts, product management

### Key Features
- 📱 **Offline-First Design** - Works without internet connection
- 🎨 **Modern UI** - Built with NativeWind (Tailwind CSS)
- 🤖 **AI Assistant** - Chat-based business insights and analytics
- 📊 **Real-time Dashboard** - Sales metrics, inventory alerts, quick actions
- 🛒 **Smart Cart** - Customer selection, discounts, tax calculation
- 👥 **Customer Management** - Profiles, purchase history, tags
- 📦 **Inventory Control** - Stock levels, categories, alerts
- 🔍 **Search & Filter** - Find products and customers quickly

## 🛠 Tech Stack

- **Frontend**: Expo React Native + TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: React Navigation (Stack + Tabs)
- **State Management**: Zustand
- **Database**: SQLite (offline-first)
- **Icons**: Expo Vector Icons

## 📱 Screens

### Authentication
- Login Screen
- Signup Screen

### Main App (Tab Navigation)
- **Dashboard** - Overview, metrics, quick actions, AI insights
- **Products** - Product catalog with search and filters
- **Cart** - Shopping cart with customer selection and checkout
- **Customers** - Customer management and profiles
- **Inventory** - Stock management and alerts
- **Chat** - AI Assistant for business insights

### Additional Screens
- Product Detail
- Customer Detail
- Add/Edit Product
- Add/Edit Customer
- Settings

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM-POS-Inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (mobile)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── index.ts
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── main/           # Main app screens
│   ├── detail/         # Detail screens
│   └── form/           # Form screens
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── store/              # State management
│   └── useAppStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── services/           # API and data services
│   ├── mockData.ts
│   └── initializeApp.ts
├── constants/          # App constants
│   └── index.ts
└── styles/            # Global styles
    └── global.css
```

## 🎯 Usage

### Demo Credentials
- **Email**: admin@demo.com
- **Password**: password123

### Key Workflows

1. **Sales Process**
   - Browse products in Products tab
   - Add items to cart
   - Select customer (optional)
   - Apply discounts
   - Complete checkout

2. **Customer Management**
   - View customer profiles
   - Track purchase history
   - Add notes and tags
   - Monitor customer metrics

3. **Inventory Management**
   - Monitor stock levels
   - Set minimum stock alerts
   - Track low-stock items
   - Manage product categories

4. **AI Assistant**
   - Ask about sales performance
   - Get inventory insights
   - Customer analytics
   - Business recommendations

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_URL=https://your-api-url.com
```

### Customization
- **Colors**: Update `tailwind.config.js` for custom color scheme
- **Constants**: Modify `src/constants/index.ts` for app settings
- **Sample Data**: Edit `src/services/mockData.ts` for demo data

## 📦 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Web
```bash
expo build:web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Real-time sync with backend
- [ ] Barcode scanning
- [ ] Advanced reporting
- [ ] Multi-store support
- [ ] Employee management
- [ ] Advanced AI features
- [ ] Offline data sync
- [ ] Push notifications

---

**Built with ❤️ using Expo React Native + TypeScript + NativeWind**
