import React, { useState } from 'react';

const AccordionCard = ({ 
  title,
  domain,
  priority,
  cost,
  details,
  implementation,
  children,
  isExpanded: controlledExpanded,
  onToggle,
  className = ''
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Use controlled expansion if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Priority styling
  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  return (
    <div className={`accordion-card ${className}`}>
      <button 
        className="accordion-header w-full" 
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className="accordion-header-left">
          <span className="domain-badge">
            {domain}
          </span>
          <span className="text-body-medium font-medium text-text-primary truncate">
            {title}
          </span>
        </div>
        
        <div className="accordion-header-right">
          <span className={getPriorityClasses(priority)}>
            {priority}
          </span>
          <span className="text-body-large font-semibold text-text-primary">
            {cost}
          </span>
          <div className={`w-6 h-6 flex items-center justify-center transform transition-transform duration-fast ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-text-grey-300">
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-lg pt-md border-t border-border-subtle">
          {children ? (
            children
          ) : (
            <>
              {details && (
                <div className="mb-md">
                  <h4 className="text-body-medium font-semibold text-text-primary mb-2">
                    Details
                  </h4>
                  <p className="text-body-regular text-text-grey-600 leading-relaxed">
                    {details}
                  </p>
                </div>
              )}
              
              {implementation && (
                <div>
                  <h4 className="text-body-medium font-semibold text-text-primary mb-2">
                    Implementation
                  </h4>
                  <p className="text-body-regular text-text-grey-600 leading-relaxed">
                    {implementation}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AccordionCard;