import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const isControlled = controlledExpanded !== undefined && onToggle;

  const handleToggle = () => {
    if (isControlled) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Enhanced priority colors and styling
  const getPriorityStyle = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'high':
        return {
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
          border: '1px solid #FFCDD2'
        };
      case 'medium':
        return {
          backgroundColor: '#FFF8E1',
          color: '#F57C00',
          border: '1px solid #FFE082'
        };
      case 'low':
        return {
          backgroundColor: '#E8F5E8',
          color: '#2E7D32',
          border: '1px solid #A5D6A7'
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          color: '#666',
          border: '1px solid #E0E0E0'
        };
    }
  };

  // Enhanced domain colors
  const getDomainStyle = (domain) => {
    const domainUpper = domain?.toUpperCase();
    switch (domainUpper) {
      case 'DATA QUALITY':
        return {
          backgroundColor: '#E3F2FD',
          color: '#1565C0',
          border: '1px solid #BBDEFB'
        };
      case 'AUTOMATION':
        return {
          backgroundColor: '#F3E5F5',
          color: '#7B1FA2',
          border: '1px solid #CE93D8'
        };
      case 'SECURITY':
        return {
          backgroundColor: '#FFF3E0',
          color: '#E65100',
          border: '1px solid #FFCC02'
        };
      case 'REPORTING':
        return {
          backgroundColor: '#E8F5E8',
          color: '#2E7D32',
          border: '1px solid #A5D6A7'
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          color: '#666',
          border: '1px solid #E0E0E0'
        };
    }
  };

  const priorityStyle = getPriorityStyle(priority);
  const domainStyle = getDomainStyle(domain);

  return (
    <div 
      className={`card-hover animate-in slide-in-from-bottom-4 duration-300 ${className}`}
      style={{
        borderRadius: '16px',
        boxShadow: isExpanded ? '0 8px 32px rgba(0, 0, 0, 0.08)' : '0 2px 16px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      <button
        onClick={handleToggle}
        style={{
          width: '100%',
          padding: '1.75rem 2rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          {/* Domain Badge */}
          <span
            style={{
              ...domainStyle,
              padding: '0.375rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.6875rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
            }}
          >
            {domain}
          </span>

          {/* Title */}
          <h3 className="text-body-large font-semibold text-text-primary truncate" style={{
            margin: 0,
            flex: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            lineHeight: '1.4',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            {title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Priority Badge */}
          <span
            style={{
              ...priorityStyle,
              padding: '0.375rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.6875rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
            }}
          >
            {priority}
          </span>

          {/* Cost */}
          <span style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#007AFF',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            {cost}
          </span>

          {/* Expand/Collapse Icon */}
          <ChevronDown 
            style={{
              width: '20px',
              height: '20px',
              color: '#8E8E93',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </button>

      {isExpanded && (
        <div 
          style={{
            padding: '0 2rem 2rem 2rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: '#FAFAFA',
            animation: 'expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {children ? (
            children
          ) : (
            <>
              {details && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.75rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                  }}>
                    Details
                  </h4>
                  <p style={{
                    fontSize: '0.9375rem',
                    color: '#3C3C43',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                  }}>
                    {details}
                  </p>
                </div>
              )}
              
              {implementation && (
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.75rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                  }}>
                    Implementation
                  </h4>
                  <p style={{
                    fontSize: '0.9375rem',
                    color: '#3C3C43',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
                  }}>
                    {implementation}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes expandIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AccordionCard;