# Moodie - AI Emotional Wellbeing Companion

![Moodie Banner](https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=600)

Moodie is a modern, emotionally intelligent wellness application that helps users track their mood, journal their thoughts, and engage with an AI companion that adapts to their emotional needs.

## ✨ Features

### 🤖 AI Companion with Personality Modes
- **Gen Z BFF**: Casual, funny, uses slang and emojis
- **Mindful Therapist**: Calm, empathetic, reflective
- **Stoic Philosopher**: Wise, rational, principled
- **Balanced**: Default friendly, supportive personality

### 📝 Journaling
- Daily mood tracking with visual slider
- Text journals with rich formatting
- Private and secure storage in Firebase

### 📊 Mood Tracking & Insights
- GitHub-style heatmap calendar showing mood per day
- Streak tracking for consistent journaling
- Weekly AI-generated insights about your emotional patterns

### 💬 Persistent Conversations
- Save and revisit previous chats
- Organized by date and topic
- Seamless conversation history

### ✨ Modern UI & Experience
- Smooth animations and transitions
- Responsive design for all devices
- Glassmorphism and subtle gradients
- Micro-interactions and feedback

## 🛠️ Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** for fast builds and development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide** for icons
- **GSAP** & **AnimeJS** for advanced animations
- **Chart.js** for data visualization

### Backend & API
- **Express.js** backend proxy for API security
- **Gemini Pro API** for AI functionality
- **API key rotation** for quota management
- **Firebase Authentication** for user management
- **Firestore** for data storage

### Additional Technologies
- **React Router** for navigation
- **date-fns** for date handling
- **Tone.js** for ambient sounds (optional)
- **React Confetti** for celebrations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase account
- Gemini API key(s)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/moodie.git
   cd moodie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory with:
   ```
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id

   # Gemini API Keys (comma-separated for rotation)
   GEMINI_API_KEYS=your_gemini_key_1,your_gemini_key_2

   # API Endpoint (for local development)
   VITE_API_ENDPOINT=http://localhost:3001/api/chat
   ```

4. **Start the development environment**
   ```bash
   # Start both backend and frontend
   npm run start

   # Or start them separately
   npm run server:dev
   npm run dev
   ```

5. **Open the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
moodie/
├── public/             # Static assets
├── src/
│   ├── api/            # API proxy implementation
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component
│   ├── firebaseConfig.ts # Firebase configuration
│   ├── index.css       # Global styles
│   └── main.tsx        # Application entry point
├── server.js           # Express backend server
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
└── vite.config.ts      # Vite configuration
```

### Key Components

- **AuthContext**: Manages user authentication state
- **ChatContext**: Handles AI chat functionality with Gemini API
- **JournalContext**: Manages journal entries and mood tracking
- **MoodChart**: Visualizes mood data over time
- **ChatPage**: Main chat interface with AI companion
- **JournalPage**: Journal writing and mood tracking interface

## 📦 Deployment

### Vercel Deployment (Frontend)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

### Backend Deployment Options

#### Option 1: Vercel Serverless Functions
1. Create an `api` directory in your project
2. Move the chat API logic to serverless functions
3. Deploy with Vercel CLI

#### Option 2: Railway or Render
1. Configure `server.js` as your entry point
2. Set environment variables
3. Deploy to your preferred platform

## 🔒 Security Considerations

- All API keys are stored server-side only
- Firebase rules restrict data access to authenticated users
- User data is segregated by user ID in Firestore
- API key rotation prevents quota abuse

## 🛣️ Roadmap

- [ ] **Advanced Mood Analysis**: AI-powered pattern recognition in mood data
- [ ] **Custom AI Personalities**: Allow users to customize their AI companion
- [ ] **Voice Interactions**: Add voice input and output options
- [ ] **Social Features**: Optional sharing of mood insights with trusted friends
- [ ] **Integration with Wearables**: Import biometric data for more accurate insights
- [ ] **Offline Mode**: Full functionality when offline with data sync
- [ ] **Guided Meditation**: Add guided meditation sessions
- [ ] **Mobile Apps**: Native mobile applications for iOS and Android

## 🤝 Contributing

We welcome contributions to Moodie! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Gemini AI API by Google
- Firebase by Google
- All open-source libraries used in this project
- Icons from Lucide