import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import Button from '../components/Button';
import { Sparkles, Moon, MessageCircle, Heart, Star, Zap } from 'lucide-react';
import gsap from 'gsap';
import anime from 'animejs';

// Professional Marquee Text Animation
const MarqueeText: React.FC<{ text: string, speed?: number, className?: string }> = ({ 
  text, 
  speed = 30, 
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const marqueeAnimation = gsap.to(containerRef.current, {
      x: "-50%",
      ease: "linear",
      repeat: -1,
      duration: speed,
    });
    
    return () => {
      marqueeAnimation.kill();
    };
  }, [speed]);
  
  // Double the text to create seamless loop
  const repeatedText = `${text} • ${text}`;
  
  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div 
        ref={containerRef} 
        className={`inline-block ${className}`}
      >
        {repeatedText}
      </div>
    </div>
  );
};

// Google Icon
const GoogleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,35.619,44,29.57,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

// Dramatically enhanced particle system with dynamic colors
const ParticleSystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const isActive = useRef(false);
  
  // Handle mouse movement with enhanced reaction
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosition.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    isActive.current = true;
    
    // Create a burst effect on mouse movement
    const burstParticleCount = 3;
    if (Math.random() > 0.7 && containerRef.current) {
      for (let i = 0; i < burstParticleCount; i++) {
        const burstParticle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        
        burstParticle.style.position = 'absolute';
        burstParticle.style.width = `${size}px`;
        burstParticle.style.height = `${size}px`;
        burstParticle.style.borderRadius = '50%';
        burstParticle.style.backgroundColor = `hsla(${Math.random() * 60 + 220}, 100%, 70%, 0.8)`;
        burstParticle.style.boxShadow = `0 0 ${size * 3}px hsla(${Math.random() * 60 + 220}, 100%, 70%, 0.8)`;
        burstParticle.style.left = `${mousePosition.current.x}px`;
        burstParticle.style.top = `${mousePosition.current.y}px`;
        burstParticle.style.zIndex = '2';
        
        containerRef.current.appendChild(burstParticle);
        
        anime({
          targets: burstParticle,
          translateX: anime.random(-80, 80),
          translateY: anime.random(-80, 80),
          opacity: [1, 0],
          scale: [1, 0.2],
          duration: 1000,
          easing: 'easeOutExpo',
          complete: () => {
            if (burstParticle.parentNode) {
              burstParticle.parentNode.removeChild(burstParticle);
            }
          }
        });
      }
    }
    
    // Deactivate after 2 seconds of no movement
    setTimeout(() => {
      isActive.current = false;
    }, 2000);
  }, []);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create particles with AnimeJS - significantly more particles
    const particleCount = 100; // Increased from 40
    const container = containerRef.current;
    
    // Define more vibrant and varied colors
    const colors = [
      'rgba(176, 168, 255, 0.8)', 
      'rgba(217, 196, 255, 0.7)', 
      'rgba(255, 214, 255, 0.6)',
      'rgba(189, 178, 255, 0.7)',
      'rgba(161, 140, 209, 0.6)',
      'rgba(122, 209, 255, 0.7)',
      'rgba(255, 170, 240, 0.6)',
      'rgba(205, 169, 255, 0.8)',
      'rgba(117, 210, 255, 0.6)'
    ];
    
    // Clean up existing particles
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create particles with more variety
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const isLarge = Math.random() > 0.92;
      const size = isLarge ? Math.random() * 15 + 8 : Math.random() * 6 + 2;
      
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Assign random color and style
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.backgroundColor = color;
      
      // Enhanced glow effect for most particles
      if (Math.random() > 0.3) {
        const glowSize = isLarge ? size * 3 : size * 2;
        particle.style.boxShadow = `0 0 ${glowSize}px ${color}`;
      }
      
      // Some particles are not circles for variety
      if (Math.random() > 0.9) {
        particle.style.borderRadius = '30%';
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      } else {
        particle.style.borderRadius = '50%';
      }
      
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.opacity = '0';
      particle.style.zIndex = isLarge ? '2' : '1';
      
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }
    
    // Initial animation with staggered appearance
    anime({
      targets: particlesRef.current,
      opacity: (el: HTMLElement, i: number) => [0, Math.random() * 0.7 + 0.3],
      scale: (el: HTMLElement, i: number) => Math.random() * 0.5 + 0.5,
      translateX: () => anime.random(-30, 30) + 'px',
      translateY: () => anime.random(-30, 30) + 'px',
      delay: anime.stagger(20),
      duration: 1200,
      easing: 'easeOutExpo',
      complete: () => {
        // More dynamic continuous floating animation
        anime({
          targets: particlesRef.current,
          translateX: () => anime.random(-60, 60) + 'px',
          translateY: () => anime.random(-60, 60) + 'px',
          opacity: () => Math.random() * 0.6 + 0.2,
          scale: () => Math.random() * 0.6 + 0.4,
          duration: () => anime.random(3000, 7000),
          delay: anime.stagger(100, {from: 'center'}),
          easing: 'easeInOutSine',
          loop: true,
          direction: 'alternate'
        });
      }
    });
    
    // Add mouse tracking
    document.addEventListener('mousemove', handleMouseMove);
    
    // Enhanced animation loop for mouse interaction
    const updateParticles = () => {
      if (isActive.current) {
        particlesRef.current.forEach((particle, i) => {
          // Increased reactivity
          if (Math.random() > 0.85) {
            const x = parseFloat(particle.style.left);
            const y = parseFloat(particle.style.top);
            
            // Calculate distance to mouse
            const dx = mousePosition.current.x - x;
            const dy = mousePosition.current.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Enhanced attraction to nearby particles
            if (distance < 200) { // Increased range from 150
              const angle = Math.atan2(dy, dx);
              const force = Math.max(0, 1 - distance / 200) * 10; // Stronger force that fades with distance
              const tx = Math.cos(angle) * force;
              const ty = Math.sin(angle) * force;
              
              anime({
                targets: particle,
                translateX: '+=' + tx + 'px',
                translateY: '+=' + ty + 'px',
                opacity: 0.9, // Brighter when reacting
                scale: 1.1, // Grow slightly
                duration: 700,
                easing: 'easeOutQuad'
              });
            }
          }
        });
      }
      requestAnimationFrame(updateParticles);
    };
    
    updateParticles();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      anime.remove(particlesRef.current);
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [handleMouseMove]);
  
  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>;
};

