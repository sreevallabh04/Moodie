import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';
import { Sparkles, Moon, MessageCircle, Heart, Stars } from 'lucide-react';
import gsap from 'gsap';
import anime from 'animejs';

// Google Icon
const GoogleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,35.619,44,29.57,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

// Enhanced Floating Particle Animation Component
const ParticleAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create particles - reduced count for better performance
    const particles: HTMLDivElement[] = [];
    const particleCount = 20; // Reduced from 40 to 20
    const container = canvasRef.current;
    const colors = [
      'rgba(176, 168, 255, 0.8)', 
      'rgba(217, 196, 255, 0.7)', 
      'rgba(255, 214, 255, 0.6)'
    ];
    
    // Clean up any previously created particles
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create new particles with simpler effects
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 3;
      
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Simpler particle styling
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.backgroundColor = color;
      
      // Only add glow to a few particles
      if (Math.random() > 0.7) {
        particle.style.boxShadow = `0 0 ${size}px ${color}`;
      }
      
      particle.style.borderRadius = '50%';
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.opacity = '0';
      
      container.appendChild(particle);
      particles.push(particle);
    }
    
    // Simplified animation with anime.js
    const animation = anime.timeline({
      targets: particles,
      easing: 'easeOutExpo',
      duration: 2000,
      delay: anime.stagger(100)
    });
    
    animation
      .add({
        opacity: [0, 0.6],
        translateX: () => anime.random(-30, 30) + 'px',
        translateY: () => anime.random(-30, 30) + 'px',
        scale: () => Math.random() * 0.5 + 0.5
      })
      .add({
        targets: particles,
        opacity: [0.6, 0.2],
        translateX: () => anime.random(-50, 50) + 'px',
        translateY: () => anime.random(-30, 30) + 'px',
        duration: 4000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
        delay: 0
      });
    
    // Better cleanup
    return () => {
      if (animation) animation.pause();
      anime.remove(particles);
      
      // Ensure DOM elements are removed
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);
  
  return <div ref={canvasRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>;
};

// Optimized starry background
const StarryBackground: React.FC = () => {
  const starsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!starsRef.current) return;
    
    const stars = starsRef.current.children;
    
    // Initialize simpler GSAP animations for stars
    const animation = gsap.fromTo(
      stars,
      {
        scale: () => Math.random() * 0.5 + 0.5,
        opacity: () => Math.random() * 0.3 + 0.1,
      },
      {
        scale: () => Math.random() * 0.7 + 0.3,
        opacity: () => Math.random() * 0.7 + 0.3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random"
        }
      }
    );
    
    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, []);
  
  return (
    <div ref={starsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="absolute h-1 w-1 bg-white rounded-full" 
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            // Add glow effect to some stars
            boxShadow: Math.random() > 0.7 ? '0 0 3px 1px rgba(255,255,255,0.8)' : 'none',
          }}
        />
      ))}
    </div>
  );
};

// Simplified floating text component for better performance
const FloatingText: React.FC<{
  text: string;
  delay: number;
  className?: string;
}> = ({ text, delay, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {text}
    </motion.div>
  );
};

// Simplified Mood Bubble for better performance
interface MoodBubbleProps {
  emoji: string;
  text: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  delay: number;
}

const MoodBubble: React.FC<MoodBubbleProps> = ({ emoji, text, position, delay }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!bubbleRef.current) return;
    
    // Create simpler floating animation
    const animation = gsap.to(bubbleRef.current, {
      y: "+=15",
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: delay * 0.3,
    });
    
    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [delay]);
  
  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: delay * 0.3
      }}
      className={`absolute cursor-pointer z-10
                 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-primary-200
                 flex items-center gap-2 max-w-xs transition-all duration-300`}
      style={position}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm text-gray-700">{text}</span>
    </motion.div>
  );
};

// Simplified Animated Moon Component
const AnimatedMoon: React.FC = () => {
  const moonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!moonRef.current || !glowRef.current) return;
    
    // Create GSAP timeline for moon animation
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: "sine.inOut" }
    });
    
    // Subtle rotation and scale animation
    timeline
      .to(moonRef.current, {
        rotation: 5,
        duration: 10,
      })
      .to(glowRef.current, {
        boxShadow: '0 0 60px 30px rgba(255, 249, 219, 0.5)',
        duration: 8,
      }, 0);
      
    return () => {
      timeline.kill();
    };
  }, []);
  
  return (
    <div className="relative mb-8">
      <motion.div 
        ref={glowRef}
        className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-yellow-100 shadow-[0_0_40px_20px_rgba(255,249,219,0.4)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.2
        }}
      />
      <motion.div 
        ref={moonRef}
        className="absolute top-2 left-2 right-2 bottom-2 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Sparkles className="text-indigo-600 w-12 h-12 md:w-16 md:h-16" />
      </motion.div>
    </div>
  );
};

