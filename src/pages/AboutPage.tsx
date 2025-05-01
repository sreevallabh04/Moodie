import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Cpu, MessageCircle } from 'lucide-react';
import Button from '../components/Button';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-primary-500" />,
      title: 'AI Conversations',
      description: 'Chat with Moodie anytime you need emotional support or just want to talk through your thoughts.',
    },
    {
      icon: <Shield className="h-6 w-6 text-primary-500" />,
      title: 'Privacy-First',
      description: 'Your data is encrypted and never shared. Your conversations are yours alone.',
    },
    {
      icon: <Heart className="h-6 w-6 text-primary-500" />,
      title: 'Mental Wellness',
      description: 'Regular journaling and mood tracking can improve emotional awareness and resilience.',
    },
    {
      icon: <Cpu className="h-6 w-6 text-primary-500" />,
      title: 'Advanced AI',
      description: 'Powered by Groq and Mixtral to provide thoughtful, human-like responses.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-6"
          >
            About Moodie
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Built with ❤️ and AI to help you reflect, not diagnose.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative inline-block"
          >
            <img 
              src="https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Moodie" 
              className="w-40 h-40 rounded-full border-4 border-primary-400"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary-400 rounded-full p-2">
              <Heart size={24} className="text-white" />
            </div>
          </motion.div>
        </div>

        {/* Our Mission */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-soft p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            Moodie was created to provide a supportive, non-judgmental space for Gen Z to express themselves, 
            track their emotions, and develop healthier mental habits through consistent journaling and reflection.
          </p>
          <p className="text-gray-600">
            We believe that emotional well-being is as important as physical health, and that technology can 
            help bridge the gap in mental health support. Moodie is designed to be accessible, relatable, and 
            genuinely helpful - like having a conversation with a friend who truly gets you.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Makes Moodie Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-soft"
              >
                <div className="flex items-start">
                  <div className="bg-primary-50 p-3 rounded-lg mr-4">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technology Behind */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-soft p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Behind Moodie</h2>
          <p className="text-gray-600 mb-6">
            Moodie is powered by advanced AI technology, including Groq API and Mixtral models. These technologies
            enable Moodie to understand context, provide relevant responses, and maintain conversation flow in a 
            natural, human-like way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center">
              <div className="bg-gray-50 rounded-lg p-6 inline-block mb-2">
                <Cpu size={32} className="text-primary-500 mx-auto" />
              </div>
              <h3 className="font-medium text-gray-800">Groq API</h3>
              <p className="text-sm text-gray-500">Ultra-fast response time</p>
            </div>
            <div className="flex-1 text-center">
              <div className="bg-gray-50 rounded-lg p-6 inline-block mb-2">
                <MessageCircle size={32} className="text-primary-500 mx-auto" />
              </div>
              <h3 className="font-medium text-gray-800">Mixtral</h3>
              <p className="text-sm text-gray-500">Advanced language understanding</p>
            </div>
            <div className="flex-1 text-center">
              <div className="bg-gray-50 rounded-lg p-6 inline-block mb-2">
                <Shield size={32} className="text-primary-500 mx-auto" />
              </div>
              <h3 className="font-medium text-gray-800">Privacy-First</h3>
              <p className="text-sm text-gray-500">End-to-end encryption</p>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-200 rounded-xl p-8 mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Important Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            <strong>Moodie is not a replacement for professional therapy or medical advice.</strong>
          </p>
          <p className="text-gray-600">
            While Moodie can help with journaling, reflection, and providing a supportive space to express yourself,
            it is not designed to diagnose or treat any medical or psychological conditions. If you're experiencing
            severe mental health challenges, please reach out to a qualified healthcare professional.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start your journey?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of others who have found a supportive AI companion in Moodie.
            Start chatting, journaling, and tracking your moods today.
          </p>
          <Button 
            to="/chat" 
            variant="primary" 
            size="lg"
          >
            Talk to Moodie Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;