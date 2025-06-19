'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { FeatureCard } from './FeatureCard';
import { StepCard } from './StepCard';
import { HeroSection } from './HeroSection';
import { 
  Rocket, 
  Zap, 
  Box, 
  Trophy, 
  Users as UsersIcon, 
  ThumbsUp, 
  Monitor, 
  ShoppingBag, 
  Star, 
  Sparkles, 
  FolderPlus, 
  FileSearch, 
  Mail, 
  ListChecks, 
  BookOpen 
} from 'lucide-react';

export const HomePage = () => {
  const features = [
    {
      icon: Rocket,
      title: 'Lightning Fast',
      description: 'Access your resources instantly with our optimized platform.'
    },
    {
      icon: Zap,
      title: 'Easy to Use',
      description: 'Intuitive interface that makes organizing a breeze.'
    },
    {
      icon: Box,
      title: 'All in One Place',
      description: 'Keep all your important links organized in one secure location.'
    },
    {
      icon: Trophy,
      title: 'Powerful Features',
      description: 'Advanced tools to manage and categorize your resources.'
    },
    {
      icon: UsersIcon,
      title: 'Collaborate',
      description: 'Share and collaborate on resources with your team.'
    },
    {
      icon: ThumbsUp,
      title: 'Reliable',
      description: 'Built with the latest technologies for maximum reliability.'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Sign Up',
      description: 'Create your free account in seconds.'
    },
    {
      number: 2,
      title: 'Add Links',
      description: 'Save your favorite websites and resources.'
    },
    {
      number: 3,
      title: 'Organize',
      description: 'Categorize and tag your links for easy access.'
    },
    {
      number: 4,
      title: 'Access Anywhere',
      description: 'Your resources are available on all your devices.'
    }
  ];

  // Animazione per le sezioni
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Riferimenti per l'animazione
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  
  const isInViewFeatures = useInView(featuresRef, { once: true, amount: 0.2 });
  const isInViewSteps = useInView(stepsRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInViewFeatures || isInViewSteps) {
      controls.start('visible');
    }
  }, [isInViewFeatures, isInViewSteps, controls]);

  return (
    <div className="flex flex-col overflow-hidden">
      <HeroSection />
      
      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        initial="hidden"
        animate={isInViewFeatures ? 'visible' : 'hidden'}
        variants={sectionVariants}
        className="py-20 px-6 relative"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        </div>
        
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Amazing Features
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Everything you need to organize your digital life
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInViewFeatures ? { 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.2 + (index * 0.1),
                    duration: 0.5,
                    ease: "easeOut"
                  }
                } : {}}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        ref={stepsRef}
        initial="hidden"
        animate={isInViewSteps ? 'visible' : 'hidden'}
        variants={sectionVariants}
        className="py-20 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/10" />
          <div className="absolute inset-0 bg-dot-white/[0.05]" />
        </div>
        
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Get started in just a few simple steps
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInViewSteps ? { 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.2 + (index * 0.1),
                    duration: 0.5,
                    ease: "easeOut"
                  }
                } : {}}
              >
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
