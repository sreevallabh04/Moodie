import React from 'react';
import { motion } from 'framer-motion';
import { Smile, MessageCircle, BookOpen, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import Testimonial from '../components/Testimonial';

const HomePage: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Alex K.',
      age: 19,
      text: 'Moodie helped me understand my anxiety triggers in ways therapy couldn\'t. It\'s like having a friend who\'s always there to listen.',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      id: 2,
      name: 'Jamie L.',
      age: 22,
      text: 'I use Moodie before bed every night. It helps me process the day and I sleep so much better now.',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      id: 3,
      name: 'Taylor M.',
      age: 20,
      text: 'The journal prompts are so good! They make me think about things I wouldn\'t have considered. Big fan!',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-primary-500" />,
      title: 'Check In',
      description: 'Connect with Moodie anytime to share what\'s on your mind. No judgment, just understanding.',
    },
    {
      icon: <Smile className="h-6 w-6 text-primary-500" />,
      title: 'Chat',
      description: 'Have a real conversation that feels like texting a supportive friend who really gets you.',
    },
    {
      icon: <BookOpen className="h-6 w-6 text-primary-500" />,
      title: 'Reflect',
      description: 'Journal with AI-guided prompts and track your mood patterns over time.',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                  Meet Moodie —
                  <span className="text-primary-500 block">your AI buddy who gets it.</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                  A safe space to journal, chat, and track your moods with an AI companion who's always there to listen.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    to="/chat" 
                    variant="primary" 
                    size="lg"
                    icon={<MessageCircle size={20} />}
                  >
                    Talk to Moodie Now
                  </Button>
                  <Button 
                    to="/about" 
                    variant="outline" 
                    size="lg"
                    icon={<ChevronRight size={20} />}
                    iconPosition="right"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 bg-primary-100 rounded-full flex items-center justify-center">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="bg-primary-400 w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Smile className="w-24 h-24 text-white" />
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -left-6 top-1/4 bg-white p-3 rounded-lg shadow-soft"
                >
                  <p className="text-sm">😊 Feeling good today?</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -right-6 bottom-1/4 bg-white p-3 rounded-lg shadow-soft"
                >
                  <p className="text-sm">💭 What's on your mind?</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Moodie Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple, three-step process to better mental wellbeing, available whenever you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-soft"
              >
                <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Moodie has helped thousands of Gen Z users improve their mental wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Testimonial 
                key={testimonial.id}
                name={testimonial.name}
                age={testimonial.age}
                text={testimonial.text}
                avatar={testimonial.avatar}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to start your wellness journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of others who have found a supportive AI companion in Moodie.
            </p>
            <Button 
              to="/chat" 
              variant="primary" 
              size="lg"
              icon={<MessageCircle size={20} />}
            >
              Start Chatting with Moodie
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;