// Simplified feature card with fewer animations
const Feature3DCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  return (
    <motion.div 
      className="bg-gray-50 p-4 rounded-lg flex items-start gap-3 hover:bg-purple-50 transition-all duration-300"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 4px 20px -5px rgba(0, 0, 0, 0.1)" 
      }}
    >
      <div className="bg-primary-100 p-2 rounded-md flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Main login page component
const LoginPage: React.FC = () => {
  const { currentUser, signInWithGoogle, loading } = useAuthContext();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const mainControls = useAnimation();
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // Set mounted state for animations
  useEffect(() => {
    setMounted(true);
    
    // Start the main animations
    mainControls.start({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.1
      }
    });
    
    // Simpler background animation
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        backgroundPosition: '100% 100%',
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });
    }
  }, [mainControls]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/');
    }
  }, [currentUser, loading, navigate]);

  const handleSignIn = async () => {
    try {
      // Play a button animation before sign-in
      if (mounted) {
        anime({
          targets: '.login-button',
          scale: [1, 0.95, 1],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
      
      await signInWithGoogle();
      // Navigation is handled by the useEffect hook above
    } catch (error) {
      console.error("Login page sign-in error:", error);
    }
  };

  // Simplified loading state animation
  if (loading || currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-primary-900">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Sparkles className="text-primary-400" size={48} />
        </motion.div>
      </div>
    );
  }

  // Login Page Content with advanced animations
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Animated gradient background */}
      <motion.div 
        className="relative w-full md:w-3/5 p-6 flex flex-col items-center justify-center overflow-hidden"
        ref={backgroundRef}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgb(17, 24, 79) 0%, rgb(69, 40, 116) 50%, rgb(85, 51, 136) 100%)',
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%'
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { duration: 1 }
        }}
      >

        {/* Animated stars using GSAP */}
        <StarryBackground />
        
        {/* Particle animation using Anime.js */}
        <ParticleAnimation />
        
        {/* Animated moon */}
        <AnimatedMoon />
        
        {/* Floating mood bubbles with staggered animations */}
        <MoodBubble 
          emoji="😊" 
          text="How are you feeling today?" 
          position={{ left: '6%', top: '18%' }}
          delay={0}
        />
        
        <MoodBubble 
          emoji="🤔" 
          text="What's on your mind?" 
          position={{ right: '6%', top: '30%' }}
          delay={0.3}
        />
        
        <MoodBubble 
          emoji="💪" 
          text="Need a motivation boost?" 
          position={{ left: '8%', top: '42%' }}
          delay={0.6}
        />
        
        <MoodBubble 
          emoji="💤" 
          text="Trouble sleeping lately?" 
          position={{ right: '10%', top: '54%' }}
          delay={0.9}
        />
        
        
        {/* App title and tagline with text animations */}
        <motion.div 
          className="text-center mt-auto text-white relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: '300% 300%' }}
            >
              Moodie
            </motion.h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 1.5, delay: 1.4 }}
            className="h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-3"
          />
          
          <FloatingText
            text="Your AI companion for emotional wellbeing"
            delay={1.6}
            className="text-lg text-gray-200"
          />
        </motion.div>
      </motion.div>
      
      {/* Right side - Login form with animated entrance */}
      <motion.div 
        className="w-full md:w-2/5 bg-white flex items-center justify-center p-6 md:p-10"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Moodie</h2>
              <p className="text-gray-600">Sign in to start your emotional journey</p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="space-y-4"
          >
            {/* Sign in with Google button with hover animation */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={handleSignIn}
                variant="primary"
                size="lg"
                className="login-button w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                <GoogleIcon />
                <span>Sign in with Google</span>
              </Button>
            </motion.div>
            
            {/* Additional features preview with animated entrance */}
            <div className="pt-8 space-y-4">
              <FloatingText
                text="What awaits you inside:"
                delay={0.8}
                className="text-lg font-medium text-gray-700 text-center"
              />
              
              <AnimatePresence>
                {mounted && (
                  <>
                    <Feature3DCard
                      icon={<MessageCircle className="text-primary-500" size={20} />}
                      title="AI Chat Companion"
                      description="A supportive friend ready to listen anytime"
                      delay={1}
                    />
                    
                    <Feature3DCard
                      icon={<Moon className="text-primary-500" size={20} />}
                      title="Mood Tracker"
                      description="Understand your emotional patterns over time"
                      delay={1.2}
                    />
                    
                    <Feature3DCard
                      icon={<Heart className="text-primary-500" size={20} />}
                      title="Journal & Insights"
                      description="Get AI-powered insights from your daily reflections"
                      delay={1.4}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          <FloatingText
            text="By signing in, you agree to our Terms of Service and Privacy Policy"
            delay={1.8}
            className="text-xs text-gray-400 mt-10 text-center"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;