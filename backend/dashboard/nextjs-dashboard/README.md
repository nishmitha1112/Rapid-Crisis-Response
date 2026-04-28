# Rapid Crisis Dashboard - Next.js Implementation

## 🚀 Features
- Real-time emergency alerts via Firebase
- Interactive map with incident locations
- Responder role assignment
- Live statistics dashboard
- Professional glassmorphic UI

## 🛠️ Setup Instructions

### Prerequisites
```bash
npm install -g next@latest
npm install -g typescript@latest
```

### Installation
```bash
cd nextjs-dashboard
npm install
```

### Environment Setup
Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development
```bash
npm run dev
```
Access at: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AlertCard.tsx
│   ├── MapPanel.tsx
│   ├── RoleBoard.tsx
│   └── StatCard.tsx
└── lib/
    ├── firebase.ts
    ├── firebase-alerts.ts
    └── mock-data.ts
```

## 🔧 Dependencies
- Next.js 14 with App Router
- Firebase Realtime Database
- React Leaflet for maps
- TailwindCSS for styling
- TypeScript for type safety

## 🎨 Design Features
- Glassmorphic UI effects
- Real-time data synchronization
- Responsive design
- Professional emergency interface
- Interactive components with hover states

## 📊 Key Components
- **AlertCard**: Emergency alert display
- **StatCard**: Metrics dashboard
- **MapPanel**: Interactive incident map
- **RoleBoard**: Responder assignment interface

## 🔥 Note on Dependencies
The Firebase and Leaflet dependencies need to be installed:
```bash
npm install firebase react-leaflet leaflet @types/leaflet
```

This creates a professional emergency management dashboard with real-time capabilities.