// Professional 3D Cosmic Background
const CosmicBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate normalized mouse position for parallax
    mousePosition.current = {
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5
    };
    
    // Apply parallax to stars container with enhanced 3D effect
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: -mousePosition.current.x * 30,
        y: -mousePosition.current.y * 30,
        rotateX: mousePosition.current.y * 5, // 3D rotation effect
        rotateY: -mousePosition.current.x * 5, // 3D rotation effect
        duration: 1,
        ease: "power2.out"
      });
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    
    // Store references to all created elements for cleanup
    const createdElements: HTMLElement[] = [];
    
    // Create random shooting stars with enhanced effects
    const createShootingStar = () => {
      if (!containerRef.current) return;
      
      const star = document.createElement('div');
      star.className = "absolute bg-white rounded-full";
      star.style.width = '3px';
      star.style.height = '3px';
      star.style.top = `${Math.random() * 80}%`;
      star.style.left = `${Math.random() * 80}%`;
      star.style.boxShadow = '0 0 8px 2px rgba(255,255,255,0.9), 0 0 16px 4px rgba(180,180,255,0.7)';
      star.style.zIndex = '3';
      
      containerRef.current.appendChild(star);
      createdElements.push(star);
      
      // Create a trailing effect
      const trail = document.createElement('div');
      trail.className = "absolute rounded-full";
      trail.style.width = '100px';
      trail.style.height = '2px';
      trail.style.top = star.style.top;
      trail.style.left = star.style.left;
      trail.style.transformOrigin = 'left center';
      trail.style.background = 'linear-gradient(90deg, white, transparent)';
      trail.style.opacity = '0';
      trail.style.zIndex = '2';
      
      containerRef.current.appendChild(trail);
      createdElements.push(trail);
      
      // Animate the star and trail together
      const angle = Math.random() * 50 - 25; // Random angle in degrees
      const distance = 300 + Math.random() * 200;
      
      gsap.to(trail, {
        opacity: 0.7,
        scaleX: 1,
        rotation: angle,
        duration: 0.2,
      });
      
      gsap.to(star, {
        x: `+=${Math.cos(angle * Math.PI / 180) * distance}`,
        y: `+=${Math.sin(angle * Math.PI / 180) * distance}`,
        opacity: 0,
        duration: 0.8,
        ease: "power1.in",
        onComplete: () => {
          if (star.parentNode) star.parentNode.removeChild(star);
          if (trail.parentNode) trail.parentNode.removeChild(trail);
          
          // Remove from tracking array
          const starIndex = createdElements.indexOf(star);
          if (starIndex > -1) createdElements.splice(starIndex, 1);
          
          const trailIndex = createdElements.indexOf(trail);
          if (trailIndex > -1) createdElements.splice(trailIndex, 1);
        }
      });
      
      gsap.to(trail, {
        opacity: 0,
        delay: 0.2,
        duration: 0.6,
      });
      
      // Schedule next shooting star
      setTimeout(createShootingStar, Math.random() * 2000 + 1000); // More frequent
    };
    
    // Create nebula-like cloud effects
    const createNebula = () => {
      if (!containerRef.current) return;
      
      const nebula = document.createElement('div');
      nebula.className = "absolute rounded-full blur-md";
      nebula.style.width = `${50 + Math.random() * 150}px`;
      nebula.style.height = `${40 + Math.random() * 100}px`;
      nebula.style.top = `${Math.random() * 80}%`;
      nebula.style.left = `${Math.random() * 80}%`;
      
      // Random color hue from purple blue spectrum
      const hue = Math.random() * 60 + 220;
      nebula.style.backgroundColor = `hsla(${hue}, 70%, 50%, 0.03)`;
      nebula.style.opacity = '0';
      nebula.style.zIndex = '1';
      
      containerRef.current.appendChild(nebula);
      createdElements.push(nebula);
      
      // Animate nebula appearance and drift
      gsap.to(nebula, {
        opacity: 0.15,
        duration: 4,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.to(nebula, {
            x: `${(Math.random() - 0.5) * 100}`,
            y: `${(Math.random() - 0.5) * 50}`,
            opacity: 0,
            duration: 10,
            ease: "power1.inOut",
            onComplete: () => {
              if (nebula.parentNode) nebula.parentNode.removeChild(nebula);
              const index = createdElements.indexOf(nebula);
              if (index > -1) createdElements.splice(index, 1);
            }
          });
        }
      });
      
      // Schedule next nebula
      setTimeout(createNebula, Math.random() * 5000 + 5000);
    };
    
    // Create twinkling effect on random stars
    const createTwinkle = () => {
      if (starsRef.current.length === 0 || !containerRef.current) return;
      
      // Pick 5-10 random stars to twinkle
      const starsToTwinkle = Math.floor(Math.random() * 5) + 5;
      for (let i = 0; i < starsToTwinkle; i++) {
        const randomIndex = Math.floor(Math.random() * starsRef.current.length);
        const star = starsRef.current[randomIndex];
        
        if (star) {
          gsap.to(star, {
            opacity: Math.random() * 0.5 + 0.5,
            boxShadow: '0 0 10px 3px rgba(255,255,255,0.9)',
            duration: 0.5,
            yoyo: true,
            repeat: 1
          });
        }
      }
      
      // Schedule next twinkle
      setTimeout(createTwinkle, Math.random() * 1000 + 500);
    };
    
    // Initialize star references for later animation
    starsRef.current = [];
    
    // Initial delays
    const shootingStarTimer = setTimeout(createShootingStar, 1500);
    const nebulaTimer = setTimeout(createNebula, 2000);
    const twinkleTimer = setTimeout(createTwinkle, 3000);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(shootingStarTimer);
      clearTimeout(nebulaTimer);
      clearTimeout(twinkleTimer);
      
      // Clean up all created elements
      createdElements.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, [handleMouseMove]);
  
  // Create star field with depth
  const stars = useMemo(() => {
    return [...Array(150)].map((_, i) => { // Increased star count
      const size = Math.random() * 3 + 1;
      const depth = Math.random(); // Depth factor for parallax (0-1)
      const isBright = Math.random() > 0.7;
      
      return {
        size,
        depth,
        isBright,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: Math.random() * 3 + 2,
        initialOpacity: Math.random() * 0.5 + 0.3,
        peakOpacity: isBright ? 1 : Math.random() * 0.3 + 0.5
      };
    });
  }, []);
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden z-0 transform-gpu" 
      ref={containerRef}
      style={{ perspective: '1000px' }}
    >
      {/* Star field with enhanced depth effect */}
      {stars.map((star, i) => (
        <motion.div 
          key={i}
          ref={el => {
            if (el) starsRef.current[i] = el;
          }}
          className="absolute rounded-full" 
          initial={{ opacity: star.initialOpacity }}
          animate={{
            opacity: [star.initialOpacity, star.peakOpacity, star.initialOpacity],
            scale: [1, star.isBright ? 1.3 : 1.1, 1]
          }}
          transition={{ 
            duration: star.duration, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay
          }}
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            backgroundColor: star.isBright ? 'white' : `rgba(255, 255, 255, ${0.6 + star.depth * 0.4})`,
            boxShadow: star.isBright 
              ? `0 0 ${star.size * 3}px rgba(255,255,255,0.9), 0 0 ${star.size * 6}px rgba(180,180,255,0.5)` 
              : `0 0 ${star.size * 2}px rgba(255,255,255,${0.3 + star.depth * 0.5})`,
            // Enhanced 3D transform with depth
            transform: `translateZ(${star.depth * 100}px)`,
            zIndex: Math.floor(star.depth * 5)
          }}
        />
      ))}
    </div>
  );
};

