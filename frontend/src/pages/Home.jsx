import React from 'react';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import { Compass, Sparkles, Layers, MessageSquare, Star, SpaceIcon, SparklesIcon, Lamp, LampDesk, Layers2, LucideLayers3 } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      title: "Explore Paper",
      description: "Explore research papers in domains like machine learning, AI, and computer vision with ease.",
      icon: Compass,
      colorClass: "cyan",
    },
    {
      title: "Smart Summaries",
      description: "Instantly summarize complex methodologies, findings, and contributions into clear, high-level language using AI.",
      icon: Sparkles,
      colorClass: "pink",
    },
    {
      title: "Flashcard Generation",
      description: "Convert key definitions, parameters, and results into interactive 3D-flipping flashcards for efficient study and memory retention.",
      icon: LucideLayers3,
      colorClass: "blue",
    },
    {
      title: "Interactive Q&A",
      description: "Interact directly with your research papers using a chat assistant to clear up doubts and extract specific information.",
      icon: MessageSquare,
      colorClass: "purple",
    },
  ];

  return (
    <div className="main-content" style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Hero />
      {/* Feature Section */}
      <section className="features-section">
        {/* Feature Cards Grid */}
        <div className="features-grid">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              colorClass={feature.colorClass}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
