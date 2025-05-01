import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Menu, X, Smile, LogOut } from 'lucide-react'; // Added LogOut icon
import { motion } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext'; // Import AuthContext
import Button from './Button'; // Import Button for styling consistency

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuthContext(); // Get user and signOut function

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/chat', label: 'Chat' },
    { path: '/journal', label: 'Journal' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header 
      className={`fixed w-full z-10 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-soft py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <motion.div 
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 bg-primary-400 rounded-full"
            >
              <Smile size={24} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gray-800">Moodie</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium text-sm transition-colors hover:text-primary-500 ${
                  location.pathname === link.path
                    ? 'text-primary-500'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Add Sign Out button if user is logged in */}
            {currentUser && (
              <Button
                onClick={async () => {
                  await signOut();
                  navigate('/login'); // Redirect to login after sign out
                }}
                variant="secondary"
                size="sm"
                className="ml-4"
                icon={<LogOut size={16} />}
              >
                Sign Out
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Conditionally render Sign Out button for mobile */}
            {currentUser && (
               <Button
                onClick={async () => {
                  await signOut();
                   navigate('/login');
                 }}
                 variant="text" // Changed from "ghost" to "text"
                 size="sm"
                 className="mr-2 p-1"
                 icon={<LogOut size={20} />}
                 aria-label="Sign Out"
               >
                 <></> {/* Add empty children to satisfy ButtonProps */}
               </Button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          className="md:hidden bg-white"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 px-4 font-medium text-sm rounded-lg ${
                  location.pathname === link.path
                    ? 'bg-primary-100 text-primary-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Add Sign Out button to mobile menu */}
            {currentUser && (
              <Button
                onClick={async () => {
                  await signOut();
                  setIsOpen(false); // Close menu after sign out
                  navigate('/login');
                }}
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                icon={<LogOut size={16} />}
              >
                Sign Out
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