// Dynamic Glow Effect Component
const GlowEffect: React.FC<{ color?: string, size?: number, opacity?: number, className?: string }> = ({
  color = 'rgba(148, 130, 238, 0.7)',
  size = 150,
  opacity = 0.3,
  className = ""
}) => {
  const glowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!glowRef.current) return;
    
    gsap.to(glowRef.current, {
      opacity: opacity * 1.5,
      duration: 2 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    
    return () => {
      if (glowRef.current) gsap.killTweensOf(glowRef.current);
    };
  }, [opacity]);
  
  return (
    <div 
      ref={glowRef}
      className={`absolute rounded-full blur-xl ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        opacity: opacity,
      }}
    />
  );
};

// Professional animated text component with character-by-character animation
const FloatingText: React.FC<{
  text: string;
  delay: number;
  className?: string;
  animate?: boolean;
  gradient?: boolean;
  glow?: boolean;
}> = ({ text, delay, className, animate = false, gradient = false, glow = false }) => {
  // Enhanced motion props for more dramatic animations
  const getMotionProps = () => {
    if (gradient) {
      return {
        initial: { opacity: 0, y: 25, scale: 0.95 },
        animate: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        },
        transition: { 
          duration: 15, // Slower, more hypnotic gradient
          delay,
          ease: "easeInOut",
          repeat: Infinity,
          opacity: { duration: 0.8, delay }, // Fade in more quickly
          y: { duration: 0.8, delay },
          scale: { duration: 0.8, delay },
        },
        style: { backgroundSize: '300% 300%' }
      };
    }
    
    return {
      initial: { opacity: 0, y: 20, scale: 0.97 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { 
        duration: 0.8, 
        delay,
        ease: "easeOut"
      }
    };
  };
  
  // Calculate classes including glow effect
  const getClasses = () => {
    let classes = className || '';
    
    if (gradient) {
      classes += ' text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300';
    }
    
    if (glow && !gradient) {
      classes += ' text-shadow-glow';
    }
    
    return classes;
  };
  
  return (
    <motion.div
      {...getMotionProps()}
      className={getClasses()}
    >
      {animate ? (
        // Animate each character individually
        text.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ 
              opacity: 0, 
              y: 15, 
              rotateY: Math.random() > 0.5 ? 40 : -40, 
              scale: 0.9 
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotateY: 0,
              scale: 1
            }}
            transition={{
              duration: 0.3,
              delay: delay + index * 0.03,
              ease: "easeOut",
              rotateY: { duration: 0.5 }
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))
      ) : (
        text
      )}
    </motion.div>
  );
};

// Enhanced Mood Bubble with interactive animations
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
  color?: string;
  glow?: boolean;
}

const MoodBubble: React.FC<MoodBubbleProps> = ({ 
  emoji, 
  text, 
  position, 
  delay, 
  color = 'white',
  glow = true 
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!bubbleRef.current) return;
    
    // Enhanced floating animation with GSAP
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    
    // More dynamic floating with subtle rotation
    timeline.to(bubbleRef.current, {
      y: '+=20',
      x: '+=12',
      rotate: '+=3',
      scale: 1.02,
      duration: 4 + Math.random() * 3,
      ease: "sine.inOut",
      delay: delay * 0.2
    });
    
    return () => {
      timeline.kill();
    };
  }, [delay]);
  
  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20, rotate: Math.random() * 6 - 3, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 120,
        damping: 15,
        delay: delay * 0.3
      }}
      className={`absolute cursor-pointer z-10 ${color === 'white' ? 'bg-white/90' : 'bg-primary-50/90'} 
                  backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-xl border border-primary-200/50 
                  flex items-center gap-2 max-w-xs transition-all duration-300`}
      style={{
        ...position,
        transformOrigin: 'center',
        boxShadow: glow ? '0 0 20px rgba(162, 155, 254, 0.2)' : undefined,
        transform: 'perspective(1000px)'
      }}
      whileHover={{ 
        scale: 1.08, 
        y: -5,
        boxShadow: glow 
          ? '0 10px 30px -5px rgba(162, 155, 254, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
          : '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -6px rgba(0, 0, 0, 0.1)',
        rotateX: -5, // 3D tilt
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl md:text-3xl">{emoji}</span>
      <span className="text-sm md:text-base text-gray-700 font-medium">{text}</span>
    </motion.div>
  );
};

// Professional 3D Cosmic Logo
const CosmicLogo: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!logoRef.current || !glowRef.current || !iconRef.current) return;
    
    // Create enhanced GSAP animation for 3D floating effect
    gsap.to(logoRef.current, {
      y: "+=25",
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Create dramatic pulsing glow effect
    gsap.to(glowRef.current, {
      boxShadow: '0 0 100px 50px rgba(146, 156, 255, 0.8)',
      scale: 1.05,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Enhanced 3D rotation for the icon
    gsap.to(iconRef.current, {
      rotateY: 25,
      rotateX: 15,
      scale: 1.1,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    return () => {
      gsap.killTweensOf([logoRef.current, glowRef.current, iconRef.current]);
    };
  }, []);
  
  return (
    <div className="relative mb-12 mt-4 transform-gpu perspective-1000" ref={logoRef}>
      {/* Additional outer glow effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-indigo-600/5 blur-2xl"></div>
      </div>
      
      <motion.div 
        ref={glowRef}
        className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-white via-indigo-100 to-purple-50 shadow-[0_0_80px_35px_rgba(146,156,255,0.6)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2
        }}
      />
      <motion.div 
        ref={iconRef}
        className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center transform-gpu perspective-1000"
        initial={{ opacity: 0, rotateX: -45, scale: 0.8 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1 }}
        transition={{ 
          duration: 1.2, 
          delay: 0.5,
          type: "spring",
          damping: 12
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Sparkles className="text-indigo-600 w-14 h-14 md:w-20 md:h-20 filter drop-shadow-lg" />
      </motion.div>
    </div>
  );
};

// Professional Glowing Button
const GlowButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled = false, children, icon, className = '' }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (!buttonRef.current) return;
    
    // Subtle pulsing animation
    gsap.to(buttonRef.current, {
      boxShadow: '0 0 20px rgba(146, 156, 255, 0.4), 0 0 40px rgba(146, 156, 255, 0.2)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    return () => {
      if (buttonRef.current) gsap.killTweensOf(buttonRef.current);
    };
  }, []);
  
  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      className={`py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 
                 text-white font-medium flex items-center justify-center gap-3 transition-all duration-300 relative transform-gpu
                 ${className}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: '0 10px 25px -5px rgba(146, 156, 255, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
      </div>
    </motion.button>
  );
};

