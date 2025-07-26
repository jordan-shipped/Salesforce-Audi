import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AccordionCard = ({ 
  domain, 
  title, 
  cost, 
  priority, 
  details,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'var(--color-priority-high)';
      case 'medium': return 'var(--color-priority-medium)';
      case 'low': return 'var(--color-priority-low)';
      default: return 'var(--color-priority-low)';
    }
  };

  const getDomainColor = (domain) => {
    const colors = {
      'data quality': '#007AFF',
      'automation': '#34C759', 
      'security': '#FF3B30',
      'reporting': '#FF9500',
      'adoption': '#5856D6'
    };
    return colors[domain?.toLowerCase()] || '#007AFF';
  };

  return (
    <div className={`AccordionCard ${className}`}>
      <div 
        className="AccordionHeader"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="AccordionHeaderLeft">
          <span 
            className="DomainBadge"
            style={{ backgroundColor: getDomainColor(domain) }}
          >
            {domain?.toUpperCase()}
          </span>
          <span className="Title">{title}</span>
        </div>
        
        <div className="AccordionHeaderRight">
          <span 
            className="PriorityPill"
            style={{ backgroundColor: getPriorityColor(priority) }}
          >
            {priority?.toUpperCase()}
          </span>
          <span className="Cost">{cost}</span>
          <div className="ExpandIcon">
            {isExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="AccordionContent">
          {typeof details === 'string' ? (
            <p>{details}</p>
          ) : (
            <div>
              {details?.description && <p>{details.description}</p>}
              {details?.breakdown && (
                <div className="DetailsBreakdown">
                  <h4>Cost Breakdown:</h4>
                  <ul>
                    {details.breakdown.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {details?.implementation && (
                <div className="DetailsImplementation">
                  <h4>Implementation:</h4>
                  <p>{details.implementation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccordionCard;