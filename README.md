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
- Private and secure storage in Firebase (user-specific collections)

### 📊 Mood Tracking & Insights
- Mood chart visualizing trends over time
- Weekly AI-generated insights about your emotional patterns (via `/api/journal-summary`)

### 💬 Persistent Conversations
- Save and revisit previous chats per user
- Organized conversation list
- Conversation history context provided to AI

### ✨ Modern UI & Experience
- Smooth animations and transitions (Framer Motion, AnimeJS)
- Responsive design for all devices
- Glassmorphism and subtle gradients used in login
- Micro-interactions and feedback

## 🛠️ Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** for fast builds and development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide** for icons
- **AnimeJS** for specific animations (e.g., MoodSlider)
- **Chart.js** (`react-chartjs-2`) for data visualization
- **React Router** for navigation
- **date-fns** for date handling

### Backend & API
- **Node.js** / **Express.js** backend proxy (`server.js`) for API security
- **Groq API** (via backend) for AI chat functionality
- **Firebase Authentication** (Google Sign-In) for user management
- **Firestore** for data storage (user-specific chat and journal collections)

### Development
- **ESLint** for linting
- **Nodemon** for backend development auto-reload
- **Concurrently** to run frontend and backend together

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended) and npm
- Firebase account (set up Authentication with Google provider and Firestore database)
- Groq API key

### Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd moodie
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment setup**
    Create a `.env` file in the root directory by copying `.env.example` and filling in your credentials:
    ```dotenv
    # Firebase Configuration (Get from Firebase Console)
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_firebase_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id (optional)

    # Groq API Key (Used by backend server.js)
    GROQ_API_KEY=your_groq_api_key

    # API Endpoint (Frontend uses this to talk to your backend)
    # Ensure the port matches the PORT in server.js (default 3001)
    VITE_API_ENDPOINT=http://localhost:3001/api/chat
    VITE_JOURNAL_SUMMARY_ENDPOINT=http://localhost:3001/api/journal-summary

    # Backend Server Port (Optional, defaults to 3001)
    # PORT=3001

    # Frontend URL (Optional, for CORS in production)
    # FRONTEND_URL=https://your-deployed-frontend.com
    ```
    **Note:** Ensure you enable Google Sign-In in your Firebase Authentication settings and set up Firestore in your Firebase project.

4.  **Start the development environment**
    This command starts both the backend server (with `nodemon`) and the frontend Vite dev server concurrently.
    ```bash
    npm run start
    ```
    *Alternatively, run separately:*
    ```bash
    # Terminal 1: Start backend
    npm run server:dev
    # Terminal 2: Start frontend
    npm run dev
    ```

5.  **Open the application**
    Open the URL provided by Vite (usually [http://localhost:5173](http://localhost:5173) or similar) in your browser.

## 📁 Project Structure

```
moodie/
├── public/             # Static assets (favicon)
├── src/
│   ├── api/            # Backend API route handlers (chat.js, journal-summary.js)
│   ├── components/     # Reusable UI components (Button, Navbar, ChatMessage, etc.)
│   ├── contexts/       # React context providers (Auth, Chat, Journal)
│   ├── layouts/        # Page layouts (MainLayout)
│   ├── pages/          # Page components (HomePage, ChatPage, JournalPage, LoginPage)
│   ├── App.tsx         # Main app component, routing setup
│   ├── firebaseConfig.ts # Firebase SDK initialization
│   ├── index.css       # Global styles, Tailwind directives
│   └── main.tsx        # Application entry point
├── .env                # Local environment variables (Gitignored)
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore rules
├── eslint.config.js    # ESLint configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration (for Tailwind)
├── README.md           # This file
├── server.js           # Express backend server entry point
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript base configuration
├── tsconfig.app.json   # TypeScript config for Vite app
├── tsconfig.node.json  # TypeScript config for backend/Vite config
└── vite.config.ts      # Vite build tool configuration
```

## 🔒 Security Considerations

-   **API Keys:** The Groq API key (`GROQ_API_KEY`) is intended to be used **only** by the backend (`server.js`) and should **never** be exposed directly in the frontend code. Ensure your `.env` file is not committed to version control.
-   **Firebase Rules:** It is **critical** to set up Firestore Security Rules to ensure users can only access their own data. Example rules are commented in `ChatContext.tsx` and `JournalContext.tsx`. Without proper rules, your database is likely open to unauthorized access.
-   **Authentication:** Firebase Authentication handles user sign-in securely. Protected routes ensure only logged-in users can access application features.
-   **CORS:** The backend server (`server.js`) includes basic CORS configuration. Adjust the allowed origins in `server.js` for production deployment.

## 🛣️ Roadmap

-   [ ] **Advanced Mood Analysis**: Deeper AI-powered pattern recognition in mood data.
-   [ ] **Custom AI Personalities**: Allow users to fine-tune or create AI companions.
-   [ ] **Voice Interactions**: Add voice input/output.
-   [ ] **Offline Mode**: Improve offline data handling and sync.
-   [ ] **Guided Meditations/Exercises**: Integrate wellness activities.
-   [ ] **Error Handling**: More robust user-facing error messages.
-   [ ] **Testing**: Implement unit and integration tests.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is likely under a standard open-source license like MIT (check for a LICENSE file or add one if desired).

## 🙏 Acknowledgements

-   Groq AI API
-   Firebase by Google
-   React & Vite Teams
-   Tailwind CSS
-   All open-source libraries used.
-   Icons from Lucide