// Professional 3D Feature Card with enhanced hover effects
const ProfessionalFeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  variant?: 'primary' | 'secondary' | 'accent';
  intense?: boolean;
}> = ({ icon, title, description, delay, variant = 'primary', intense = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Set color classes based on variant
  const getColorClasses = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: intense ? "bg-gradient-to-br from-indigo-50 to-blue-100" : "bg-indigo-50",
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
          hoverBg: "bg-indigo-100",
          glow: "rgba(99, 102, 241, 0.25)"
        };
      case 'accent':
        return {
          bg: intense ? "bg-gradient-to-br from-purple-50 to-pink-100" : "bg-purple-50",
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
          hoverBg: "bg-purple-100",
          glow: "rgba(168, 85, 247, 0.25)"
        };
      default:
        return {
          bg: intense ? "bg-gradient-to-br from-primary-50 to-violet-100" : "bg-primary-50",
          iconBg: "bg-primary-100",
          iconColor: "text-primary-600",
          hoverBg: "bg-primary-100",
          glow: "rgba(139, 92, 246, 0.25)"
        };
    }
  };
  
  const colors = getColorClasses();
  
  // Enhanced 3D hover effect with GSAP
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Limit rotation to ±10 degrees (increased from ±7)
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 1000,
        boxShadow: `0 15px 35px -10px ${colors.glow}, 0 5px 15px rgba(0, 0, 0, 0.1)`
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.7)",
        boxShadow: `0 5px 15px -5px ${colors.glow}, 0 0 5px rgba(0, 0, 0, 0.05)`
      });
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [colors.glow]);
  
  return (
    <motion.div 
      ref={cardRef}
      className={`${colors.bg} p-5 rounded-xl flex items-start gap-4 shadow-lg border border-white/70
                 hover:${colors.hoverBg} transition-all duration-300 transform-gpu`}
      initial={{ opacity: 0, x: -30, rotateY: -15, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 120,
        damping: 12,
        delay: delay * 1.2
      }}
      whileHover={{ 
        scale: 1.04,
        y: -5,
        boxShadow: `0 20px 40px -15px ${colors.glow}, 0 10px 20px -5px rgba(0, 0, 0, 0.1)`
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Icon with enhanced glowing effect */}
      <div className={`${colors.iconBg} p-3 rounded-lg flex-shrink-0 transform-gpu shadow-md`}
           style={{ transform: 'translateZ(10px)' }}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 mb-2 text-lg transform-gpu"
            style={{ transform: 'translateZ(15px)' }}>{title}</h4>
        <p className="text-gray-600 transform-gpu"
           style={{ transform: 'translateZ(5px)' }}>{description}</p>
      </div>
    </motion.div>
  );
};

