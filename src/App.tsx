import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import JournalPage from './pages/JournalPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { ChatProvider } from './contexts/ChatContext';
import { JournalProvider } from './contexts/JournalContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap everything in AuthProvider */}
        {/* Chat and Journal providers only needed for authenticated routes */}
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatProvider>
                  <JournalProvider>
                    <MainLayout />
                  </JournalProvider>
                </ChatProvider>
              </ProtectedRoute>
            }
          >
            {/* Nested routes within MainLayout, now protected */}
            <Route index element={<HomePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
