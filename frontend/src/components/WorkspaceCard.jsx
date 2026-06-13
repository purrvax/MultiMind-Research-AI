import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './WorkspaceCard.css';

const WorkspaceCard = ({ title, description, path, icon: Icon, colorClass, paper }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path, { state: { paper } });
  };

  return (
    <button
      onClick={handleClick}
      className={`workspace-item-card glass ${colorClass}`}
    >
      {/* Decorative ambient bubble background */}
      <div 
        style={{
          position: 'absolute',
          top: '-2.5rem',
          right: '-2.5rem',
          width: '6rem',
          height: '6rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          filter: 'blur(16px)',
          pointerEvents: 'none'
        }}
      />

      {/* Header Row */}
      <div className="workspace-card-top">
        {/* Icon Circle */}
        <div className="workspace-icon-box">
          <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
      </div>
      {/* Body Content */}
      <div className="workspace-card-bottom">
        <h3 className="workspace-card-title">{title}</h3>
        <p className="workspace-card-desc">{description}</p>
      </div>
    </button>
  );
};

export default WorkspaceCard;
