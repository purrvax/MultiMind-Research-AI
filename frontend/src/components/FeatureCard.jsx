import React from 'react';
import './FeatureCard.css';

const FeatureCard = ({ title, description, icon: Icon, colorClass }) => {
  return (
    <div className={`feature-card glass ${colorClass}`}>
      {/* Icon Wrapper */}
      <div className="feature-icon-wrapper">
        <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
      </div>

      {/* Title */}
      <h3 className="feature-title">{title}</h3>

      {/* Description */}
      <p className="feature-description">{description}</p>
    </div>
  );
};

export default FeatureCard;