// Enhanced animated glowing divider
const GlowingDivider: React.FC<{ delay: number, width?: string }> = ({ delay, width = '70%' }) => {
  const dividerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!dividerRef.current) return;
    
    // Enhanced glowing animation
    gsap.to(dividerRef.current, {
      boxShadow: '0 0 15px 2px rgba(255, 255, 255, 0.9), 0 0 30px 5px rgba(180, 180, 255, 0.5)',
      opacity: 1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5
    });
    
    return () => {
      gsap.killTweensOf(dividerRef.current);
    };
  }, []);
  
  return (
    <motion.div
      ref={dividerRef}
      initial={{ width: 0 }}
      animate={{ width }}
      transition={{ 
        duration: 1.2, 
        delay,
        ease: "easeOut" 
      }}
      className="h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4 opacity-80"
      style={{ boxShadow: '0 0 10px 1px rgba(255, 255, 255, 0.6)' }}
    />
  );
};

// Main enhanced login page component
const LoginPage: React.FC = () => {
  const { currentUser, signInWithGoogle, loading } = useAuthContext();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // Set mounted state and initialize enhanced animations
  useEffect(() => {
    setMounted(true);
    
    // Enhanced background animation with GSAP
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        backgroundPosition: '200% 100%',
        duration: 30,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }
  }, []);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/');
    }
  }, [currentUser, loading, navigate]);
  
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation is handled by the useEffect hook above
    } catch (error) {
      console.error("Login page sign-in error:", error);
    }
  };

  // Dramatically enhanced loading state animation
  if (loading || currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-primary-900">
        <motion.div
          animate={{
            scale: [1, 1.3, 1.1, 1.4, 1],
            rotateZ: [0, 120, 240, 360],
            filter: [
              'drop-shadow(0 0 15px rgba(146, 156, 255, 0.6))',
              'drop-shadow(0 0 25px rgba(146, 156, 255, 1))',
              'drop-shadow(0 0 20px rgba(146, 156, 255, 0.8))',
              'drop-shadow(0 0 30px rgba(146, 156, 255, 1))',
              'drop-shadow(0 0 15px rgba(146, 156, 255, 0.6))',
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="text-primary-400" size={64} />
          
          {/* Additional loading particles */}
          <motion.div
            className="absolute -z-10"
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0.5, 1.8, 1.2, 1.5, 0.5],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Star className="text-indigo-300 opacity-70" size={96} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Enhanced Login Page Content with professional animations
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Animated gradient background */}
      <motion.div 
        ref={backgroundRef}
        className="relative w-full md:w-3/5 p-6 flex flex-col items-center justify-center overflow-hidden perspective-1000"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgb(17, 24, 79) 0%, rgb(67, 40, 116) 35%, rgb(95, 55, 146) 65%, rgb(75, 45, 126) 100%)',
          backgroundSize: '400% 400%',
          backgroundPosition: '0% 0%'
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { duration: 1.2 }
        }}
      >
        {/* Professional 3D Cosmic Background */}
        <CosmicBackground />
        
        {/* Interactive Enhanced Particle System */}
        <ParticleSystem />
        
        
        {/* Professional 3D Cosmic Logo */}
        <CosmicLogo />
        
        {/* Floating mood bubbles with staggered animations */}
        <MoodBubble 
          emoji="😊" 
          text="How are you feeling today?"
          position={{ left: '6%', top: '22%' }}
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
          position={{ left: '5%', top: '48%' }}
          color="indigo"
          delay={0.6}
        />
        
        <MoodBubble 
          emoji="💤" 
          text="Trouble sleeping lately?" 
          position={{ right: '7%', top: '55%' }}
          color="purple"
          delay={0.9}
        />
        
        {/* App title and tagline with text animations */}
        <motion.div 
          className="text-center mt-auto mb-8 text-white relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.h1
            className="text-5xl md:text-8xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              textShadow: [
                '0 0 20px rgba(255, 255, 255, 0.4)',
                '0 0 40px rgba(167, 139, 250, 0.7)',
                '0 0 20px rgba(255, 255, 255, 0.4)'
              ]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2
            }}
            style={{ backgroundSize: '400% 400%' }}
          >
            Moodie
          </motion.h1>
          
          {/* Enhanced glowing divider */}
          <GlowingDivider delay={1.4} />
          
          <FloatingText
            text="Your AI companion for emotional wellbeing"
            delay={1.6}
            className="text-lg md:text-2xl text-gray-200 tracking-wide font-medium"
            animate={true}
            glow={true}
          />
        </motion.div>
      </motion.div>
      
      {/* Right side - Login form with animated entrance */}
      <motion.div 
        className="w-full md:w-2/5 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-6 md:p-12"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          type: "spring",
          damping: 20
        }}
      >
        {/* Subtle glow effects in the background */}
        <div className="absolute top-1/4 right-1/4 opacity-60 z-0">
          <GlowEffect color="rgba(139, 92, 246, 0.2)" size={200} />
        </div>
        <div className="absolute bottom-1/4 left-1/3 opacity-40 z-0">
          <GlowEffect color="rgba(168, 85, 247, 0.15)" size={150} />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-primary-600 to-indigo-900 mb-3">
                Welcome to Moodie
              </h2>
              <p className="text-gray-600 text-lg md:text-xl">Sign in to start your emotional journey</p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="space-y-6"
          >
            {/* Professional Google Sign in Button */}
            <GlowButton 
              onClick={handleSignIn}
              disabled={loading}
              icon={<GoogleIcon />}
              className="w-full"
            >
              Sign in with Google
            </GlowButton>
            
            {/* Subtle animated divider */}
            <div className="relative py-3">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or explore</span>
              </div>
            </div>
            
            {/* Additional features preview with animated entrance */}
            <div className="pt-8 space-y-4">
              <FloatingText
                text="What awaits you inside:"
                delay={0.8}
                className="text-xl md:text-2xl font-bold text-gray-700 text-center mb-5"
                gradient={true}
                glow={true}
              />
              
              {/* Feature cards with animations */}
              <AnimatePresence mode="wait">
                {mounted && (
                  <>
                    <ProfessionalFeatureCard
                      icon={<MessageCircle size={22} />}
                      title="AI Chat Companion"
                      description="A supportive friend ready to listen anytime and provide thoughtful responses."
                      delay={1}
                      intense={true}
                    />
                  
                    <ProfessionalFeatureCard
                      icon={<Moon size={22} />}
                      title="Mood Tracker"
                      description="Understand your emotional patterns over time with beautiful visualizations."
                      delay={1.2}
                      variant="secondary"
                      intense={true}
                    />
                    
                    <ProfessionalFeatureCard
                      icon={<Heart size={22} />}
                      title="Journal & Insights"
                      description="Get AI-powered insights from your daily reflections and mood entries."
                      delay={1.4}
                      variant="accent"
                      intense={true}
                    />
                    
                    <ProfessionalFeatureCard
                      icon={<Zap size={22} />}
                      title="Growth Path"
                      description="Personalized suggestions to help develop emotional resilience."
                      delay={1.6}
                      intense={true}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          <FloatingText
            text="By signing in, you agree to our Terms of Service and Privacy Policy"
            delay={2}
            className="text-xs text-gray-400 mt-12 text-center"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;