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
          <span className="DomainBadge">
            {domain?.toUpperCase()}
          </span>
          <span className="Title">{title}</span>
        </div>
        
        <div className="AccordionHeaderRight">
          <span className="PriorityPill">
            {priority?.toUpperCase()}
          </span>
          <span className="Cost">{cost}</span>
          <div className="ExpandIcon">
            {isExpanded ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
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