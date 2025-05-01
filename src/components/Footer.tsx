import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Moodie</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your AI buddy who gets it. We're here to help you reflect, not diagnose.
              A safe space for journaling and mood tracking.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  Chat with Moodie
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-primary-500 text-sm transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 flex flex-col items-center">
          <div className="flex space-x-4 mb-4">
            <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
              <Github size={20} />
            </a>
          </div>
          
          <p className="text-gray-500 text-sm flex items-center">
            Built with <Heart size={14} className="mx-1 text-error-400" /> and AI to support your mental wellness
          </p>
          
          <p className="text-gray-400 text-xs mt-2">
            © {new Date().getFullYear()} Moodie. Not a replacement for professional therapy.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;