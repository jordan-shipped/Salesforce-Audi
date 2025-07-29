import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AccordionCard, FindingDetails } from '../index';
import { api } from '../../services/apiService';
import { logger } from '../../utils/cleanup';
import Card from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';

// Helper functions for pill styling
const getDomainStyle = (domain) => {
  switch (domain?.toUpperCase()) {
    case 'DATA QUALITY':
      return { backgroundColor: '#E5F2FF', color: '#007AFF' };
    case 'AUTOMATION':
      return { backgroundColor: '#F3E5F5', color: '#7B1FA2' };
    case 'SECURITY':
      return { backgroundColor: '#FFF3E0', color: '#E65100' };
    case 'REPORTING':
      return { backgroundColor: '#E8F4EA', color: '#2E7D32' };
    default:
      return { backgroundColor: '#F5F5F5', color: '#666666' };
  }
};

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return { backgroundColor: '#FFEBEE', color: '#D32F2F' };
    case 'medium':
      return { backgroundColor: '#FFF7E0', color: '#FFD60A' };
    case 'low':
      return { backgroundColor: '#E8F4EA', color: '#34C759' };
    default:
      return { backgroundColor: '#F5F5F5', color: '#666666' };
  }
};

const SummaryCard = ({ title, value }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      flex: 1,
      height: '96px',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#111111',
        marginBottom: '4px',
        lineHeight: '1.2'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: '400',
        color: '#666666',
        lineHeight: '1.2'
      }}>
        {title}
      </div>
    </div>
  );
};

const AuditResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditStatus, setAuditStatus] = useState('loading');

  // Load audit data
  const loadAuditData = async () => {
    try {
      const response = await api.getAuditData(sessionId);
      const status = response.status || 'completed';
      
      setAuditStatus(status);
      setAuditData(response);
      
      if (status === 'completed' || status === 'error') {
        setLoading(false);
      }
      
      logger.info('Audit data loaded:', response);
    } catch (error) {
      logger.error('Failed to load audit data:', error);
      setError('Failed to load audit results. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [sessionId]);

  const handleGeneratePDF = async () => {
    try {
      const pdfBlob = await api.generatePDF(sessionId);
      
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salesforce-audit-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error('PDF generation failed:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  if (loading || auditStatus === 'processing') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F2F2F7', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center', 
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <LoadingSpinner size="large" message="Processing your audit..." />
          <p style={{ 
            marginTop: '1.5rem', 
            color: '#8E8E93', 
            fontSize: '0.9375rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}>
            This may take up to 60 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F2F2F7', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center', 
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#FFEBEE',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#F44336' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '1.375rem', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            marginBottom: '0.75rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            Error Loading Results
          </h2>
          <p style={{ 
            color: '#8E8E93', 
            marginBottom: '2rem',
            fontSize: '1.0625rem',
            lineHeight: '1.5',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              padding: '0.875rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              boxShadow: '0 4px 16px rgba(0, 122, 255, 0.24)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, findings = [], business_stage: businessStage, session } = auditData || {};
  const orgName = session?.org_name || 'Your Organization';
  
  const findingsCount = summary?.total_findings || 0;
  const timeSavings = summary?.total_time_savings_hours || 0;
  const annualROI = summary?.total_annual_roi || 0;

  return (
    <>
      {/* Pure White Navigation Bar - Full Width */}
      <nav style={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f5f5f7',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '400', 
            color: '#333333',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}>
            Connected to Salesforce
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FF3B30',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}
        >
          Disconnect
        </button>
      </nav>

      {/* Container - 1120px max-width, 24px padding, grey background */}
      <div style={{ 
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '0 24px',
        backgroundColor: '#f5f5f7',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {/* Back Button - 14px #666, 24px margin-bottom */}
        <div style={{ 
          paddingTop: '24px'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              color: '#666666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>
        </div>

        {/* Page Header - 24px/600, 24px margin-bottom */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111111',
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            Audit Results
          </h1>
        </div>

        {/* Summary Cards - Align with finding cards, even spacing */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <SummaryCard 
            title="Findings" 
            value={findingsCount.toString()} 
          />
          <SummaryCard 
            title="Time Savings" 
            value={`${timeSavings} h/mo`} 
          />
          <SummaryCard 
            title="ROI" 
            value={`$${annualROI.toLocaleString()}/yr`} 
          />
        </div>

        {/* Detailed Findings Section */}
        <div style={{ paddingBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111111',
            margin: '0 0 16px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            Detailed Findings
          </h2>

          {/* Individual Finding Cards - 24px gaps */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px' 
          }}>
            {findings.map((finding, index) => (
              <div
                key={finding.id || index}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <AccordionCard
                  title={finding.title || `Finding ${index + 1}`}
                  domain={finding.domain || 'GENERAL'}
                  priority={finding.impact || finding.priority || 'MEDIUM'}
                  cost={`$${(finding.total_annual_roi || finding.roi_estimate || 0).toLocaleString()}/yr`}
                >
                  <FindingDetails finding={finding} />
                </AccordionCard>
              </div>
            ))}
          </div>

          {findings.length === 0 && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '48px 24px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#f5f5f7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#666666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111111',
                margin: '0 0 8px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
              }}>
                No findings available
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666666',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
              }}>
                The audit results are still being processed or no issues were found in your Salesforce org.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuditResults;