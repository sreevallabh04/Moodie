import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface TestimonialProps {
  name: string;
  age: number;
  text: string;
  avatar: string;
  delay?: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ name, age, text, avatar, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-xl shadow-soft"
    >
      <div className="relative">
        <div className="absolute -top-2 -left-2 text-primary-200">
          <Quote size={24} />
        </div>
        <p className="text-gray-600 italic pl-6 mb-4">{text}</p>
      </div>
      <div className="flex items-center mt-4">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">Age {age}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Testimonial;